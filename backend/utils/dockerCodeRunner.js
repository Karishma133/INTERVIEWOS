/**
 * dockerCodeRunner.js
 * -----------------------------------------------------------------------
 * "Distributed Docker Sandbox Execution" — runs submitted code inside a
 * short-lived, resource-limited Docker container (no network access, a
 * memory cap, and a CPU cap) instead of a raw child_process on the host.
 * This is the "enterprise-grade" execution path: genuinely stronger
 * isolation than child_process, since a container can't see the host
 * filesystem or other processes at all.
 *
 * IMPORTANT — HONEST LIMITATION: this requires Docker Desktop (or the
 * Docker Engine) to be installed and RUNNING on the machine this server
 * runs on. `npm install` alone does not install Docker itself — Docker
 * is a separate application you download from docker.com. If Docker
 * isn't available, or `USE_DOCKER_SANDBOX` isn't set to "true" in
 * `.env`, this module is simply never used — the existing
 * `codeRunner.js` (child_process based, always works out of the box)
 * remains the default execution path. Nothing breaks either way.
 * -----------------------------------------------------------------------
 */

let Docker;
try {
  Docker = require("dockerode");
} catch (e) {
  Docker = null;
}

const docker = Docker ? new Docker() : null;

const IMAGE_FOR_LANGUAGE = {
  javascript: "node:20-alpine",
  python: "python:3.11-alpine",
};

async function isDockerAvailable() {
  if (!docker) return false;
  try {
    await docker.ping();
    return true;
  } catch (e) {
    return false;
  }
}

async function runInDocker({ harnessCode, language, timeoutMs }) {
  const image = IMAGE_FOR_LANGUAGE[language];
  if (!image) throw new Error(`No Docker image configured for language: ${language}`);

  const runCmd = language === "python" ? ["python", "-c", harnessCode] : ["node", "-e", harnessCode];

  const container = await docker.createContainer({
    Image: image,
    Cmd: runCmd,
    NetworkDisabled: true,
    HostConfig: {
      Memory: 128 * 1024 * 1024,
      NanoCpus: 500000000,
      AutoRemove: true,
      ReadonlyRootfs: true,
    },
    Tty: false,
  });

  let stdout = "";
  let timedOut = false;

  const stream = await container.attach({ stream: true, stdout: true, stderr: true });
  const timeoutHandle = setTimeout(async () => {
    timedOut = true;
    try { await container.stop({ t: 0 }); } catch (e) { /* already stopped */ }
  }, timeoutMs);

  await container.start();

  await new Promise((resolve) => {
    container.modem.demuxStream(
      stream,
      { write: (chunk) => { stdout += chunk.toString(); } },
      { write: () => {} }
    );
    stream.on("end", resolve);
  });

  clearTimeout(timeoutHandle);
  return { stdout, timedOut };
}

module.exports = { isDockerAvailable, runInDocker, IMAGE_FOR_LANGUAGE };
