import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { S } from "../styles/styles.js";

import OverviewPage  from "../pages/OverviewPage";
import LiveFeedPage  from "../pages/LiveFeedPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import LogsPage      from "../pages/LogsPage";
import AlertsPage    from "../pages/AlertsPage";

export default function Dashboard({ page, setPage, logs, onLogout }) {
  const renderPage = () => {
    switch (page) {
      case "dashboard": return <OverviewPage  logs={logs} />;
      case "live":      return <LiveFeedPage  logs={logs} />;
      case "analytics": return <AnalyticsPage />;
      case "logs":      return <LogsPage      logs={logs} />;
      case "alerts":    return <AlertsPage    logs={logs} />;
      default:          return null;
    }
  };

  return (
    <div style={S.app}>
      <Sidebar active={page} setActive={setPage} onLogout={onLogout} />
      <div style={S.main}>
        <Topbar page={page} />
        <div style={S.content}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
<<<<<<< ours
}
=======
}
>>>>>>> theirs
