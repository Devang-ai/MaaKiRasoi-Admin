import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminLayout from "./layout/adminlayout";

import Analytics from "./pages/Analytics";
import Chat from "./pages/Chat";
import Complaints from "./pages/Complaints";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import MenuItems from "./pages/MenuItems";
import Orders from "./pages/Order";
import Restaurants from "./pages/Restaurants";
import Riders from "./pages/Riders";
import Setting from "./pages/Setting";
import Subscriptions from "./pages/Subscriptions";
import Users from "./pages/Users";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="orders" element={<Orders />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="restaurants/:restaurantId/menu" element={<MenuItems />} />
          <Route path="riders" element={<Riders />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="chat" element={<Chat />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="setting" element={<Setting />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
