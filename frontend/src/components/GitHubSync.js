import React, { useState } from "react";

const GITHUB_API = "https://api.github.com";

/**
 * One-Click GitHub Sync — pushes an accepted solution straight to the
 * user's own GitHub repo.
 *
 * IMPORTANT design choice: the GitHub Personal Access Token is entered
 * by the user, kept ONLY in their browser's localStorage, and used to
 * call the GitHub REST API directly from the browser. It is never sent
 * to the InterviewOS backend. This avoids needing to register/host an
 * OAuth App (with a client secret) just for this feature.
 */
export default function GitHubSync({ question, code, language }) {
  const [token, setToken] = useState(() => localStorage.getItem("io_github_token") || "");
  const [repo, setRepo] = useState(() => localStorage.getItem("io_github_repo") || "");
  const [status, setStatus] = useState("");
  const [pushing, setPushing] = useState(false);
  const [showSetup, setShowSetup] = useState(!localStorage.getItem("io_github_token"));

  const saveCredentials = () => {
    localStorage.setItem("io_github_token", token);
    localStorage.setItem("io_github_repo", repo);
    setShowSetup(false);
    setStatus("Saved. You can now push solutions.");
  };

  const filePath = () => {
    const ext = language === "python" ? "py" : "js";
    const safeTitle = question.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `solutions/${question.topic}/${safeTitle}.${ext}`;
  };

  const pushToGitHub = async () => {
    if (!token || !repo) { setShowSetup(true); return; }
    setPushing(true);
    setStatus("Pushing...");
    try {
      const path = filePath();
      const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;

      let sha;
      const existing = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (existing.ok) {
        const data = await existing.json();
        sha = data.sha;
      }

      const content = btoa(unescape(encodeURIComponent(
        `// ${question.title} (${question.difficulty} · ${question.topic})\n// Solved on InterviewOS — ${new Date().toISOString().slice(0, 10)}\n\n${code}`
      )));

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Solve: ${question.title} (${question.difficulty})`,
          content,
          sha,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `GitHub API error (${res.status})`);
      }

      setStatus(`✅ Pushed to ${repo}/${path}`);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setPushing(false);
    }
  };

  if (showSetup) {
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🐙 Connect GitHub</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Create a <a href="https://github.com/settings/tokens/new?scopes=repo&description=InterviewOS" target="_blank" rel="noreferrer" className="text-primary-600 underline">
            Personal Access Token
          </a> with "repo" scope. It's stored only in your browser, never sent to InterviewOS's server.
        </p>
        <div className="space-y-2">
          <input className="input" placeholder="GitHub token (ghp_...)" type="password"
            value={token} onChange={(e) => setToken(e.target.value)} />
          <input className="input" placeholder="owner/repo (e.g. karishma/dsa-solutions)"
            value={repo} onChange={(e) => setRepo(e.target.value)} />
          <button onClick={saveCredentials} className="btn-primary w-full">Save & Connect</button>
        </div>
        {status && <p className="text-xs text-gray-500 mt-2">{status}</p>}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">🐙 GitHub Sync</h3>
        <button onClick={() => setShowSetup(true)} className="text-xs text-gray-400 hover:text-primary-600">Change repo</button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Will push to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{repo}/{filePath()}</code></p>
      <button onClick={pushToGitHub} disabled={pushing} className="btn-primary w-full">
        {pushing ? "Pushing..." : "⬆️ Push Solution to GitHub"}
      </button>
      {status && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{status}</p>}
    </div>
  );
}
