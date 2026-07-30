/**
 * codeHints.js
 * -----------------------------------------------------------------------
 * "AI Code Review & Hint System" — implemented as ALGORITHMIC static
 * analysis of the submitted source text, not a call to an external LLM.
 *
 * Heuristics used:
 * 1. Loop nesting depth -> estimated time complexity (O(1)/O(n)/O(n^2)/O(n^3)+)
 * 2. Recursive self-calls -> flags possible exponential/recursive complexity
 * 3. Data structure usage (Set/Map/Array/Object) -> estimated space complexity
 * 4. Common anti-patterns (nested loops that could use a hash map, repeated
 *    array.indexOf/includes inside a loop, string concatenation in a loop)
 * -----------------------------------------------------------------------
 */

function countMaxLoopNesting(code) {
  const cleaned = code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``");

  const loopKeyword = /\b(for|while)\s*\(/g;
  // Mark the character index right after each loop's condition closes, i.e.
  // where its body begins. We track brace-depth and a stack of booleans
  // (whether the brace level was opened by a loop) to find true nesting.
  const loopStartPositions = new Set();
  let m;
  while ((m = loopKeyword.exec(cleaned)) !== null) {
    // find the matching closing paren for this loop's condition
    let depth = 1;
    let i = loopKeyword.lastIndex; // position right after "("
    while (i < cleaned.length && depth > 0) {
      if (cleaned[i] === "(") depth++;
      else if (cleaned[i] === ")") depth--;
      i++;
    }
    loopStartPositions.add(i); // body starts around here
  }

  const stack = [];
  let currentLoopDepth = 0;
  let maxDepth = 0;

  for (let idx = 0; idx < cleaned.length; idx++) {
    const ch = cleaned[idx];
    if (ch === "{") {
      // Was a loop's body opener immediately preceding this brace?
      const precedingIsLoop = [...loopStartPositions].some((pos) => pos <= idx && idx - pos < 5);
      stack.push(precedingIsLoop);
      if (precedingIsLoop) {
        currentLoopDepth++;
        maxDepth = Math.max(maxDepth, currentLoopDepth);
      }
    } else if (ch === "}") {
      const wasLoop = stack.pop();
      if (wasLoop) currentLoopDepth--;
    }
  }
  return maxDepth;
}

function detectRecursion(code, functionName) {
  const bodyMatch = code.match(new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*{([\\s\\S]*)}`));
  const body = bodyMatch ? bodyMatch[1] : code;
  const callPattern = new RegExp(`\\b${functionName}\\s*\\(`, "g");
  const callCount = (body.match(callPattern) || []).length;
  return callCount > 0;
}

function detectDataStructures(code) {
  const found = [];
  if (/\bnew Map\(/.test(code) || /\bnew Set\(/.test(code)) found.push("Map/Set (hash-based)");
  if (/\[\s*\]/.test(code) || /\bArray\(/.test(code)) found.push("Array");
  if (/{\s*}/.test(code) && !/new Set|new Map/.test(code)) found.push("Object");
  return found;
}

function estimateTimeComplexity(loopDepth, isRecursive) {
  if (isRecursive && loopDepth === 0) return "O(2^n) or O(n) recursive — depends on branching factor";
  if (loopDepth === 0) return "O(1)";
  if (loopDepth === 1) return "O(n)";
  if (loopDepth === 2) return "O(n^2)";
  if (loopDepth >= 3) return `O(n^${loopDepth})`;
  return "Unknown";
}

/**
 * Rule-based Static Application Security Testing (SAST) — a curated set
 * of regex-based anti-pattern checks for common insecure/unsafe coding
 * habits. This is a pattern scanner, not a full taint-analysis engine,
 * but it catches the mistakes interviewers commonly flag.
 */
function detectSecurityIssues(code) {
  const issues = [];

  if (/\beval\s*\(/.test(code)) {
    issues.push({ severity: "High", message: "Use of eval() detected — arbitrary code execution risk. Avoid eval(); parse/validate input explicitly instead." });
  }
  if (/new\s+Function\s*\(/.test(code)) {
    issues.push({ severity: "High", message: "new Function(...) dynamically compiles code from a string — same risk class as eval(). Avoid unless absolutely necessary." });
  }
  if (/\.innerHTML\s*=/.test(code)) {
    issues.push({ severity: "Medium", message: "Assigning to .innerHTML with unsanitized input can lead to XSS. Use textContent or a sanitizer for user-provided strings." });
  }
  if (/child_process|require\(['"]fs['"]\)/.test(code)) {
    issues.push({ severity: "Medium", message: "Filesystem/process access detected — unexpected in a pure algorithm submission. Flag for manual review in a real codebase." });
  }
  if (/Math\.random\(\)/.test(code) && /token|password|secret|key/i.test(code)) {
    issues.push({ severity: "High", message: "Math.random() is not cryptographically secure — never use it to generate tokens, passwords, or secrets. Use crypto.randomBytes() instead." });
  }
  if (/(password|secret|apikey|api_key)\s*=\s*['"][^'"]+['"]/i.test(code)) {
    issues.push({ severity: "High", message: "Hardcoded credential-like string detected — never commit secrets in source code. Use environment variables." });
  }
  if (/while\s*\(\s*true\s*\)/.test(code) && !/break/.test(code)) {
    issues.push({ severity: "Medium", message: "while(true) loop with no visible break — risk of infinite loop / resource exhaustion (denial of service)." });
  }
  if (/\[\s*[a-zA-Z_$][\w$]*\s*\]\s*=\s*[a-zA-Z_$][\w$]*\s*\+\+/.test(code) && /for\s*\(/.test(code) === false) {
    // heuristic: growing an array/object with no visible bound in a loop-free context is unusual; skip false positive noise
  }
  if (/\.push\(/.test(code) && /while\s*\(/.test(code) && !/\.length\s*[<>]=?/.test(code)) {
    issues.push({ severity: "Low", message: "Growing an array with .push() inside a while loop with no visible length/bound check — possible unbounded memory growth (memory leak risk)." });
  }

  return issues;
}

function reviewCode(code, functionName = "solve") {
  const loopDepth = countMaxLoopNesting(code);
  const isRecursive = detectRecursion(code, functionName);
  const dataStructures = detectDataStructures(code);
  const timeComplexity = estimateTimeComplexity(loopDepth, isRecursive);
  const securityIssues = detectSecurityIssues(code);

  const hints = [];

  if (loopDepth >= 2) {
    hints.push(
      `Detected ${loopDepth} nested loops (≈ ${timeComplexity}). If you're checking pairs/duplicates, consider a Set or Map to reduce this to O(n).`
    );
  }
  if (isRecursive && !/memo|cache|dp\[/i.test(code)) {
    hints.push("Recursive calls detected without memoization — if the same inputs repeat, consider caching results (memoization) to avoid recomputation.");
  }
  if (/\.indexOf\(|\.includes\(/.test(code) && loopDepth >= 1) {
    hints.push("Using .indexOf()/.includes() inside a loop can silently add an extra O(n) factor — a Set lookup is O(1) average.");
  }
  if (/\+=\s*['"`]/.test(code) && loopDepth >= 1) {
    hints.push("String concatenation inside a loop can be O(n^2) in the worst case — consider building an array and using .join() instead.");
  }
  if (dataStructures.length === 0 && loopDepth <= 1) {
    hints.push("Solution looks straightforward — good baseline. Consider edge cases like empty input or duplicates.");
  }
  if (hints.length === 0) {
    hints.push("Complexity looks reasonable for this approach.");
  }

  return {
    estimatedTimeComplexity: timeComplexity,
    loopNestingDepth: loopDepth,
    isRecursive,
    dataStructuresUsed: dataStructures,
    hints,
    securityIssues,
  };
}

module.exports = { reviewCode, detectSecurityIssues };
