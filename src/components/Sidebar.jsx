import React from "react";

export default function Sidebar({
  page,
  setPage,
  mobileOpen,
  setMobileOpen
}) {
  const items = [
    { id: "home", icon: "⌂", label: "Home" },
    { id: "path", icon: "◈", label: "Learning Path" },
    { id: "lesson", icon: "▣", label: "Lessons" },
    { id: "tutor", icon: "✦", label: "AI Tutor" },
    { id: "conversation", icon: "◉", label: "Conversation" },
    { id: "vocab", icon: "◇", label: "Vocabulary" },
    { id: "analytics", icon: "⌁", label: "Analytics" }
  ];

  const secondary = [
    { id: "achievements", icon: "★", label: "Achievements" },
    { id: "profile", icon: "◎", label: "Profile" },
    { id: "settings", icon: "⚙", label: "Settings" }
  ];

  const navigate = (id) => {
    setPage(id);
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">N</div>

          <div>
            <div className="brand-name">Novara</div>
            <div className="brand-subtitle">AI Language OS</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-label">LEARN</div>

          {items.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                page === item.id ? "active" : ""
              }`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="nav-label secondary-label">MORE</div>

          {secondary.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                page === item.id ? "active" : ""
              }`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-mini">
            <span>🔥</span>
            <div>
              <strong>7 day streak</strong>
              <small>Keep learning!</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}