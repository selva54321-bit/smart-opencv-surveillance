import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { genLogs, genNewLog } from "./data/mockData";
import OverviewPage from "./pages/OverviewPage";
import LiveFeedPage from "./pages/LiveFeedPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LogsPage from "./pages/LogsPage";
import AlertsPage from "./pages/AlertsPage";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [logs, setLogs] = useState(() => genLogs(220));
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) return undefined;

    const intervalId = setInterval(() => {
      setLogs((previous) => [genNewLog(), ...previous].slice(0, 260));
    }, 4000);

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
      </Route>
      <Route path="*" element={<Navigate to={loggedIn ? "/" : "/login"} replace />} />
    </Routes>
  );
}
