import React from "react";
export default function StatCard({ label, value, meta, icon, tone="" }) {
  return <div className={`stat-card ${tone}`}>
    <div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>
  </div>
}