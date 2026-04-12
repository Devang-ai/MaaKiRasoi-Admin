import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded transition-all duration-200 ${isActive
      ? "bg-blue-600 text-white shadow-md"
      : "text-inherit hover:bg-gray-100 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="w-64 border-r p-4 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}>
      <h2 className="text-xl font-bold mb-6 text-main">Admin Panel</h2>

      <nav className="space-y-2">
        <NavLink to="/" end className={linkClass}> <span className="mr-3">🏠</span> Dashboard</NavLink>
        <NavLink to="/users" className={linkClass}> <span className="mr-3">👥</span> Users</NavLink>
        <NavLink to="/subscriptions" className={linkClass}> <span className="mr-3">🍛</span> Subscriptions</NavLink>
        <NavLink to="/orders" className={linkClass}> <span className="mr-3">📦</span> Orders</NavLink>
        <NavLink to="/restaurants" className={linkClass}> <span className="mr-3">🍽️</span> Restaurants</NavLink>
        <NavLink to="/riders" className={linkClass}> <span className="mr-3">🛵</span> Riders</NavLink>
        <NavLink to="/complaints" className={linkClass}> <span className="mr-3">⚠️</span> Complaints</NavLink>
        <NavLink to="/chat" className={linkClass}> <span className="mr-3">💬</span> Chat</NavLink>
        <NavLink to="/analytics" className={linkClass}> <span className="mr-3">📊</span> Analytics</NavLink>
        <NavLink to="/setting" className={linkClass}> <span className="mr-3">⚙️</span> Setting</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
