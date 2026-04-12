import { useEffect, useState } from "react";
import { dashboardAPI } from "../services/api";
import { connectAdminSocket, socket } from "../services/socket";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    orders: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive success rate
  const successRate = (stats.deliveredOrders + stats.cancelledOrders) > 0 
    ? Math.round((stats.deliveredOrders / (stats.deliveredOrders + stats.cancelledOrders)) * 100) 
    : 100;

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getActivity()
      ]);

      setStats(statsRes.data);
      setRecentActivities(activityRes.data);

    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    connectAdminSocket();

    socket.on('dashboardUpdate', () => {
      console.log('Live dashboard update received');
      fetchDashboardData();
    });

    socket.on('newActivity', (activity) => {
      console.log('🚀 NEW ACTIVITY:', activity);
      setRecentActivities(prev => [activity, ...prev].slice(0, 15));
      if (activity.type === 'New Order' || activity.type === 'Subscription') {
        fetchDashboardData();
      }
    });

    return () => {
      socket.off('dashboardUpdate');
      socket.off('newActivity');
    };
  }, []);

  // Helper to format time relative (simple version)
  const formatTime = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-top">
          <div>
            <h2>Command Center</h2>
            <p>Ecosystem health and real-time operations monitor.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Syncing Platform Data...</div>
      ) : (
        <>
          <div className="analytics-overview-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
             {/* Stats Cards Section */}
             <div className="stats-container">
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <p className="stat-title">Total Revenue</p>
                        <h3>₹{stats.revenue?.toLocaleString() || '0'}</h3>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <p className="stat-title">Total Users</p>
                        <h3>{stats.users || '0'}</h3>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <p className="stat-title">Total Orders</p>
                        <h3>{stats.orders || '0'}</h3>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔥</div>
                        <p className="stat-title">Active Orders</p>
                        <h3 style={{ color: 'var(--color-primary)' }}>{stats.activeOrders || '0'}</h3>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💎</div>
                        <p className="stat-title">Active Subs</p>
                        <h3 style={{ color: 'var(--status-success-text)' }}>{stats.activeSubscriptions || '0'}</h3>
                    </div>
                </div>
             </div>

            {/* Performance Circular Gauge */}
            <div className="partner-card performance-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '14px' }}>Order Success Rate</h4>
                <div className="gauge-container" style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray={`${successRate}, 100`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '18px', fontWeight: 'bold' }}>
                        {successRate}%
                    </div>
                </div>
                <p style={{ marginTop: '1rem', fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>High Operational Efficiency</p>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="partner-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 className="card-title" style={{ margin: 0 }}>Recent Activity Feed</h3>
               <span className="live-indicator">
                 <span className="dot"></span> LIVE
               </span>
            </div>

            <table className="partner-table activity-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Interaction</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <tr key={index}>
                      <td><span className={`type-badge ${activity.type.toLowerCase().replace(' ', '-')}`}>{activity.type}</span></td>
                      <td>{activity.description}</td>
                      <td>{formatTime(activity.time)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-data">Monitoring network activity...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
