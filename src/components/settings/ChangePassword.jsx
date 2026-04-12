import { useState } from "react";

const ChangePassword = () => {
  const [form, setForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const handleSubmit = () => {
    if (form.newPass !== form.confirm) {
      alert("Passwords do not match");
      return;
    }

    console.log("Ready for API call", form);
  };

  return (
    <div className="settings-card">
      <h3>Change Password</h3>

      <input
        type="password"
        placeholder="Current Password"
        onChange={(e) => setForm({ ...form, current: e.target.value })}
      />

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setForm({ ...form, newPass: e.target.value })}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
      />

      <button onClick={handleSubmit}>Save Changes</button>
    </div>
  );
};

export default ChangePassword;
