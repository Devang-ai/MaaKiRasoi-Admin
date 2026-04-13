import { useEffect, useState } from "react";
import orderAPI from "../services/api";
import { connectAdminSocket, socket } from "../services/socket";
import "../styles/orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [riders, setRiders] = useState([]);
  const [onlineRiders, setOnlineRiders] = useState([]);
  const [showRiderDetails, setShowRiderDetails] = useState(null);
  const [riderDocuments, setRiderDocuments] = useState({});

  // Fetch orders from backend
  const fetchOrders = async () => {
    // setLoading(true); // Don't show full loading for background updates
    setError(null); 
    try {
      // Map frontend "Pending" filter to backend "placed" status
      const mappedStatus = activeStatus === "Pending" ? "placed" : 
                           activeStatus === "Out for Delivery" ? "out_for_delivery" :
                           activeStatus;
      const statusParam = mappedStatus !== "All" ? mappedStatus : null;
      const res = await orderAPI.getAll(statusParam); 
      console.log('Orders API Response:', res.data); // Debug log
      setOrders(res.data);
    } catch (err) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRiders();
    fetchOnlineRiders();

    connectAdminSocket();
    
    socket.on('dashboardUpdate', () => {
      console.log('Admin Orders: Dashboard update received, refreshing list');
      fetchOrders();
    });

    socket.on('new_order', () => {
      console.log('Admin Orders: New order received, refreshing list');
      fetchOrders();
    });

    socket.on('order_accepted_by_rider', (data) => {
      console.log('Admin Orders: Order accepted by rider', data);
      fetchOrders();
      // Update specific order with rider assignment
      setOrders(prev => prev.map(order => 
        order._id === data.orderId 
          ? { ...order, status: 'confirmed', riderId: data.riderId, riderName: data.riderName, assignedAt: new Date() }
          : order
      ));
    });

    socket.on('order_completed', (data) => {
      console.log('Admin Orders: Order completed', data);
      fetchOrders();
      // Update order status to completed
      setOrders(prev => prev.map(order => 
        order._id === data.orderId 
          ? { ...order, status: 'delivered', completedAt: new Date() }
          : order
      ));
      
      // Notify about chat deactivation
      alert(`Order #${data.orderId} has been completed. User-rider chat has been deactivated.`);
    });

    socket.on('order_cancelled', (data) => {
      console.log('Admin Orders: Order cancelled', data);
      fetchOrders();
      // Update order status to cancelled
      setOrders(prev => prev.map(order => 
        order._id === data.orderId 
          ? { ...order, status: 'cancelled', cancelledAt: new Date() }
          : order
      ));
      
      // Notify about chat deactivation
      alert(`Order #${data.orderId} has been cancelled. User-rider chat has been deactivated.`);
    });

    socket.on('rider_online', (rider) => {
      setOnlineRiders(prev => [...prev.filter(r => r._id !== rider._id), rider]);
    });

    socket.on('rider_offline', (riderId) => {
      setOnlineRiders(prev => prev.filter(r => r._id !== riderId));
    });

    socket.on('rider_document_uploaded', (data) => {
      setRiderDocuments(prev => ({
        ...prev,
        [data.riderId]: [...(prev[data.riderId] || []), data.document]
      }));
    });

    return () => {
      socket.off('dashboardUpdate');
      socket.off('new_order');
      socket.off('order_accepted_by_rider');
      socket.off('order_completed');
      socket.off('order_cancelled');
      socket.off('rider_online');
      socket.off('rider_offline');
      socket.off('rider_document_uploaded');
    };
  }, [activeStatus]);

  const fetchRiders = async () => {
    try {
      const res = await orderAPI.getRiders ? orderAPI.getRiders("Available") : [];
      setRiders(res.data || []);
    } catch (err) {
      console.error("Error fetching riders:", err);
    }
  };

  const fetchOnlineRiders = async () => {
    try {
      const res = await orderAPI.getOnlineRiders ? orderAPI.getOnlineRiders() : [];
      setOnlineRiders(res.data || []);
    } catch (err) {
      console.error("Error fetching online riders:", err);
    }
  };

  const fetchRiderDocuments = async (riderId) => {
    try {
      const res = await orderAPI.getRiderDocuments ? orderAPI.getRiderDocuments(riderId) : [];
      setRiderDocuments(prev => ({ ...prev, [riderId]: res.data || [] }));
    } catch (err) {
      console.error("Error fetching rider documents:", err);
    }
  };

  const filtered = orders.filter((order) => {
    if (!order) return false;
    
    const custName = order.customer || "";
    const orderIdent = order.orderId || order._id || "";
    
    const matchesSearch = custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderIdent.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDate = !date || new Date(order.createdAt).toLocaleDateString() === new Date(date).toLocaleDateString();
    return matchesSearch && matchesDate;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const handleAssignRider = async (orderId, riderId, riderName) => {
    try {
      await orderAPI.assignRider(orderId, riderId, riderName);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: 'confirmed', riderId, riderName, assignedAt: new Date() }));
      }
      alert("Rider assigned successfully!");
    } catch (err) {
      alert("Failed to assign rider");
    }
  };

  const handleApproveRiderDocument = async (riderId, documentId) => {
    try {
      await orderAPI.approveRiderDocument ? orderAPI.approveRiderDocument(riderId, documentId) : null;
      setRiderDocuments(prev => ({
        ...prev,
        [riderId]: prev[riderId].map(doc => 
          doc._id === documentId ? { ...doc, status: 'approved' } : doc
        )
      }));
      alert("Document approved successfully!");
    } catch (err) {
      alert("Failed to approve document");
    }
  };

  const handleRejectRiderDocument = async (riderId, documentId) => {
    try {
      await orderAPI.rejectRiderDocument ? orderAPI.rejectRiderDocument(riderId, documentId) : null;
      setRiderDocuments(prev => ({
        ...prev,
        [riderId]: prev[riderId].map(doc => 
          doc._id === documentId ? { ...doc, status: 'rejected' } : doc
        )
      }));
      alert("Document rejected!");
    } catch (err) {
      alert("Failed to reject document");
    }
  };

  const handleApproveRider = async (riderId) => {
    try {
      await orderAPI.approveRider ? orderAPI.approveRider(riderId) : null;
      setRiders(prev => prev.map(rider => 
        rider._id === riderId ? { ...rider, status: 'active' } : rider
      ));
      alert("Rider approved and is now active!");
    } catch (err) {
      alert("Failed to approve rider");
    }
  };

  const isRiderOnline = (riderId) => {
    return onlineRiders.some(rider => rider._id === riderId);
  };

  // Status filters for orders
  const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

  const handleExport = () => {
    if (!filtered.length) return;
    const headers = ["Order ID", "Customer", "Restaurant", "Amount", "Payment", "Status", "Date"];
    const rows = filtered.map((order) => [
      order.orderId || order._id,
      order.customer,
      order.restaurant,
      order.totalAmount,
      order.paymentMode,
      order.status,
      new Date(order.createdAt).toLocaleDateString() // Format date for export
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <p className="subtitle">Manage and track all customer orders</p>
      </div>

      <div className="card orders-card">
        {/* FILTERS & CONTROLS */}
        <div className="orders-toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters-right">
            <input
              type="date"
              className="date-filter"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button className="export-btn" onClick={handleExport}>
              ⬇ Export
            </button>
          </div>
        </div>

        {/* STATUS PILLS */}
        <div className="status-tabs">
          {STATUS_FILTERS.map(status => (
            <button
              key={status}
              className={`status-tab ${activeStatus === status ? 'active' : ''}`}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Rider</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((o) => (
                  <tr key={o._id}>
                    <td className="id-cell">{o.orderId || o._id}</td>
                    <td className="customer-cell">
                      <div className="avatar">{o.customer.charAt(0)}</div>
                      {o.customer}
                    </td>
                    <td>{o.restaurant}</td>
                    <td className="amount-cell">{o.totalAmount}</td>
                    <td>
                      <span className={`payment-badge ${o.paymentMode.toLowerCase()}`}>{o.paymentMode}</span>
                    </td>
                    <td>
                      <div className="rider-cell">
                        <span className="rider-text">{o.riderName || "Not Assigned"}</span>
                        {o.riderId && (
                          <span className={`online-indicator ${isRiderOnline(o.riderId) ? 'online' : 'offline'}`}>
                            {isRiderOnline(o.riderId) ? '🟢' : '🔴'}
                          </span>
                        )}
                        {o.assignedAt && (
                          <span className="assigned-time">
                            {new Date(o.assignedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${o.status.replaceAll(" ", "-").toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button className="action-icon view" title="View Details" onClick={() => setSelectedOrder(o)}>
                        👁
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER / STATS */}
        <div className="table-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', color: 'var(--color-text-muted)', fontSize: '13px' }}>
          Showing {filtered.length} orders matching your filters
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal slide-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details <span>{selectedOrder.orderId || selectedOrder._id}</span></h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="order-summary-card">
                <div className="summary-item">
                  <label>Customer</label>
                  <p>{selectedOrder.customer}</p>
                </div>
                <div className="summary-item">
                  <label>Restaurant</label>
                  <p>{selectedOrder.restaurant}</p>
                </div>
                <div className="summary-item">
                  <label>Date</label>
                  <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="summary-item">
                  <label>Rider Assignment</label>
                  <div className="rider-assignment">
                    {selectedOrder.riderName ? (
                      <div className="assigned-rider">
                        <span className="rider-name">{selectedOrder.riderName}</span>
                        <span className={`status-badge ${isRiderOnline(selectedOrder.riderId) ? 'online' : 'offline'}`}>
                          {isRiderOnline(selectedOrder.riderId) ? '🟢 Online' : '🔴 Offline'}
                        </span>
                        {selectedOrder.assignedAt && (
                          <span className="assignment-time">
                            Assigned: {new Date(selectedOrder.assignedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="unassigned-section">
                        <p className="unassigned-text">No rider assigned yet</p>
                        <button 
                          className="assign-rider-btn"
                          onClick={() => setShowRiderDetails(selectedOrder._id)}
                        >
                          🏍️ View Available Riders
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="summary-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedOrder.status.replaceAll(" ", "-").toLowerCase()}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <h4>Items</h4>
              <ul className="order-items-list">
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{item.price}</span>
                  </li>
                ))}
                {!selectedOrder.items && <li className="no-items">Items data not available</li>}
              </ul>

              <div className="bill-total">
                <span>Total Amount</span>
                <span>{selectedOrder.totalAmount}</span>
              </div>

              <div className="modal-actions-section">
                <h4>Manage Order</h4>
                <div className="action-row">
                  <label>Assign Rider</label>
                  <select
                    className="rider-select"
                    value={selectedOrder.riderId || ""}
                    onChange={(e) => {
                      const rider = riders.find(r => r.riderId === e.target.value);
                      if (rider) handleAssignRider(selectedOrder._id, rider.riderId, rider.name);
                    }}
                  >
                    <option value="">Select a Rider</option>
                    {riders.map(r => (
                      <option key={r._id} value={r.riderId}>{r.name} ({r.vehicle})</option>
                    ))}
                  </select>
                </div>

                <div className="status-actions">
                  <button onClick={() => handleStatusChange(selectedOrder._id, 'preparing')} className="status-btn preparing">Preparing</button>
                  <button onClick={() => handleStatusChange(selectedOrder._id, 'out_for_delivery')} className="status-btn out">Out for Delivery</button>
                  <button onClick={() => handleStatusChange(selectedOrder._id, 'delivered')} className="status-btn delivered">Delivered</button>
                  <button onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')} className="status-btn cancelled">Cancel Order</button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="print-btn" onClick={() => window.print()}>🖨 Print Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* RIDER SELECTION MODAL */}
      {showRiderDetails && (
        <div className="modal-overlay" onClick={() => setShowRiderDetails(null)}>
          <div className="rider-selection-modal slide-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏍️ Available Riders for Order</h3>
              <button className="close-btn" onClick={() => setShowRiderDetails(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="online-riders-section">
                <h4>🟢 Online Riders ({onlineRiders.length})</h4>
                <div className="riders-grid">
                  {onlineRiders.filter(rider => rider.status === 'active').map(rider => (
                    <div key={rider._id} className="rider-card online">
                      <div className="rider-avatar">{rider.name.charAt(0)}</div>
                      <div className="rider-info">
                        <h5>{rider.name}</h5>
                        <p>{rider.vehicle} • {rider.phone}</p>
                        <span className="online-badge">🟢 Online Now</span>
                      </div>
                      <button 
                        className="assign-btn"
                        onClick={() => {
                          handleAssignRider(showRiderDetails, rider._id, rider.name);
                          setShowRiderDetails(null);
                        }}
                      >
                        Assign to Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pending-riders-section">
                <h4>⏳ Pending Approval Riders</h4>
                <div className="riders-grid">
                  {riders.filter(rider => rider.status === 'pending').map(rider => (
                    <div key={rider._id} className="rider-card pending">
                      <div className="rider-avatar" style={{ background: '#FFA500' }}>{rider.name.charAt(0)}</div>
                      <div className="rider-info">
                        <h5>{rider.name}</h5>
                        <p>{rider.vehicle} • {rider.phone}</p>
                        <span className="pending-badge">⏳ Pending Documents</span>
                      </div>
                      <button 
                        className="review-btn"
                        onClick={() => fetchRiderDocuments(rider._id)}
                      >
                        📄 Review Documents
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIDER DOCUMENTS MODAL */}
      {Object.keys(riderDocuments).length > 0 && (
        <div className="modal-overlay" onClick={() => setRiderDocuments({})}>
          <div className="documents-modal slide-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Rider Documents</h3>
              <button className="close-btn" onClick={() => setRiderDocuments({})}>×</button>
            </div>

            <div className="modal-body">
              {Object.entries(riderDocuments).map(([riderId, documents]) => (
                <div key={riderId} className="rider-documents">
                  <h4>{riders.find(r => r._id === riderId)?.name || 'Rider'}</h4>
                  <div className="documents-grid">
                    {documents.map(doc => (
                      <div key={doc._id} className="document-card">
                        <div className="document-info">
                          <h5>{doc.type}</h5>
                          <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          <span className={`status-badge ${doc.status || 'pending'}`}>
                            {doc.status || 'Pending'}
                          </span>
                        </div>
                        <div className="document-actions">
                          <button className="view-btn" onClick={() => window.open(doc.url, '_blank')}>
                            👁 View
                          </button>
                          {doc.status !== 'approved' && (
                            <>
                              <button 
                                className="approve-btn"
                                onClick={() => handleApproveRiderDocument(riderId, doc._id)}
                              >
                                ✓ Approve
                              </button>
                              <button 
                                className="reject-btn"
                                onClick={() => handleRejectRiderDocument(riderId, doc._id)}
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rider-actions">
                    {documents.every(doc => doc.status === 'approved') && (
                      <button 
                        className="activate-rider-btn"
                        onClick={() => handleApproveRider(riderId)}
                      >
                        🟢 Activate Rider
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
