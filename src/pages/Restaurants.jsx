import { useEffect, useState } from "react";
import { restaurantAPI } from "../services/api";
import "../styles/restaurant.css";
import ActiveRestaurant from "./ActiveRestaurant";
import PendingRestaurant from "./PendingRestaurant";
import RestaurantDetailModal from "../components/RestaurantDetailModal";

const Restaurants = () => {
  const [tab, setTab] = useState("active");
  const [activeRestaurants, setActiveRestaurants] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newRestaurant, setNewRestaurant] = useState({ name: '', ownerName: '', city: '', address: '', phone: '', email: '', isVeg: true, status: 'active' });
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [viewRestaurant, setViewRestaurant] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeRes, suspendedRes, pendingRes] = await Promise.all([
        restaurantAPI.getAll('active'),
        restaurantAPI.getAll('suspended'),
        restaurantAPI.getAll('pending')
      ]);
      setActiveRestaurants([...activeRes.data, ...suspendedRes.data]);
      setPendingRestaurants(pendingRes.data);
    } catch (err) {
      setError("Failed to fetch restaurants. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleUpdateRestaurant = async (id, data) => {
    try {
      await restaurantAPI.update(id, data);
      setEditRestaurant(null);
      fetchData();
    } catch (err) {
      alert("Failed to update restaurant");
    }
  };

  const toggleStatus = async (idOrObj, currentStatusOrIsView) => {
    // Overloaded to handle "View Details" from ActiveRestaurant
    if (typeof currentStatusOrIsView === 'boolean' && currentStatusOrIsView === true) {
      setViewRestaurant(idOrObj);
      return;
    }

    try {
      const newStatus = currentStatusOrIsView === "active" ? "suspended" : "active";
      await restaurantAPI.updateStatus(idOrObj, newStatus);
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const approveRestaurant = async (idOrObj, isView = false) => {
    // Overloaded to handle "View Details" from PendingRestaurant
    if (isView) {
      setViewRestaurant(idOrObj);
      return;
    }

    try {
      await restaurantAPI.updateStatus(idOrObj, 'active');
      fetchData();
      setTab("active");
      setViewRestaurant(null);
    } catch (err) {
      alert("Failed to approve restaurant");
    }
  };

  const rejectRestaurant = async (id) => {
    if (window.confirm("Are you sure you want to reject this application? This will permanently delete the record.")) {
      try {
        await restaurantAPI.delete(id);
        fetchData();
        setViewRestaurant(null);
      } catch (err) {
        alert("Failed to reject restaurant");
      }
    }
  };

  const deleteRestaurant = async (id) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this restaurant? This action cannot be undone.")) {
      try {
        await restaurantAPI.delete(id);
        fetchData();
      } catch (err) {
        alert("Failed to delete restaurant");
      }
    }
  };

  return (
    <div className="restaurants-page">
      <div className="page-header">
        <h1>Restaurants</h1>
        <p className="subtitle">Manage restaurant partners and approvals</p>
      </div>

      <div className="card restaurant-card">
        <div className="tabs-header">
          <div className="tabs-list">
            <button
              className={`tab-pill ${tab === "active" ? "active" : ""}`}
              onClick={() => setTab("active")}
            >
              Managed Restaurants
              <span className="count-badge">{activeRestaurants.length}</span>
            </button>
            <button
              className={`tab-pill ${tab === "pending" ? "active" : ""}`}
              onClick={() => setTab("pending")}
            >
              Pending Approval
              <span className="count-badge warning">{pendingRestaurants.length}</span>
            </button>
          </div>
        </div>

        <div className="tab-content">
          {loading ? (
            <div className="loading-state">Loading restaurants...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : (
            <>
              {tab === "active" && (
                <ActiveRestaurant
                  restaurants={activeRestaurants}
                  onToggleStatus={toggleStatus}
                  onDelete={deleteRestaurant}
                  onEdit={setEditRestaurant}
                />
              )}

              {tab === "pending" && (
                <PendingRestaurant
                  restaurants={pendingRestaurants}
                  onApprove={approveRestaurant}
                  onReject={rejectRestaurant}
                />
              )}
            </>
          )}
        </div>
      </div>


      {/* EDIT MODAL */}
      {editRestaurant && (
        <div className="modal-overlay" onClick={() => setEditRestaurant(null)}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Restaurant</h3>
              <button className="close-btn" onClick={() => setEditRestaurant(null)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateRestaurant(editRestaurant._id, editRestaurant); }}>
              <div className="modal-body-grid">
                <div className="info-group">
                  <label>Restaurant Name</label>
                  <input type="text" value={editRestaurant.name} onChange={e => setEditRestaurant({ ...editRestaurant, name: e.target.value })} />
                </div>
                <div className="info-group">
                  <label>Owner Name</label>
                  <input type="text" value={editRestaurant.ownerName} onChange={e => setEditRestaurant({ ...editRestaurant, ownerName: e.target.value })} />
                </div>
                <div className="info-group">
                  <label>City</label>
                  <input type="text" value={editRestaurant.city} onChange={e => setEditRestaurant({ ...editRestaurant, city: e.target.value })} />
                </div>
                <div className="info-group">
                  <label>Status</label>
                  <select value={editRestaurant.status} onChange={e => setEditRestaurant({ ...editRestaurant, status: e.target.value })}>
                    <option>active</option>
                    <option>suspended</option>
                    <option>pending</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setEditRestaurant(null)}>Cancel</button>
                <button type="submit" className="primary-button">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {viewRestaurant && (
        <RestaurantDetailModal
          restaurant={viewRestaurant}
          onClose={() => setViewRestaurant(null)}
          onApprove={approveRestaurant}
          onReject={rejectRestaurant}
        />
      )}
    </div>
  );
};

export default Restaurants;
