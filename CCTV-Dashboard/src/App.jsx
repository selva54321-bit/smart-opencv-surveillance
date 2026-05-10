import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import OverviewPage from "./pages/OverviewPage";
import LiveFeedPage from "./pages/LiveFeedPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LogsPage from "./pages/LogsPage";
import AlertsPage from "./pages/AlertsPage";
import EnrollPage from "./pages/EnrollPage";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) return undefined;

    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/logs");
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      } catch (e) {
        console.error("Failed to fetch logs:", e);
      }
    };

    fetchLogs();
    const intervalId = setInterval(fetchLogs, 4000);

    return () => clearInterval(intervalId);
  }, [loggedIn]);

  const handleLogin = () => {
    setLoggedIn(true);
    navigate("/");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={loggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/"
        element={loggedIn ? <Dashboard logs={logs} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<OverviewPage />} />
        <Route path="live" element={<LiveFeedPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="enroll" element={<EnrollPage />} />
      </Route>
      <Route path="*" element={<Navigate to={loggedIn ? "/" : "/login"} replace />} />
    </Routes>
  );
}
