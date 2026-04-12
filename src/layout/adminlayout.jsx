import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8" style={{ backgroundColor: 'var(--bg-app)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
