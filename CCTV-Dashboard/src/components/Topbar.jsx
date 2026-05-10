import { useLocation } from "react-router-dom";

const PATH_META = {
  "/":          { title: "Overview" },
  "/live":      { title: "Live Feed" },
  "/analytics": { title: "Analytics" },
  "/logs":      { title: "Detection Log" },
  "/alerts":    { title: "Alerts" },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const meta = PATH_META[pathname] || { title: "Dashboard" };

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="topbar-shell">
      <h1 className="topbar-title">{meta.title}</h1>
      <div className="topbar-side">
        <div className="status-chip">
          <span className="status-dot" />
          System online
        </div>
        <div className="timestamp-card">
          <span>{formattedDate}</span>
          <strong>{now.toLocaleTimeString("en-IN")}</strong>
        </div>
      </div>
    </header>
  );
}