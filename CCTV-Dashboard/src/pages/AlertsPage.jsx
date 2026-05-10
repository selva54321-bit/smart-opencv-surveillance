import { useOutletContext } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import Icon, { ICONS } from "../components/Icon";
import { formatFullDate } from "../data/mockData";

function getSeverity(type) {
  return type === "unauthorized" ? "high" : "medium";
}

export default function AlertsPage() {
  const { logs } = useOutletContext();
  const alerts = logs
    .filter((log) => log.type === "unauthorized" || log.type === "unknown")
    .slice(0, 14)
    .map((log, index) => ({
      ...log,
      severity: getSeverity(log.type),
      resolved: index > 6,
    }));

  const activeCount = alerts.filter((alert) => !alert.resolved).length;
  const resolvedCount = alerts.filter((alert) => alert.resolved).length;
  const unknownCount = alerts.filter((alert) => alert.type === "unknown").length;

  return (
    <div className="page-stack">
      <section className="alert-summary-grid">
        <MetricCard
          label="Active alerts"
          value={activeCount.toLocaleString()}
          sub="Needs security attention"
          tone="rose"
          icon={ICONS.alert}
        />
        <MetricCard
          label="Resolved today"
          value={resolvedCount.toLocaleString()}
          sub="Closed by operators"
          tone="emerald"
          icon={ICONS.shield}
        />
        <MetricCard
          label="Unknown faces"
          value={unknownCount.toLocaleString()}
          sub="Unidentified detections"
          tone="amber"
          icon={ICONS.users}
        />
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Incident queue</p>
            <h2 className="card-title">Recent alerts</h2>
            <p className="card-copy">Unauthorized and unknown detections are grouped here with resolution state and venue context.</p>
          </div>
          <span className="pill">{alerts.length} incidents</span>
        </div>

        <div className="list-stack" style={{ marginTop: 18 }}>
          {alerts.map((alert) => (
            <article key={alert.id} className="incident-card" style={{ opacity: alert.resolved ? 0.7 : 1 }}>
              <div className={`incident-icon incident-icon--${alert.resolved ? "resolved" : alert.severity}`}>
                <Icon d={ICONS.alert} size={18} color="currentColor" />
              </div>

              <div className="incident-main">
                <strong>{alert.type === "unauthorized" ? "Unauthorized person detected" : "Unknown face detected"}</strong>
                <span>{alert.venue} · {alert.camera} · Roll {alert.roll} · Confidence {alert.confidence}</span>
                <div className="mono-text" style={{ marginTop: 8 }}>{formatFullDate(alert.ts)}</div>
              </div>

              <div className="incident-side">
                <span className={`badge badge--${alert.resolved ? "resolved" : alert.severity}`}>
                  {alert.resolved ? "resolved" : alert.severity}
                </span>
                <div className="mono-text" style={{ marginTop: 8 }}>{alert.time}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
