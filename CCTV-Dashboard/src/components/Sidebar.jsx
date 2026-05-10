import { NavLink } from "react-router-dom";
import Icon, { ICONS } from "./Icon";
import { buildSummary, getRetentionWindow } from "../data/mockData";

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview",       icon: ICONS.grid,   path: "/" },
  { id: "live",      label: "Live Feed",       icon: ICONS.camera, path: "/live" },
  { id: "analytics", label: "Analytics",       icon: ICONS.trend,  path: "/analytics" },
  { id: "logs",      label: "Detection Log",   icon: ICONS.list,   path: "/logs" },
  { id: "alerts",    label: "Alerts",          icon: ICONS.alert,  path: "/alerts" },
];

export default function Sidebar({ logs, onLogout }) {
  const summary = buildSummary(logs);

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-header">
        <div className="sidebar-chip">Security Workspace</div>
        <div className="sidebar-brand">
          <div className="sidebar-brand__mark">
            <Icon d={ICONS.camera} size={16} color="currentColor" />
          </div>
          <div>
            <h1 className="sidebar-brand__title">INTEC CCTV</h1>
          </div>
        </div>
      </div>

      <section className="sidebar-highlight">
        <div className="sidebar-highlight__top">
          <h2>{summary.people} people tracked</h2>
          <span className="sidebar-status">Stable</span>
        </div>
        <p className="sidebar-muted">
          {summary.unauthorized + summary.unknown} flagged · peak at {summary.peakHour.label}
        </p>
        <div className="sidebar-inline-stats">
          <div className="sidebar-inline-stat">
            <strong>{summary.total}</strong>
            <span>Detections</span>
          </div>
          <div className="sidebar-inline-stat">
            <strong>{summary.peakHour.label}</strong>
            <span>Peak hour</span>
          </div>
        </div>
      </section>

      <div className="sidebar-section-label">Navigation</div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
          >
            <span className="nav-link__icon">
              <Icon d={item.icon} size={16} color="currentColor" />
            </span>
            <span className="nav-link__meta">
              <strong>{item.label}</strong>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="profile-card">
          <div className="avatar">A</div>
          <div>
            <strong>Admin</strong>
            <div className="sidebar-muted">admin@intec.ac.in</div>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <Icon d={ICONS.logout} size={14} color="currentColor" />
          Sign out
        </button>
      </div>
    </aside>
  );
}