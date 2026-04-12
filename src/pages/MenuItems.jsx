import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { menuAPI } from "../services/api";
import "../styles/restaurant.css"; // Reuse restaurant styles or create new

const MenuItems = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const res = await menuAPI.getByRestaurant(restaurantId);
            setMenuItems(res.data);
        } catch (err) {
            setError("Failed to fetch menu items.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [restaurantId]);

    return (
        <div className="restaurants-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/restaurants')}>← Back</button>
                <h1>Menu Items (Audit View)</h1>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-state">Loading menu...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Available</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.length > 0 ? (
                                menuItems.map(item => (
                                    <tr key={item._id}>
                                        <td>{item.name}</td>
                                        <td>₹{item.price}</td>
                                        <td>{item.category}</td>
                                        <td>{item.isVeg ? "Veg" : "Non-Veg"}</td>
                                        <td>{item.isAvailable ? "Yes" : "No"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">No menu items found for this restaurant.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MenuItems;
