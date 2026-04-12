import { useState } from "react";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const toggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="settings-card">
      <h3>System Settings</h3>

      <label>
        <input type="checkbox" checked={settings.email} onChange={() => toggle("email")} />
        Email Notifications
      </label>

      <label>
        <input type="checkbox" checked={settings.sms} onChange={() => toggle("sms")} />
        SMS Alerts
      </label>

      <label>
        <input type="checkbox" checked={settings.push} onChange={() => toggle("push")} />
        Push Notifications
      </label>
    </div>
  );
};

export default SystemSettings;
