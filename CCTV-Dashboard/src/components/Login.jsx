import { useState } from "react";
import Icon, { ICONS } from "./Icon";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (user === "admin" && pass === "1234") {
      setLoading(true);
      setTimeout(onLogin, 800);
    } else {
      setErr("Invalid credentials. Try admin / 1234");
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <aside className="login-aside">
          <div>
            <div className="brand-block">
              <div className="brand-mark">
                <Icon d={ICONS.camera} size={18} color="currentColor" />
              </div>
              <div>
                <p className="brand-kicker">Security OS</p>
                <h1 className="brand-title">INTEC CCTV</h1>
              </div>
            </div>

            <h2 className="login-title">Professional campus surveillance, aligned for operations.</h2>
            <p className="login-copy">
              Monitor every camera, review alerts faster, and inspect how many people moved through any particular hour from one polished control room.
            </p>
          </div>

          <div className="login-stats-grid">
            {[
              ["4", "Cameras online"],
              ["24h", "Hourly traffic view"],
              ["99.2%", "Recognition uptime"],
              ["7 days", "Rolling history"],
            ].map(([value, label]) => (
              <div key={label} className="login-stat">
                <strong className="mini-stat-value">{value}</strong>
                <span className="mini-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="login-form">
          <div className="form-header">
            <h2>Sign in</h2>
            <p>Access the redesigned admin dashboard and review people flow, live feed, and alerts.</p>
          </div>

          {err ? <div className="alert-banner">{err}</div> : null}

          <div className="field-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="admin"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="••••••••"
            />
          </div>

          <div className="field-group">
            <button className="primary-button" onClick={submit} style={{ width: "100%", opacity: loading ? 0.7 : 1 }}>
              <Icon d={ICONS.shield} size={16} color="currentColor" />
              {loading ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </div>

          <div className="form-footer">
            <div className="surface-note">Demo credentials: <strong>admin / 1234</strong></div>
            <span className="mono-text">Secure lane active</span>
          </div>
        </section>
      </div>
    </div>
  );
}
