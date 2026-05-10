import { useOutletContext } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import { ICONS } from "../components/Icon";
import { buildSummary, buildVenueStats, formatFullDate, getTrafficChange, getHourWindowLabel } from "../data/mockData";

export default function OverviewPage() {
  const { logs } = useOutletContext();
  const summary = buildSummary(logs);
  const venueStats = buildVenueStats(logs).sort((a, b) => b.total - a.total);
  const trafficChange = getTrafficChange(logs);
  const activeAlerts = summary.unauthorized + summary.unknown;

  return (
    <div className="page-stack">
      <section className="hero-grid">
        <article className="hero-card hero-card--primary">
          <p className="eyebrow eyebrow--light">24-hour summary</p>
          <h2 className="hero-title">Campus security overview</h2>
          <div className="hero-metrics">
            <div className="hero-metric">
              <span>People seen</span>
              <strong>{summary.people}</strong>
            </div>
            <div className="hero-metric">
              <span>Peak hour</span>
              <strong>{summary.peakHour.label}</strong>
            </div>
            <div className="hero-metric">
              <span>Flagged</span>
              <strong>{activeAlerts}</strong>
            </div>
          </div>
        </article>

        <article className="hero-card hero-card--secondary">
          <p className="eyebrow">Traffic vs previous window</p>
          <h2 className="card-title" style={{ fontSize: 22, letterSpacing: "-0.04em" }}>
            {trafficChange >= 0 ? `+${trafficChange}%` : `${trafficChange}%`}
          </h2>
          <p className="card-copy" style={{ marginTop: 6 }}>
            Compared to the previous 12-hour window. Peak at {summary.peakHour.label}.
          </p>
          <div className="pill-row" style={{ marginTop: 16 }}>
            <span className="badge badge--authorized">{summary.authorized} authorized</span>
            <span className="badge badge--unauthorized">{summary.unauthorized} unauthorized</span>
            <span className="badge badge--unknown">{summary.unknown} unknown</span>
          </div>
        </article>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Total detections" value={summary.total.toLocaleString()} sub="Last 24 hours" tone="blue" icon={ICONS.wave} />
        <MetricCard label="People counted" value={summary.people.toLocaleString()} sub="Distinct identities" tone="emerald" icon={ICONS.users} />
        <MetricCard label="Unauthorized" value={summary.unauthorized.toLocaleString()} sub="Needs review" tone="rose" icon={ICONS.alert} />
        <MetricCard label="Peak hour" value={summary.peakHour.label} sub={`${summary.peakHour.people} people`} tone="amber" icon={ICONS.clock} />
      </section>

      <section className="split-grid">
        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Camera zones</p>
              <h2 className="card-title">Venue performance</h2>
            </div>
            <span className="pill">4 cameras</span>
          </div>

          <div className="list-stack" style={{ marginTop: 12 }}>
            {venueStats.map((venue) => {
              const safe = venue.total || 1;
              return (
                <div key={venue.id} className="venue-row">
                  <div style={{ flex: 1 }}>
                    <div className="item-row" style={{ marginBottom: 6 }}>
                      <div className="venue-main">
                        <strong>{venue.name}</strong>
                        <span>{venue.location} · {venue.camera}</span>
                      </div>
                      <span className="pill">{venue.people} people</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-track__fill--authorized"   style={{ width: `${(venue.authorized   / safe) * 100}%` }} />
                      <div className="progress-track__fill--unauthorized" style={{ width: `${(venue.unauthorized / safe) * 100}%` }} />
                      <div className="progress-track__fill--unknown"      style={{ width: `${(venue.unknown      / safe) * 100}%` }} />
                    </div>
                    <div className="pill-row" style={{ marginTop: 8 }}>
                      <span className="badge badge--authorized">{venue.authorized}</span>
                      <span className="badge badge--unauthorized">{venue.unauthorized}</span>
                      <span className="badge badge--unknown">{venue.unknown}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2 className="card-title">Latest detections</h2>
            </div>
          </div>
          <div className="list-stack">
            {logs.slice(0, 8).map((log) => (
              <div key={log.id} className="timeline-item">
                <div className="log-person">
                  <div className={`avatar-tile avatar-tile--${log.type}`}>
                    {log.name === "Unknown" ? "?" : log.name[0]}
                  </div>
                  <div>
                    <strong style={{ fontSize: 13 }}>{log.name}</strong>
                    <div className="mono-text">{log.roll} · {log.venue}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge badge--${log.type}`}>{log.type}</span>
                  <div className="mono-text" style={{ marginTop: 4 }}>{formatFullDate(log.ts)}</div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}