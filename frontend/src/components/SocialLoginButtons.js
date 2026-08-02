import React, { useState } from "react";
import { Github } from "lucide-react";

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.28a12 12 0 0 0 0 10.8z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
    </svg>
  );
}

/**
 * Google / GitHub buttons for the auth pages. The backend doesn't have
 * OAuth wired up yet, so these surface an honest "coming soon" note
 * instead of pretending to authenticate.
 */
export default function SocialLoginButtons() {
  const [notice, setNotice] = useState("");

  const handleClick = (provider) => {
    setNotice(`${provider} sign-in is coming soon — use email for now.`);
    window.clearTimeout(handleClick._t);
    handleClick._t = window.setTimeout(() => setNotice(""), 3500);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleClick("Google")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-4 py-2.5 text-sm font-medium text-navy-700 dark:text-gray-200 hover:bg-navy-50 dark:hover:bg-navy-800 hover:border-navy-300 transition-colors"
        >
          <GoogleIcon /> Google
        </button>
        <button
          type="button"
          onClick={() => handleClick("GitHub")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-4 py-2.5 text-sm font-medium text-navy-700 dark:text-gray-200 hover:bg-navy-50 dark:hover:bg-navy-800 hover:border-navy-300 transition-colors"
        >
          <Github size={17} /> GitHub
        </button>
      </div>
      {notice && <p className="mt-2 text-xs text-navy-400 text-center">{notice}</p>}
    </div>
  );
}