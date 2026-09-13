import React from "react";

export default function Topbar({ setMobileOpen, state }) {
  const xp = state?.xp ?? 0;
  const streak = state?.streak ?? 0;

  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="topbar-title">
        <span className="status-dot" />
        <span>Learning session</span>
      </div>

      <div className="topbar-actions">
        <div className="top-stat">
          🔥 <strong>{streak}</strong>
        </div>

        <div className="top-stat">
          ✦ <strong>{xp} XP</strong>
        </div>

        <div className="avatar">
          J
        </div>
      </div>
    </header>
  );
}