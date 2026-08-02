import React from "react";

/**
 * Text input with a floating label — the label sits inside the field until
 * the user focuses or types, then it lifts above the border. Also carries
 * a garnet focus-ring border to match the auth pages' visual language.
 */
export default function FloatingInput({ label, type = "text", className = "", ...props }) {
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        placeholder=" "
        className="peer w-full rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3.5 pt-5 pb-2 text-sm text-navy-900 dark:text-gray-100 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-garnet-400/50 focus:border-garnet-400 transition-all"
        {...props}
      />
      <label
        className="absolute left-3.5 top-3.5 text-sm text-navy-400 dark:text-navy-400 transition-all duration-150 pointer-events-none
          peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-garnet-500 peer-focus:font-medium
          peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-navy-500 dark:peer-[:not(:placeholder-shown)]:text-navy-300"
      >
        {label}
      </label>
    </div>
  );
}