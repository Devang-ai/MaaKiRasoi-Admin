import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { authAPI } from "../services/api";
import "../styles/settings.css";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  // ===== SYSTEM SETTINGS =====
  const [appSettings, setAppSettings] = useState({
    emailNotifs: true,
    smsAlerts: false,
    pushNotifs: true,
    autoAssignRiders: true,
    acceptOrdersAuto: false,
  });

  // ===== SECURITY =====
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: true,
  });

  // ===== PASSWORD =====
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleToggle = (setter, key) => {
    setter((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert("Please fill all password fields");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }

    try {
      const res = await authAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      alert(res.data.message || "Password Updated Successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="subtitle">Manage system preferences and security</p>
      </div>

      <div className="settings-grid">

        {/* ===== LEFT COLUMN: ROLE & APPEARANCE ===== */}
        <div className="settings-col">
          {/* PROFILE CARD */}
          <div className="settings-card profile-card">
            <div className="profile-header">
              <div className="profile-avatar">ADMIN</div>
              <div className="profile-info">
                <h3>Admin User</h3>
                <span className="role-badge">Super Admin</span>
              </div>
            </div>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>

          {/* THEME CARD */}
          <div className="settings-card">
            <h3>Appearance</h3>
            <div className="theme-selector">
              <button
                className={`theme-opt ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
              >
                ☀ Light Mode
              </button>
              <button
                className={`theme-opt ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                🌙 Dark Mode
              </button>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN: APP & SECURITY ===== */}
        <div className="settings-col wide">

          {/* APPLICATION SETTINGS */}
          <div className="settings-card">
            <h3>Application Settings</h3>
            <div className="toggles-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <label>Email Notifications</label>
                  <p>Receive daily summaries and critical alerts</p>
                </div>
                <button
                  className={`toggle-switch ${appSettings.emailNotifs ? 'on' : 'off'}`}
                  onClick={() => handleToggle(setAppSettings, 'emailNotifs')}
                />
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <label>Push Notifications</label>
                  <p>Real-time alerts for new orders</p>
                </div>
                <button
                  className={`toggle-switch ${appSettings.pushNotifs ? 'on' : 'off'}`}
                  onClick={() => handleToggle(setAppSettings, 'pushNotifs')}
                />
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <label>Auto-Assign Riders</label>
                  <p>Automatically assign nearest rider to order</p>
                </div>
                <button
                  className={`toggle-switch ${appSettings.autoAssignRiders ? 'on' : 'off'}`}
                  onClick={() => handleToggle(setAppSettings, 'autoAssignRiders')}
                />
              </div>
            </div>
          </div>

          {/* SECURITY CARD */}
          <div className="settings-card">
            <h3>Security</h3>

            <div className="input-group">
              <label>Change Password</label>
              <input
                type="password"
                placeholder="Current Password"
                className="settings-input"
                name="current"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
              <div className="password-row">
                <input
                  type="password"
                  placeholder="New Password"
                  className="settings-input"
                  name="new"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="settings-input"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>
              <button className="save-btn" onClick={handleUpdatePassword}>
                Update Password
              </button>
            </div>

            <div className="separator"></div>

            <div className="toggle-item">
              <div className="toggle-info">
                <label>Two-Factor Authentication</label>
                <p>Secure account with SMS code</p>
              </div>
              <button
                className={`toggle-switch ${security.twoFactor ? 'on' : 'off'}`}
                onClick={() => handleToggle(setSecurity, 'twoFactor')}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
