import { useEffect, useState } from "react";
import TopPerformerCard from "../components/cards/TopPerformerCard";
import { dashboardAPI } from "../services/api";

import OrdersChart from "../components/charts/OrdersChart";
import RevenueChart from "../components/charts/RevenueChart";
import UsersChart from "../components/charts/UsersChart";

import "../styles/analytics.css";

export default function Analytics() {
  const [data, setData] = useState({
    dailyOrders: [],
    dailyRevenue: [],
    dailyUsers: [],
    topRestaurants: [],
    topRiders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await dashboardAPI.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Transform data for charts
  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const ordersChartData = (data.dailyOrders || []).map(d => ({ name: formatDateLabel(d._id), value: d.count }));
  const revenueChartData = (data.dailyRevenue || []).map(d => ({ name: formatDateLabel(d._id), value: d.total }));
  const usersChartData = (data.dailyUsers || []).map(d => ({ name: formatDateLabel(d._id), value: d.count }));

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics Overview</h1>
        <p className="subtitle">Performance metrics and business intelligence</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading Analytics...</div>
      ) : (
        <>
          {/* ===== CHARTS ROW (Main + Secondary) ===== */}
          <div className="charts-main-grid">
            <div className="chart-card large">
              <h3>Daily Orders (Last 7 Days)</h3>
              <OrdersChart data={ordersChartData} />
            </div>
            <div className="chart-card">
              <h3>Revenue Trend (Last 7 Days)</h3>
              <RevenueChart data={revenueChartData} />
            </div>
          </div>

          <div className="charts-main-grid" style={{ marginTop: '20px' }}>
            <div className="chart-card large">
              <h3>User Registrations (Last 7 Days)</h3>
              <UsersChart data={usersChartData} />
            </div>
          </div>

          {/* ===== BOTTOM ROW (Users & Performers) ===== */}
          <div className="charts-secondary-grid">

            {/* Render Top Performers */}
            <TopPerformerCard
              title="Top Restaurants"
              list={data.topRestaurants?.length > 0 
                ? data.topRestaurants.map(r => ({ name: r.name, detail: `${r.ordersCount} Orders` }))
                : [{ name: 'No data', detail: 'Waiting for orders' }]
              }
            />

            <TopPerformerCard
              title="Top Riders"
              list={data.topRiders?.length > 0 
                ? data.topRiders.map(r => ({ name: r.name, detail: `${r.rating} ⭐` }))
                : [{ name: 'No data', detail: 'Waiting for ratings' }]
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
