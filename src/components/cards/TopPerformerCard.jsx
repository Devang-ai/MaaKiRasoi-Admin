import "./topPerformerCard.css";

export default function TopPerformerCard({ title, list }) {
  return (
    <div className="partner-card performer-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="performer-list">
        {list.map((item, index) => (
          <div key={index} className="performer-item slide-up">
            <div className="performer-rank">
              <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
            </div>
            <div className="performer-main">
              <div className="performer-avatar">
                {item.name?.charAt(0) || '?'}
              </div>
              <div className="performer-info">
                <p className="performer-name">{item.name}</p>
                <p className="performer-detail">{item.detail || item.meta}</p>
              </div>
            </div>
            <div className="performer-trend">
              <span className="trend-arrow">↗</span>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="no-data-placeholder">No performance data yet</div>
        )}
      </div>
    </div>
  );
}
