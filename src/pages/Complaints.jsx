import { useEffect, useState } from "react";
import { complaintAPI } from "../services/api";
import "../styles/complaints.css";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [newComplaint, setNewComplaint] = useState({ user: '', issue: '', priority: 'Low', details: '' });

  // Fetch complaints from backend
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintAPI.getAll(activeStatus);
      setComplaints(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch complaints");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // Refetch when status filter changes
  useEffect(() => {
    fetchComplaints();
  }, [activeStatus]);

  const filtered = complaints.filter((c) => {
    return activeStatus === "All" || c.status === activeStatus;
  });

  const handleResolveClick = (c) => {
    setSelectedComplaint(c);
    setIsResolving(true);
    setResolutionNote("");
  };

  const submitResolution = async () => {
    if (!resolutionNote) return alert("Please add a resolution note.");
    try {
      await complaintAPI.update(selectedComplaint._id, {
        status: 'Resolved',
        resolutionNote
      });
      setIsResolving(false);
      setSelectedComplaint(null);
      fetchComplaints(); // Refresh list
    } catch (err) {
      alert("Failed to resolve complaint");
      console.error(err);
    }
  };

  const handleExport = () => {
    if (!filtered.length) return;
    const headers = ["Complaint ID", "User", "Issue", "Priority", "Status", "Date", "Resolution Note"];
    const rows = filtered.map((c) => [
      c.complaintId || c._id,
      c.user,
      `"${c.issue}"`, // Quote to handle commas in text
      c.priority,
      c.status,
      new Date(c.createdAt).toLocaleDateString(),
      c.resolutionNote ? `"${c.resolutionNote}"` : "N/A"
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complaints_${activeStatus}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="complaints-page">
      <div className="page-header">
        <h1>Complaints</h1>
        <p className="subtitle">Track and resolve user issues</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card complaints-card">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="status-filters">
            {["All", "Open", "In Progress", "Resolved"].map(status => (
              <button
                key={status}
                className={`filter-pill ${activeStatus === status ? 'active' : ''}`}
                onClick={() => setActiveStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="toolbar-right">
            <button className="export-btn" onClick={handleExport}>
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading complaints...</div>
        ) : (
          <>
            {/* Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id}>
                      <td className="id-cell">{c.complaintId}</td>
                      <td className="font-medium">{c.customer}</td>
                      <td>{c.issue}</td>
                      <td>
                        <span className={`priority-dot ${c.priority.toLowerCase()}`}></span>
                        {c.priority}
                      </td>
                      <td className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${c.status.replaceAll(" ", "-").toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="icon-btn view" title="View Details" onClick={() => { setSelectedComplaint(c); setIsResolving(false); }}>
                          👁
                        </button>
                        {c.status !== "Resolved" && (
                          <button
                            className="icon-btn resolve"
                            title="Resolve Complaint"
                            onClick={() => handleResolveClick(c)}
                          >
                            ✨
                          </button>
                        )}
                        <button className="icon-btn delete" title="Delete" onClick={async () => {
                          if (window.confirm("Delete this complaint?")) {
                            try {
                              await complaintAPI.delete(c._id);
                              fetchComplaints();
                            } catch (err) { alert("Failed to delete complaint"); }
                          }
                        }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>


      {/* Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-card slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {isResolving ? "Resolve Complaint" : "Complaint Details"}
                <span className="header-id">{selectedComplaint.complaintId}</span>
              </h3>
              <button className="close-btn" onClick={() => setSelectedComplaint(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <label>Customer:</label> <span>{selectedComplaint.customer}</span>
              </div>
              <div className="detail-row">
                <label>Issue:</label> <span>{selectedComplaint.issue}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label> <span>{new Date(selectedComplaint.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-row full">
                <label>Full Details:</label>
                <p className="detail-text">{selectedComplaint.details}</p>
              </div>

              {isResolving && (
                <div className="resolution-section">
                  <label>Resolution Note</label>
                  <textarea
                    placeholder="Describe how this issue was resolved..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows="4"
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              {isResolving ? (
                <button className="primary-button" onClick={submitResolution}>Mark Resolved</button>
              ) : (
                <button className="secondary-button" onClick={() => setSelectedComplaint(null)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
