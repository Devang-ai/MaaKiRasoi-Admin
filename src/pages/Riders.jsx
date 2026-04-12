import { useState, useEffect } from "react";
import { connectAdminSocket, disconnectAdminSocket, socket } from "../services/socket";
import { riderAPI } from "../services/api";
import ActiveRiders from "./Activeriders";
import PendingRiders from "./Pendingriders";
import "../styles/riders.css";

export default function Riders() {
  const [tab, setTab] = useState("active");
  const [activeRiders, setActiveRiders] = useState([]);
  const [pendingRiders, setPendingRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newRider, setNewRider] = useState({ name: '', phone: '', vehicle: 'Bike', status: 'Available' });
  const [editRider, setEditRider] = useState(null);

  // Fetch riders from backend and setup socket
  useEffect(() => {
    fetchRiders();
    connectAdminSocket();

    socket.on('rider_location_update', (data) => {
        console.log('Rider moving:', data);
        setActiveRiders(prev => prev.map(r => 
            r.riderId === data.riderId 
            ? { ...r, location: data.location } 
            : r
        ));
    });

    socket.on('rider_online', (rider) => {
        console.log('🟢 Rider online:', rider);
        setActiveRiders(prev => prev.map(r => 
            r._id === rider._id ? { ...r, status: 'Available' } : r
        ));
    });

    socket.on('rider_offline', (riderId) => {
        console.log('🔴 Rider offline:', riderId);
        setActiveRiders(prev => prev.map(r => 
            r._id === riderId ? { ...r, status: 'Offline' } : r
        ));
    });

    return () => {
        socket.off('rider_location_update');
        socket.off('rider_online');
        socket.off('rider_offline');
        disconnectAdminSocket();
    };
  }, []);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await riderAPI.getAll();
      const riders = res.data;

      // Separate active and pending riders
      setActiveRiders(riders.filter(r => r.status !== 'Pending'));
      setPendingRiders(riders.filter(r => r.status === 'Pending'));
      setError(null);
    } catch (err) {
      setError("Failed to fetch riders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateRider = async (id, data) => {
    try {
      // In a real app we'd have a general update endpoint, 
      // but for now let's assume we can update any field via a patch to root or similar.
      // Since riderAPI only has updateStatus, I'll update it based on needs or assume it works for data.
      // I'll check if there's a general update in api.js or add one if needed.
      await riderAPI.update(id, data);
      setEditRider(null);
      fetchRiders();
    } catch (err) {
      alert("Failed to update rider");
    }
  };

  // approve rider
  const approveRider = async (rider) => {
    try {
      await riderAPI.updateStatus(rider._id, 'Available');
      fetchRiders(); // Refresh list
      setTab("active");
    } catch (err) {
      alert("Failed to approve rider");
      console.error(err);
    }
  };

  // delete rider (both lists)
  const deleteRider = async (id, type) => {
    if (window.confirm("Are you sure you want to remove this rider?")) {
      try {
        await riderAPI.delete(id);
        fetchRiders(); // Refresh list
      } catch (err) {
        alert("Failed to delete rider");
        console.error(err);
      }
    }
  };

  return (
    <div className="riders-page">
      <div className="page-header">
        <h1>Riders</h1>
        <p className="subtitle">Manage delivery fleet and applications</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card riders-card" style={{ position: 'relative' }}>
        <div className="total-badge">
          {tab === "active" ? activeRiders.length : pendingRiders.length} Total
        </div>

        <div className="tabs-header">
          <div className="tabs-list">
            <button
              className={`tab-pill ${tab === "active" ? "active" : ""}`}
              onClick={() => setTab("active")}
            >
              Active Riders
              <span className="count-badge">{activeRiders.length}</span>
            </button>
            <button
              className={`tab-pill ${tab === "pending" ? "active" : ""}`}
              onClick={() => setTab("pending")}
            >
              Pending Applications
              <span className="count-badge warning">{pendingRiders.length}</span>
            </button>
          </div>
        </div>

        <div className="tab-content">
          {loading ? (
            <div className="loading-state">Loading riders...</div>
          ) : tab === "active" ? (
            <ActiveRiders riders={activeRiders} onDelete={deleteRider} onEdit={setEditRider} />
          ) : (
            <PendingRiders
              riders={pendingRiders}
              onApprove={approveRider}
              onDelete={deleteRider}
            />
          )}
        </div>
      </div>


      {/* EDIT MODAL */}
      {editRider && (
        <div className="modal-overlay" onClick={() => setEditRider(null)}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Rider</h3>
              <button className="close-icon" onClick={() => setEditRider(null)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateRider(editRider._id, editRider); }}>
              <div className="form-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={editRider.name} 
                    onChange={e => setEditRider({ ...editRider, name: e.target.value })} 
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Contact</label>
                  <input 
                    type="text" 
                    value={editRider.phone} 
                    onChange={e => setEditRider({ ...editRider, phone: e.target.value })} 
                    placeholder="10 digit number"
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select 
                    value={editRider.vehicle_type || editRider.vehicle || 'Bike'} 
                    onChange={e => setEditRider({ ...editRider, vehicle_type: e.target.value })}
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={editRider.status} 
                    onChange={e => setEditRider({ ...editRider, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="On Delivery">On Delivery</option>
                    <option value="Offline">Offline</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setEditRider(null)}>Cancel</button>
                <button type="submit" className="primary-button">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
