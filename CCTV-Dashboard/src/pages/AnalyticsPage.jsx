import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import MetricCard from "../components/MetricCard";
import { ICONS } from "../components/Icon";
import { buildDailyStats, buildHourlyStats, buildSummary, getHourWindowLabel } from "../data/mockData";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#171717",
      titleColor: "#ffffff",
      bodyColor: "#a3a3a3",
      padding: 10,
      displayColors: false,
      cornerRadius: 6,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: "#a3a3a3", font: { size: 11 } },
    },
    y: {
      grid: { color: "#f0f0ef", lineWidth: 1 },
      border: { display: false, dash: [4, 4] },
      ticks: { color: "#a3a3a3", font: { size: 11 } },
    },
  },
};

export default function AnalyticsPage() {
  const { logs } = useOutletContext();
  const summary = buildSummary(logs);
  const hourlyStats = buildHourlyStats(logs);
  const dailyStats = buildDailyStats(logs);
  const [selectedHour, setSelectedHour] = useState(summary.peakHour.hour);
  const [focus, setFocus] = useState("people");

  const hourDetail = hourlyStats[selectedHour];

  const hourlyLineData = {
    labels: hourlyStats.map((h) => h.label),
    datasets: [
      {
        label: "People",
        data: hourlyStats.map((h) => h.people),
        borderColor: "#171717",
        backgroundColor: "rgba(23,23,23,0.06)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 1.5,
      },
      {
        label: "Authorized",
        data: hourlyStats.map((h) => h.authorized),
        borderColor: "#16a34a",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 1.5,
      },
      {
        label: "Flagged",
        data: hourlyStats.map((h) => h.unauthorized + h.unknown),
        borderColor: "#dc2626",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 1.5,
        borderDash: [6, 4],
      },
    ],
  };

  const doughnutData = {
    labels: ["Authorized", "Unauthorized", "Unknown"],
    datasets: [
      {
        data: [hourDetail.authorized, hourDetail.unauthorized, hourDetail.unknown],
        backgroundColor: ["#16a34a", "#dc2626", "#d97706"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const dailyBarData = {
    labels: dailyStats.map((d) => d.label),
    datasets: [
      {
        label: "Authorized",
        data: dailyStats.map((d) => d.authorized),
        backgroundColor: "#171717",
        borderRadius: 4,
        barPercentage: 0.5,
        categoryPercentage: 0.7,
      },
      {
        label: "Flagged",
        data: dailyStats.map((d) => d.unauthorized),
        backgroundColor: "#e5e5e4",
        borderRadius: 4,
        barPercentage: 0.5,
        categoryPercentage: 0.7,
      },
    ],
  };

  return (
    <div className="page-stack">
      <section className="card" style={{ padding: "14px 18px" }}>
        <div className="toolbar-row" style={{ alignItems: "center" }}>
          <div>
            <p className="eyebrow">Analytics</p>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Traffic & detection patterns</h2>
          </div>
          <div className="pill-row">
            {[
              ["overview", "Overview"],
              ["people", "People"],
              ["risk", "Risk"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`tab-button${focus === value ? " is-active" : ""}`}
                onClick={() => setFocus(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="metrics-grid metrics-grid--three">
        <MetricCard
          label="People in selected hour"
          value={hourDetail.people.toLocaleString()}
          sub={getHourWindowLabel(selectedHour)}
          tone="blue"
          icon={ICONS.users}
        />
        <MetricCard
          label="Authorized"
          value={hourDetail.authorized.toLocaleString()}
          sub={`of ${hourDetail.total} total`}
          tone="emerald"
          icon={ICONS.shield}
        />
        <MetricCard
          label="Flagged"
          value={(hourDetail.unauthorized + hourDetail.unknown).toLocaleString()}
          sub="Unauthorized + unknown"
          tone="rose"
          icon={ICONS.alert}
        />
      </section>

      <section className="analytics-grid">
        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Hourly traffic</p>
              <h2 className="card-title">24-hour movement</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="chart-legend">
                <span className="legend-chip" style={{ color: "#171717" }}>People</span>
                <span className="legend-chip" style={{ color: "#16a34a" }}>Auth</span>
                <span className="legend-chip" style={{ color: "#dc2626" }}>Flagged</span>
              </div>
              <label className="select-field" style={{ minWidth: 160 }}>
                <select value={selectedHour} onChange={(e) => setSelectedHour(Number(e.target.value))}>
                  {hourlyStats.map((h) => (
                    <option key={h.hour} value={h.hour}>
                      {getHourWindowLabel(h.hour)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="chart-wrap" style={{ marginTop: 16 }}>
            <Line data={hourlyLineData} options={BASE_OPTIONS} />
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Hour breakdown</p>
              <h2 className="card-title">{getHourWindowLabel(selectedHour)}</h2>
            </div>
            <span className="pill">{hourDetail.people} people</span>
          </div>

          <div className="chart-wrap chart-wrap--compact" style={{ marginTop: 16 }}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                cutout: "72%",
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "#171717",
                    titleColor: "#fff",
                    bodyColor: "#a3a3a3",
                    padding: 10,
                    cornerRadius: 6,
                  },
                },
              }}
            />
          </div>

          <div className="list-stack" style={{ marginTop: 14 }}>
            <div className="venue-row">
              <div className="venue-main">
                <strong>Authorized</strong>
                <span>Recognized entries</span>
              </div>
              <span className="badge badge--authorized">{hourDetail.authorized}</span>
            </div>
            <div className="venue-row">
              <div className="venue-main">
                <strong>Unauthorized</strong>
                <span>Access denied</span>
              </div>
              <span className="badge badge--unauthorized">{hourDetail.unauthorized}</span>
            </div>
            <div className="venue-row">
              <div className="venue-main">
                <strong>Unknown</strong>
                <span>Unidentified faces</span>
              </div>
              <span className="badge badge--unknown">{hourDetail.unknown}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">7-day view</p>
            <h2 className="card-title">Daily detection volume</h2>
          </div>
          <div className="chart-legend">
            <span className="legend-chip" style={{ color: "#171717" }}>Authorized</span>
            <span className="legend-chip" style={{ color: "#a3a3a3" }}>Flagged</span>
          </div>
        </div>
        <div className="chart-wrap" style={{ marginTop: 16 }}>
          <Bar
            data={dailyBarData}
            options={{
              ...BASE_OPTIONS,
              scales: {
                ...BASE_OPTIONS.scales,
                x: { ...BASE_OPTIONS.scales.x, grid: { display: false }, border: { display: false } },
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}