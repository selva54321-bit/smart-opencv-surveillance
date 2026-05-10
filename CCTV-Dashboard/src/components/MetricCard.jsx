import Icon from "./Icon";

const ICON_COLORS = {
  slate:   "#525252",
  blue:    "#2563eb",
  emerald: "#16a34a",
  rose:    "#dc2626",
  amber:   "#d97706",
};

export default function MetricCard({ label, value, sub, tone = "slate", icon }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__content">
        <p className="metric-card__label">{label}</p>
        <p className="metric-card__value">{value}</p>
        {sub ? <p className="metric-card__sub">{sub}</p> : null}
      </div>
      {icon ? (
        <div className="metric-card__icon">
          <Icon d={icon} size={16} color={ICON_COLORS[tone] || ICON_COLORS.slate} />
        </div>
      ) : null}
    </article>
  );
}