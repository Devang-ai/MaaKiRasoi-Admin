import { useState } from "react";

export default function PendingRiders({ riders, onApprove, onDelete }) {
  const [page, setPage] = useState(1);
  const [selectedDocs, setSelectedDocs] = useState(null);

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
            <th>Documents</th>
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
                    <div className="rider-avatar" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', color: '#C2410C' }}>
                      {r.name.charAt(0)}
                    </div>
                    <div className="rider-info">
                      <span className="rider-name">{r.name}</span>
                      <span className="rider-email">{r.email || 'pending@rasoi.com'}</span>
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
                  <button className="view-docs-btn" onClick={() => setSelectedDocs(r)}>
                    📄 View Docs
                  </button>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons-row">
                    <button className="btn-approve" onClick={() => onApprove(r)}>Approve</button>
                    <button className="btn-reject" onClick={() => onDelete(r._id, "pending")}>Reject</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="no-data">No pending applications.</td></tr>
          )}
        </tbody>
      </table>

      {selectedDocs && (
        <div className="modal-overlay" onClick={() => setSelectedDocs(null)}>
          <div className="modal-card slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rider Documents</h3>
              <button className="close-icon" onClick={() => setSelectedDocs(null)}>×</button>
            </div>

            <div className="rider-details-grid">
              <div className="detail-item">
                <label>Rider Name</label>
                <p>{selectedDocs.name}</p>
              </div>
              <div className="detail-item">
                <label>Vehicle</label>
                <p>{selectedDocs.vehicle_type || selectedDocs.vehicle}</p>
              </div>
              <div className="detail-item">
                <label>Vehicle Number</label>
                <p>{selectedDocs.vehicle_number || 'Not Provided'}</p>
              </div>
              {/* Documents Section */}
              <div className="docs-section">
                <h4><span>📂</span> Submitted Documents</h4>
                <div className="docs-preview-grid">
                  {selectedDocs.aadhar_url && (
                    <a href={`http://localhost:5000${selectedDocs.aadhar_url}`} target="_blank" rel="noopener noreferrer" className="doc-preview-card">
                      <div className="doc-photo-wrapper">
                        <img src={`http://localhost:5000${selectedDocs.aadhar_url}`} alt="Aadhar" className="doc-photo" />
                      </div>
                      <div className="doc-label-overlay">
                        <span>Aadhar Card</span>
                        <i className="doc-view-icon">👁</i>
                      </div>
                    </a>
                  )}
                  {selectedDocs.license_url && (
                    <a href={`http://localhost:5000${selectedDocs.license_url}`} target="_blank" rel="noopener noreferrer" className="doc-preview-card">
                      <div className="doc-photo-wrapper">
                        <img src={`http://localhost:5000${selectedDocs.license_url}`} alt="License" className="doc-photo" />
                      </div>
                      <div className="doc-label-overlay">
                        <span>Driving License</span>
                        <i className="doc-view-icon">👁</i>
                      </div>
                    </a>
                  )}
                  {selectedDocs.pan_url && (
                    <a href={`http://localhost:5000${selectedDocs.pan_url}`} target="_blank" rel="noopener noreferrer" className="doc-preview-card">
                      <div className="doc-photo-wrapper">
                        <img src={`http://localhost:5000${selectedDocs.pan_url}`} alt="PAN" className="doc-photo" />
                      </div>
                      <div className="doc-label-overlay">
                        <span>PAN Card</span>
                        <i className="doc-view-icon">👁</i>
                      </div>
                    </a>
                  )}
                  {selectedDocs.rc_url && (
                    <a href={`http://localhost:5000${selectedDocs.rc_url}`} target="_blank" rel="noopener noreferrer" className="doc-preview-card">
                      <div className="doc-photo-wrapper">
                        <img src={`http://localhost:5000${selectedDocs.rc_url}`} alt="RC Doc" className="doc-photo" />
                      </div>
                      <div className="doc-label-overlay">
                        <span>RC Document</span>
                        <i className="doc-view-icon">👁</i>
                      </div>
                    </a>
                  )}
                  {!selectedDocs.aadhar_url && !selectedDocs.license_url && !selectedDocs.pan_url && !selectedDocs.rc_url && (
                    <p className="no-data">No documents uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="primary-button" onClick={() => setSelectedDocs(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
