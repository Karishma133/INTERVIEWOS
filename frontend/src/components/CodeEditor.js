import React from "react";

// A lightweight code editor (plain textarea) so the project has zero
// dependency on paid/external editor services. Can be swapped later for
// Monaco or CodeMirror if desired.
export default function CodeEditor({ value, onChange, height = 320 }) {
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue = value.substring(0, selectionStart) + "  " + value.substring(selectionEnd);
      onChange(newValue);
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      });
    }
  };

  return (
    <textarea
      className="w-full font-mono text-sm p-4 rounded-xl border border-gray-800 bg-gray-900 text-gray-100 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-card"
      style={{ height }}
      value={value}
      spellCheck={false}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}
