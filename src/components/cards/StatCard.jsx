
export default function StatCard({ title, value, icon, trend, color }) {
  return (
    <div className="kpi-card">
      <div className="stat-card-left">
        <h4 className="stat-title">{title}</h4>
        <h2>{value}</h2>

        {trend && (
          <p className={`trend ${trend > 0 ? "positive" : "negative"}`}>
            {trend > 0 ? "arrow_upward" : "arrow_downward"} {Math.abs(trend)}%
          </p>
        )}
      </div>

      <div className="icon-container" style={{ backgroundColor: color + '15', color: color }}>
        {icon}
      </div>
    </div>
  );
}
