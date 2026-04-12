const PendingRestaurant = ({ restaurants, onApprove, onReject }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Restaurant Name</th>
            <th>Owner</th>
            <th>City</th>
            <th>Applied Date</th>
            <th>Review</th>
            <th>Action</th>
          </tr>
</thead>

        <tbody>
          {restaurants.length > 0 ? (
            restaurants.map((r) => (
              <tr key={r._id}>
                <td className="id-cell">{r.restaurantId || r._id}</td>
                <td className="name-cell">
                  <div className="avatar-initial pending">{r.name.charAt(0)}</div>
                  {r.name}
                </td>
                <td>{r.ownerName}</td>
                <td>{r.city}</td>
                <td className="date-cell">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}</td>
                <td className="actions-cell">
                  <button className="btn-view" onClick={() => onApprove(r, true)}>
                    View Details
                  </button>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons-row">
                    <button className="btn-approve" onClick={() => onApprove(r._id)}>
                      Approve
                    </button>
                    <button className="btn-reject" onClick={() => onReject(r._id)}>
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">No pending applications.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PendingRestaurant;
