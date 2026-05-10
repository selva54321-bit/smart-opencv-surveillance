import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import { ICONS } from "../components/Icon";
import { buildVenueStats, formatFullDate } from "../data/mockData";

function getBadgeClass(type) {
  return `badge badge--${type}`;
}

export default function LiveFeedPage() {
  const { logs } = useOutletContext();
  const [tick, setTick] = useState(0);
  const venueStats = buildVenueStats(logs);
  const totalPeople = venueStats.reduce((sum, venue) => sum + venue.people, 0);
  const busyVenue = venueStats.reduce((best, venue) => (venue.people > best.people ? venue : best), venueStats[0]);

  useEffect(() => {
    const timerId = setInterval(() => setTick((current) => current + 1), 3000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="page-stack">
      <section className="metrics-grid">
        <MetricCard
          label="Live cameras"
          value={`${venueStats.length}/4`}
          sub="All streams active"
          tone="blue"
          icon={ICONS.camera}
        />
        <MetricCard
          label="People across feeds"
          value={totalPeople.toLocaleString()}
          sub="Last 24 hours"
          tone="emerald"
          icon={ICONS.users}
        />
        <MetricCard
          label="Busiest zone"
          value={busyVenue.name}
          sub={`${busyVenue.people} people observed`}
          tone="amber"
          icon={ICONS.building}
        />
        <MetricCard
          label="Flagged events"
          value={venueStats.reduce((sum, venue) => sum + venue.unauthorized + venue.unknown, 0)}
          sub="Unauthorized + unknown"
          tone="rose"
          icon={ICONS.alert}
        />
      </section>

      <section className="feed-grid">
        {venueStats.map((venue, index) => {
          const recentLogs = logs.filter((log) => log.venue === venue.name).slice(0, 3);
          const detections = Math.max(1, Math.min(3, Math.round((venue.total % 3) + (tick % 2))));
          const fps = 26 + ((tick + index) % 5);

          return (
            <article key={venue.id} className="feed-card">
              <div className="card-header" style={{ marginBottom: 18 }}>
                <div className="camera-meta">
                  <div className="camera-score camera-score--authorized">{venue.camera.replace("CAM-", "")}</div>
                  <div>
                    <strong>{venue.name}</strong>
                    <span>{venue.location} · {venue.camera}</span>
                  </div>
                </div>
                <span className="pill">{venue.people} people</span>
              </div>

              <div className="camera-frame">
                <div className="camera-hud">
                  <span>REC LIVE</span>
                  <span>{fps} fps</span>
                </div>

                <div className="camera-box camera-box--authorized" style={{ top: "24%", left: "10%", width: "18%", height: "38%" }}>
                  <span>AUTH 0.93</span>
                </div>
                {detections > 1 ? (
                  <div className="camera-box camera-box--unauthorized" style={{ top: "32%", right: "14%", width: "16%", height: "34%" }}>
                    <span>UNAUTH 0.84</span>
                  </div>
                ) : null}
                {detections > 2 ? (
                  <div className="camera-box camera-box--unknown" style={{ bottom: "18%", left: "38%", width: "14%", height: "26%" }}>
                    <span>UNKNOWN 0.44</span>
                  </div>
                ) : null}

                <div className="camera-hud-bottom">
                  <span>{venue.location}</span>
                  <span>{detections} live detections</span>
                </div>
              </div>

              <div className="pill-row" style={{ marginTop: 18 }}>
                <span className="badge badge--authorized">{venue.authorized} authorized</span>
                <span className="badge badge--unauthorized">{venue.unauthorized} unauthorized</span>
                <span className="badge badge--unknown">{venue.unknown} unknown</span>
              </div>

              <div className="list-stack" style={{ marginTop: 12 }}>
                {recentLogs.map((log) => (
                  <div key={log.id} className="feed-detection">
                    <div>
                      <strong>{log.name}</strong>
                      <div className="mono-text">{log.roll} · {formatFullDate(log.ts)}</div>
                    </div>
                    <span className={getBadgeClass(log.type)}>{log.type}</span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
