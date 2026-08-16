import React from "react";
import { FaChartBar, FaChartPie, FaArrowUp } from "react-icons/fa";

const ReportsAnalytics = () => {
  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Reports & Analytics</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="admin-card" style={{ textAlign: "center", padding: "2rem" }}>
          <FaChartBar size={40} color="#4f46e5" style={{ marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Properties Growth</h3>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#10b981", margin: "0.5rem 0" }}>+28% MoM</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Highest demand in Residential Plots & 3 BHK Apartments</p>
        </div>

        <div className="admin-card" style={{ textAlign: "center", padding: "2rem" }}>
          <FaPieChart size={40} color="#3b82f6" style={{ marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Dealer Conversion Rate</h3>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#4f46e5", margin: "0.5rem 0" }}>74.5%</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Average deal closure cycle reduced to 6 days</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
