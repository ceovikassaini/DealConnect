import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";

const BannerManagement = () => {
  const [banners] = useState([
    { id: "ban-1", title: "Connect. Match. Close.", subtitle: "India's #1 Property Dealer Network", active: true }
  ]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Banner Management</h1>
        <button style={{ backgroundColor: "#4f46e5", color: "#fff", border: "none", padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <FaPlus /> Add Banner
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {banners.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: "700" }}>{b.title}</td>
                <td>{b.subtitle}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#d1fae5", color: "#059669", fontSize: "0.75rem", fontWeight: "700" }}>Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannerManagement;
