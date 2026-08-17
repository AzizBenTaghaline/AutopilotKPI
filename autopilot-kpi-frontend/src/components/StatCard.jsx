import "./StatCard.css";

export default function StatCard({ label, value, trend, trendLabel, accent, actionLabel }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {trend && (
        <div className={`stat-trend trend-${trend.direction}`}>
          {trend.direction === "up" ? "↗" : "↘"} {trend.text}
        </div>
      )}
      {actionLabel && <div className="stat-action">⚠ {actionLabel}</div>}
    </div>
  );
}