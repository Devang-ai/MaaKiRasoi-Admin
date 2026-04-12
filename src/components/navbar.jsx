import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 border-b flex items-center justify-between px-6 transition-colors duration-300" style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--border-color)' }}>
      {/* Left */}
      <h1 className="text-xl font-semibold text-main">Admin Panel</h1>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="text-muted">
          Hello, {user?.name || "Admin"}
        </span>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
          {user?.name?.charAt(0) || "A"}
        </div>

        <button
          onClick={logout}
          className="ml-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
