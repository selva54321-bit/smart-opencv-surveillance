import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Icon, { ICONS } from "../components/Icon";
import { formatFullDate } from "../data/mockData";

const FILTERS = ["all", "authorized", "unauthorized", "unknown"];

function getBadgeClass(type) {
  return `badge badge--${type}`;
}

export default function LogsPage() {
  const { logs } = useOutletContext();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredLogs = logs.filter((log) => {
    const matchesType = filter === "all" || log.type === filter;
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword
      || log.roll.toLowerCase().includes(keyword)
      || log.name.toLowerCase().includes(keyword)
      || log.venue.toLowerCase().includes(keyword)
      || log.camera.toLowerCase().includes(keyword);

    return matchesType && matchesSearch;
  });

  return (
    <div className="page-stack">
      <section className="table-shell">
        <div className="table-toolbar">
          <div>
            <p className="eyebrow">Searchable event history</p>
            <h2 className="card-title">Detection records</h2>
            <p className="card-copy">Filter by status or search by roll, name, venue, and camera.</p>
          </div>

          <div className="toolbar-group">
            <label className="search-field">
              <Icon d={ICONS.search} size={16} color="#64748b" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search roll no, person name, venue, or camera"
              />
            </label>

            <div className="pill-row">
              {FILTERS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`tab-button${filter === value ? " is-active" : ""}`}
                  onClick={() => setFilter(value)}
                >
                  {value === "all" ? "All" : value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Name</th>
              <th>Venue</th>
              <th>Camera</th>
              <th>Confidence</th>
              <th>Status</th>
              <th>Detected At</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.slice(0, 40).map((log) => (
              <tr key={log.id}>
                <td className="mono-text">{log.roll}</td>
                <td>
                  <strong>{log.name}</strong>
                </td>
                <td>{log.venue}</td>
                <td className="mono-text">{log.camera}</td>
                <td>{Math.round(Number(log.confidence) * 100)}%</td>
                <td><span className={getBadgeClass(log.type)}>{log.type}</span></td>
                <td className="mono-text">{formatFullDate(log.ts)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 ? (
          <div className="empty-state">No results matched the current search and filter combination.</div>
        ) : null}
      </section>
    </div>
  );
}
