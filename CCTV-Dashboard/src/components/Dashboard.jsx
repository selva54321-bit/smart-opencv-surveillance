import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Dashboard({ logs, onLogout }) {
  return (
    <div className="app-shell">
      <Sidebar logs={logs} onLogout={onLogout} />
      <div className="main-shell">
        <Topbar />
        <main className="content-shell">
          <Outlet context={{ logs }} />
        </main>
      </div>
    </div>
  );
}
