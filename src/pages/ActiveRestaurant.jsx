import { useState } from "react";

export default function ActiveRestaurant({ restaurants, onToggleStatus, onDelete, onEdit }) {
  const [page, setPage] = useState(1);

  const PER_PAGE = 5;
  const totalPages = Math.ceil((restaurants?.length || 0) / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const visible = restaurants?.slice(start, start + PER_PAGE) || [];

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Owner</th>
            <th>City</th>
            <th>Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.length > 0 ? (
            visible.map((r) => (
              <tr key={r._id}>
                <td className="id-cell">{r.restaurantId || r._id}</td>
                <td className="name-cell">
                  <div className="name-wrapper">
                    <div className="logo-circle">{r.name.charAt(0)}</div>
                    <span>{r.name}</span>
                  </div>
                </td>
                <td>{r.ownerName}</td>
                <td>{r.city}</td>
                <td>
                  <span className={`type-tag ${r.isVeg ? 'veg' : 'non-veg'}`}>
                    {r.isVeg ? 'Veg Only' : 'Non-Veg'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="icon-btn view"
                    title="View Details"
                    onClick={() => onToggleStatus(r, true)}
                  >
                    👁️
                  </button>
                  <button
                    className="icon-btn view-menu"
                    title="View Menu"
                    onClick={() => (window.location.href = `/restaurants/${r._id}/menu`)}
                  >
                    🍴
                  </button>
                  <button
                    className="icon-btn edit"
                    title="Edit Restaurant"
                    onClick={() => onEdit(r)}
                  >
                    ✏️
                  </button>
                  <button
                    className={`icon-btn status ${r.status === 'active' ? 'suspend' : 'activate'}`}
                    title={r.status === 'active' ? 'Suspend' : 'Activate'}
                    onClick={() => onToggleStatus(r._id, r.status)}
                  >
                    {r.status === 'active' ? '⏸' : '▶'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" className="no-data">No restaurants found.</td></tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}