import React, { useState } from "react";

const AdminSettings = () => {
  const [siteName, setSiteName] = useState("DealConnect");
  const [supportEmail, setSupportEmail] = useState("support@dealconnect.in");
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>System Settings</h1>
      <div className="admin-card">
        {saved && <div style={{ color: "#10b981", fontWeight: "700", marginBottom: "1rem" }}>System Settings Updated Successfully!</div>}
        <form onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Platform Name</label>
            <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Support Email</label>
            <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} style={inputStyle} />
          </div>
          <button type="submit" style={{ backgroundColor: "#4f46e5", color: "#fff", border: "none", padding: "0.65rem 1.5rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
            Save Platform Settings
          </button>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem", color: "#64748b" };
const inputStyle = { width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", fontSize: "0.9rem", outline: "none" };

export default AdminSettings;
