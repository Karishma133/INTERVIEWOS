/**
 * codeRunner.js
 * -----------------------------------------------------------------------
 * Runs USER SUBMITTED code (JavaScript or Python) against a set of test
 * cases WITHOUT calling any external AI/LLM API. Multi-language support:
 * a language-specific "harness" script is generated, written to a temp
 * file, and executed in its own child process with a hard timeout.
 * -----------------------------------------------------------------------
 */

const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { isDockerAvailable, runInDocker } = require("./dockerCodeRunner");

const DEFAULT_TIMEOUT_MS = Number(process.env.CODE_TIMEOUT_MS) || 3000;
const RESULT_MARKER = "__SKILLFORGE_RESULT__";

function buildJsHarness(userCode, functionName, testCases) {
  return `
"use strict";
const { performance } = require("perf_hooks");

// ---- USER CODE START ----
${userCode}
// ---- USER CODE END ----

const __testCases = ${JSON.stringify(testCases)};
const __results = [];
let __totalTimeMs = 0;

function __deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

for (let i = 0; i < __testCases.length; i++) {
  const tc = __testCases[i];
  const args = Array.isArray(tc.input) ? tc.input : [tc.input];
  let actual, errorMsg = null;
  const start = performance.now();
  try {
    if (typeof ${functionName} !== "function") {
      throw new Error("Function '${functionName}' is not defined. Did you name it correctly?");
    }
    actual = ${functionName}(...args);
  } catch (e) {
    errorMsg = e.message;
  }
  const timeTaken = performance.now() - start;
  __totalTimeMs += timeTaken;

  __results.push({
    index: i,
    passed: errorMsg === null && __deepEqual(actual, tc.expectedOutput),
    actual: errorMsg === null ? actual : undefined,
    error: errorMsg,
    timeMs: Number(timeTaken.toFixed(3)),
    isHidden: !!tc.isHidden,
  });
}

const memUsedKB = Math.round(process.memoryUsage().heapUsed / 1024);

console.log("${RESULT_MARKER}" + JSON.stringify({
  results: __results,
  totalTimeMs: Number(__totalTimeMs.toFixed(3)),
  memoryUsedKB: memUsedKB,
}));
`;
}

function buildPythonHarness(userCode, functionName, testCases) {
  // tracemalloc works cross-platform (unlike the `resource` module, which
  // is POSIX-only and would break on Windows).
  return `
import json, time, tracemalloc, sys

# ---- USER CODE START ----
${userCode}
# ---- USER CODE END ----

__test_cases = json.loads(${JSON.stringify(JSON.stringify(testCases))})
__results = []
__total_time_ms = 0.0

tracemalloc.start()

for i, tc in enumerate(__test_cases):
    args = tc["input"] if isinstance(tc["input"], list) else [tc["input"]]
    actual = None
    error_msg = None
    start = time.perf_counter()
    try:
        if "${functionName}" not in dir() or not callable(${functionName}):
            raise NameError("Function '${functionName}' is not defined. Did you name it correctly?")
        actual = ${functionName}(*args)
    except Exception as e:
        error_msg = str(e)
    elapsed_ms = (time.perf_counter() - start) * 1000
    __total_time_ms += elapsed_ms

    passed = error_msg is None and json.dumps(actual) == json.dumps(tc["expectedOutput"])
    __results.append({
        "index": i,
        "passed": passed,
        "actual": actual if error_msg is None else None,
        "error": error_msg,
        "timeMs": round(elapsed_ms, 3),
        "isHidden": bool(tc.get("isHidden", False)),
    })

_, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()
mem_used_kb = round(peak / 1024)

print("${RESULT_MARKER}" + json.dumps({
    "results": __results,
    "totalTimeMs": round(__total_time_ms, 3),
    "memoryUsedKB": mem_used_kb,
}))
`;
}

const LANGUAGE_CONFIG = {
  javascript: { ext: ".js", build: buildJsHarness, binary: process.execPath },
  python: { ext: ".py", build: buildPythonHarness, binary: process.platform === "win32" ? "python" : "python3" },
};

/**
 * Runs code and returns:
 * {
 *   status: "Passed" | "Failed" | "Error" | "Timeout",
 *   testCasesPassed, totalTestCases,
 *   executionTimeMs, memoryUsedKB,
 *   perTestResults: [...],
 *   errorMessage
 * }
 */
function parseHarnessOutput(stdout, totalTestCases) {
  const line = stdout.split("\n").find((l) => l.startsWith(RESULT_MARKER));
  if (!line) throw new Error("No result marker found in output");
  const parsed = JSON.parse(line.slice(RESULT_MARKER.length));

  const passedCount = parsed.results.filter((r) => r.passed).length;
  const allPassed = passedCount === totalTestCases && totalTestCases > 0;

  return {
    status: allPassed ? "Passed" : "Failed",
    testCasesPassed: passedCount,
    totalTestCases,
    executionTimeMs: parsed.totalTimeMs,
    memoryUsedKB: parsed.memoryUsedKB,
    perTestResults: parsed.results,
    errorMessage: allPassed ? "" : parsed.results.find((r) => !r.passed && r.error)?.error || "",
  };
}

/**
 * Optional "enterprise" execution path — genuinely isolated Docker
 * containers instead of a raw child_process. Only attempted if
 * USE_DOCKER_SANDBOX=true in .env AND Docker Desktop is actually
 * installed/running; any failure here silently falls back to the
 * always-available child_process path below, so this never breaks the
 * judge even if Docker isn't set up.
 */
async function tryDockerSandbox({ code, functionName, testCases, timeoutMs, language }) {
  if (process.env.USE_DOCKER_SANDBOX !== "true") return null;
  if (!(language in LANGUAGE_CONFIG)) return null;

  const available = await isDockerAvailable();
  if (!available) return null;

  try {
    const harness = LANGUAGE_CONFIG[language].build(code, functionName, testCases);
    const { stdout, timedOut } = await runInDocker({ harnessCode: harness, language, timeoutMs });

    if (timedOut) {
      return {
        status: "Timeout", testCasesPassed: 0, totalTestCases: testCases.length,
        executionTimeMs: timeoutMs, memoryUsedKB: 0, perTestResults: [],
        errorMessage: `Execution exceeded ${timeoutMs}ms in the Docker sandbox.`,
      };
    }
    return parseHarnessOutput(stdout, testCases.length);
  } catch (err) {
    console.warn("[dockerCodeRunner] Sandbox execution failed, falling back to child_process:", err.message);
    return null; // fall through to child_process path
  }
}

async function runCode({ code, functionName = "solve", testCases = [], timeoutMs = DEFAULT_TIMEOUT_MS, language = "javascript" }) {
  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    return {
      status: "Error", testCasesPassed: 0, totalTestCases: testCases.length,
      executionTimeMs: 0, memoryUsedKB: 0, perTestResults: [],
      errorMessage: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_CONFIG).join(", ")}`,
    };
  }

  const dockerResult = await tryDockerSandbox({ code, functionName, testCases, timeoutMs, language });
  if (dockerResult) return dockerResult;

  const harness = config.build(code, functionName, testCases);
  const tmpFile = path.join(os.tmpdir(), `interviewos_${crypto.randomUUID()}${config.ext}`);
  fs.writeFileSync(tmpFile, harness);

  return new Promise((resolve) => {
    execFile(
      config.binary,
      [tmpFile],
      { timeout: timeoutMs, maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        fs.unlink(tmpFile, () => {});

        if (err && err.killed) {
          return resolve({
            status: "Timeout", testCasesPassed: 0, totalTestCases: testCases.length,
            executionTimeMs: timeoutMs, memoryUsedKB: 0, perTestResults: [],
            errorMessage: `Execution exceeded ${timeoutMs}ms. Check for infinite loops or inefficient logic.`,
          });
        }

        if (err && err.code === "ENOENT") {
          return resolve({
            status: "Error", testCasesPassed: 0, totalTestCases: testCases.length,
            executionTimeMs: 0, memoryUsedKB: 0, perTestResults: [],
            errorMessage: `${config.binary} is not installed or not on PATH. Install ${language} to run ${language} submissions.`,
          });
        }

        if (err && !stdout.includes(RESULT_MARKER)) {
          return resolve({
            status: "Error", testCasesPassed: 0, totalTestCases: testCases.length,
            executionTimeMs: 0, memoryUsedKB: 0, perTestResults: [],
            errorMessage: (stderr || err.message || "Unknown runtime error").split("\n")[0],
          });
        }

        try {
          const result = parseHarnessOutput(stdout, testCases.length);
          resolve(result);
        } catch (parseErr) {
          resolve({
            status: "Error", testCasesPassed: 0, totalTestCases: testCases.length,
            executionTimeMs: 0, memoryUsedKB: 0, perTestResults: [],
            errorMessage: "Could not parse execution result. " + parseErr.message,
          });
        }
      }
    );
  });
}

module.exports = { runCode, LANGUAGE_CONFIG };
