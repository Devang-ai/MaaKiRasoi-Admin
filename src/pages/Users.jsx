import { useEffect, useState } from "react";
import { userAPI } from "../services/api";
import "../styles/users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'Customer', status: 'Active' });

  const ITEMS_PER_PAGE = 5;

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);


  /* ===== ACTIONS ===== */

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      try {
        await userAPI.delete(id);
        fetchUsers(); // Refresh list
      } catch (err) {
        alert("Failed to delete user");
        console.error(err);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await userAPI.update(editUser._id, editUser);
      setEditUser(null);
      fetchUsers(); // Refresh list
    } catch (err) {
      alert("Failed to update user");
      console.error(err);
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p className="subtitle">Manage and monitor all platform users</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card users-card">
        <div className="card-header">
          <h3>All Users</h3>
          <div className="header-actions">
            <span className="user-count">{users.length} Total</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User Details</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="id-cell">{user.userId || user._id}</td>
                      <td>
                        <div className="user-profile">
                          <div className="avatar">{user.name.charAt(0)}</div>
                          <div className="info">
                            <span className="name">{user.name}</span>
                            <span className="email-mobile">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{user.phone}</td>
                      <td>
                        <span className="role-badge">{user.role}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn view" onClick={() => setViewUser(user)} title="View">👁</button>
                        <button className="action-btn edit" onClick={() => setEditUser({ ...user })} title="Edit">✏</button>
                        <button className="action-btn delete" onClick={() => handleDelete(user._id)} title="Delete">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="page-btn prev"
              >
                Previous
              </button>

              <div className="page-numbers">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`page-num ${page === i + 1 ? "active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="page-btn next"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* ===== VIEW MODAL ===== */}
      {viewUser && (
        <div className="modal-overlay" onClick={() => setViewUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-icon" onClick={() => setViewUser(null)}>×</button>
            </div>

            <div className="user-details-grid">
              <div className="detail-item">
                <label>Name</label>
                <p>{viewUser.name}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{viewUser.email}</p>
              </div>
              <div className="detail-item">
                <label>Phone</label>
                <p>{viewUser.phone}</p>
              </div>
              <div className="detail-item">
                <label>Role</label>
                <p>{viewUser.role}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className={`status-badge ${viewUser.status.toLowerCase()}`}>
                  {viewUser.status}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="primary-btn" onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}


      {/* ===== EDIT MODAL ===== */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-icon" onClick={() => setEditUser(null)}>×</button>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={editUser.phone} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <option>Customer</option>
                <option>Rider</option>
                <option>Restaurant Owner</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={editUser.status}
                onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="primary-btn" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
