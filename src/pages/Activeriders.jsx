import { useState } from "react";

export default function ActiveRiders({ riders, onDelete, onEdit }) {
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const PER_PAGE = 5;
  const totalPages = Math.ceil(riders.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const visible = riders.slice(start, start + PER_PAGE);

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Rider Details</th>
            <th>Contact</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.length > 0 ? (
            visible.map((r) => (
              <tr key={r._id}>
                <td className="id-cell">{r.riderId || r._id.slice(-6)}</td>
                <td>
                  <div className="rider-profile">
                    <div className="rider-avatar">{r.name.charAt(0)}</div>
                    <div className="rider-info">
                      <span className="rider-name">{r.name}</span>
                      <span className="rider-email">{r.email || `${r.name.toLowerCase().replace(" ", "")}@rasoi.com`}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="contact-cell">{r.phone}</span>
                </td>
                <td>
                  <span className={`vehicle-badge ${(r.vehicle_type || r.vehicle || 'Bike').toLowerCase()}`}>
                    {r.vehicle_type || r.vehicle}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${r.status.replaceAll(" ", "-").toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.rating !== undefined ? `★ ${r.rating.toFixed(1)}` : "★ 0.0"}</td>
                <td className="actions-cell">
                  <button className="icon-btn view" title="View Details" onClick={() => setSelectedItem(r)}>👁</button>
                  <button className="icon-btn edit" title="Edit Rider" onClick={() => onEdit(r)}>✏️</button>
                  <button
                    className="icon-btn delete"
                    title="Remove Rider"
                    onClick={() => onDelete(r._id, "active")}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" className="no-data">No active riders.</td></tr>
          )}
        </tbody>
      </table>

      {/* Pagination (Users Style) */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-bubble"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ←
          </button>
          <div className="page-numbers">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-bubble ${page === i + 1 ? 'active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            className="page-bubble"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      )}

      {/* View Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rider Management Details</h3>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            </div>

            <div className="rider-details-grid">
              <div className="detail-item">
                <label>Rider ID</label>
                <p>{selectedItem.riderId || 'No ID'}</p>
              </div>
              <div className="detail-item">
                <label>Full Name</label>
                <p>{selectedItem.name}</p>
              </div>
              <div className="detail-item">
                <label>Phone Contact</label>
                <p>{selectedItem.phone}</p>
              </div>
              <div className="detail-item">
                <label>Email Address</label>
                <p>{selectedItem.email || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Vehicle Type</label>
                <p>{selectedItem.vehicle_type || selectedItem.vehicle || 'Bike'}</p>
              </div>
              <div className="detail-item">
                <label>Vehicle Number</label>
                <p>{selectedItem.vehicle_number || 'Not Linked'}</p>
              </div>
              <div className="detail-item">
                <label>Rating</label>
                <p style={{ fontWeight: 'bold', color: '#F59E0B' }}>★ {selectedItem.rating || '0.0'}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className={`status-badge ${selectedItem.status.replaceAll(" ", "-").toLowerCase()}`}>
                  {selectedItem.status}
                </span>
              </div>

              {/* Documents Section */}
              <div className="docs-section">
                <h4><span>📂</span> Submitted Documents</h4>
                <div className="docs-preview-grid">
                  {selectedItem.aadhar_url && (
                    <a href={`http://localhost:5000${selectedItem.aadhar_url}`} target="_blank" rel="noopener noreferrer" className="doc-preview-card">
                      <div className="doc-photo-wrapper">
                        <img src={`http://localhost:5000${selectedItem.aadhar_url}`} alt="Aadhar" className="doc-photo" />
                      </div>
                      <div className="doc-label-overlay">
                        <span>Aadhar Card</span>
                        <i className="doc-view-icon">👁</i>
                      </div>
                    </a>
                  )}
                  {selectedItem.license_url && (
                    <a href={`http://localhost:5000${selectedItem.license_url}`} target="_blank" rel="noopener noreferrer" className="doc-preview-card">
                      <div className="doc-photo-wrapper">
                        <img src={`http://localhost:5000${selectedItem.license_url}`} alt="License" className="doc-photo" />
                      </div>
                      <div className="doc-label-overlay">
                        <span>Driving License</span>
                        <i className="doc-view-icon">👁</i>
                      </div>
                    </a>
                  )}
                  {selectedItem.pan_url && (
                    <a href={`http://localhost:5000${selectedItem.pan_url}`} target="_blank" rel="noopener noreferrer" className="doc-preview-card">
                      <div className="doc-photo-wrapper">
                        <img src={`http://localhost:5000${selectedItem.pan_url}`} alt="PAN" className="doc-photo" />
                      </div>
                      <div className="doc-label-overlay">
                        <span>PAN Card</span>
                        <i className="doc-view-icon">👁</i>
                      </div>
                    </a>
                  )}
                  {selectedItem.rc_url && (
                    <a href={`http://localhost:5000${selectedItem.rc_url}`} target="_blank" rel="noopener noreferrer" className="doc-preview-card">
                      <div className="doc-photo-wrapper">
                        <img src={`http://localhost:5000${selectedItem.rc_url}`} alt="RC Doc" className="doc-photo" />
                      </div>
                      <div className="doc-label-overlay">
                        <span>RC Document</span>
                        <i className="doc-view-icon">👁</i>
                      </div>
                    </a>
                  )}
                  {!selectedItem.aadhar_url && !selectedItem.license_url && !selectedItem.pan_url && !selectedItem.rc_url && (
                    <p className="no-data">No documents uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="primary-button" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}