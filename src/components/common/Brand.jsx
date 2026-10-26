import React from "react";

export default function Brand({ compact = false }) {
  return (
    <span className={`forge-brand ${compact ? "is-compact" : ""}`}>
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M3 8 16 1l13 7v16l-13 7L3 24V8Z" fill="currentColor" />
        <path d="m10 10 12 6-12 6v-5l5-1-5-1v-5Z" fill="#11150d" />
      </svg>
      <span>
        GameSkin<span className="forge-brand-ai">AI</span>
        <small>CHARACTER LAB</small>
      </span>
    </span>
  );
}
