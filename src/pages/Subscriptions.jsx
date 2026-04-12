import { useEffect, useState } from "react";
import { userAPI, mealPlanAPI } from "../services/api";
import { io } from "socket.io-client";
import "../styles/users.css";

const SOCKET_URL = "http://localhost:5000";

export default function Subscriptions() {
    const [activeTab, setActiveTab] = useState("users"); // "users" or "plans"
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const handleUserAction = async (userId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this subscription?`)) return;
        try {
            if (action === 'delete') {
                await userAPI.deleteSubscription(userId);
            } else {
                await userAPI.updateSubscriptionStatus(userId, action);
            }
            setSelectedUser(null);
            fetchUserSubscriptions();
        } catch(err) {
            alert(`Failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm("Are you sure you want to delete this meal plan from the platform?")) return;
        try {
            await mealPlanAPI.delete(id);
            setMealPlans(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert(`Failed: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchData();

        const socket = io(SOCKET_URL);
        socket.on('subscription_update', () => fetchData());
        socket.on('subscriptionUpdate', () => fetchData());

        return () => socket.disconnect();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, plansRes] = await Promise.all([
                userAPI.getSubscriptions(),
                mealPlanAPI.getAll()
            ]);
            setUserSubscriptions(usersRes.data);
            setMealPlans(plansRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserSubscriptions = async () => {
        const res = await userAPI.getSubscriptions();
        setUserSubscriptions(res.data);
    };

    const filteredUsers = userSubscriptions.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.subscription?.plan || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPlans = mealPlans.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.restaurantId?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="users-page">
            <div className="page-header">
                <h1>Subscriptions & Plans</h1>
                <p className="subtitle">Monitor active user subscriptions and restaurant meal plans.</p>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-container" style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)' }}>
                <button 
                    onClick={() => setActiveTab("users")}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === "users" ? '3px solid var(--color-primary)' : 'none',
                        color: activeTab === "users" ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    User Subscriptions
                </button>
                <button 
                    onClick={() => setActiveTab("plans")}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === "plans" ? '3px solid var(--color-primary)' : 'none',
                        color: activeTab === "plans" ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Restaurant Meal Plans
                </button>
            </div>

            <div className="users-card">
                <div className="card-header">
                    <div className="search-box-wrapper">
                        <input
                            type="text"
                            placeholder={activeTab === "users" ? "Search customers..." : "Search plans or restaurants..."}
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-app)',
                                color: 'var(--color-text-main)',
                                width: '300px'
                            }}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    {activeTab === "users" ? (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Plan Name</th>
                                    <th>Meals/Day</th>
                                    <th>Start Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading subscriptions...</td></tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="user-profile">
                                                    <div className="avatar">{user.name.charAt(0)}</div>
                                                    <div className="info">
                                                        <span className="name">{user.name}</span>
                                                        <span className="email-mobile">{user.userId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span style={{ fontWeight: 600 }}>{user.subscription?.plan || 'N/A'}</span></td>
                                            <td>{user.subscription?.mealsPerDay || 0}</td>
                                            <td className="id-cell">{user.subscription?.startDate || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge ${user.subscription?.status}`}>
                                                    {user.subscription?.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons-row">
                                                    <button className="icon-btn view" onClick={() => setSelectedUser(user)}>👁</button>
                                                    <button className="icon-btn delete" onClick={() => handleUserAction(user._id, 'delete')}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="no-data">No user subscriptions found</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Restaurant</th>
                                    <th>Plan Name</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Items</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading meal plans...</td></tr>
                                ) : filteredPlans.length > 0 ? (
                                    filteredPlans.map((plan) => (
                                        <tr key={plan._id}>
                                            <td>
                                                <div className="user-profile">
                                                    <img src={plan.restaurantId?.imageURL || "https://via.placeholder.com/40"} alt="" className="avatar" style={{ borderRadius: '8px' }} />
                                                    <div className="info">
                                                        <span className="name">{plan.restaurantId?.name || 'Unknown'}</span>
                                                        <span className="email-mobile">{plan.restaurantId?.city || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span style={{ fontWeight: 600 }}>{plan.name}</span></td>
                                            <td>{plan.type}</td>
                                            <td>₹{plan.price}</td>
                                            <td>{plan.items?.length || 0} Items</td>
                                            <td>
                                                <span className={`status-badge ${plan.status}`}>
                                                    {plan.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="icon-btn delete" onClick={() => handleDeletePlan(plan._id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="no-data">No restaurant plans found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h3>Subscription Details</h3>
                            <button className="close-icon" onClick={() => setSelectedUser(null)}>×</button>
                        </div>
                        <div className="user-details-grid">
                            <div className="detail-item">
                                <label>Customer</label>
                                <p>{selectedUser.name} ({selectedUser.userId})</p>
                            </div>
                            <div className="detail-item">
                                <label>Plan Name</label>
                                <p>{selectedUser.subscription?.plan || 'Unknown'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Duration</label>
                                <p>{selectedUser.subscription?.startDate} — {selectedUser.subscription?.endDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
