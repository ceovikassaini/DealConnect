import React from "react";
import { FaChartBar, FaChartPie, FaChartLine, FaArrowUp, FaCheckCircle, FaBuilding, FaUserTie } from "react-icons/fa";

const ReportsAnalytics = () => {
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Platform Reports & Analytics</h1>
          <p className="admin-page-subtitle">
            Performance metrics, listing velocity, verification turnaround, and dealer growth trends
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="admin-card" style={{ textAlign: "center", padding: "2.25rem 1.5rem" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "14px", backgroundColor: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", fontSize: "1.5rem" }}>
            <FaChartBar />
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Properties Growth</h3>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#10b981", margin: "0.4rem 0" }}>+28% MoM</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Highest demand in Residential Plots & Commercial Units in Mohali & Sonipat</p>
        </div>

        <div className="admin-card" style={{ textAlign: "center", padding: "2.25rem 1.5rem" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "14px", backgroundColor: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", fontSize: "1.5rem" }}>
            <FaChartPie />
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Dealer Conversion Rate</h3>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#4f46e5", margin: "0.4rem 0" }}>74.5%</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Average deal closure cycle reduced to 6 days via direct chat</p>
        </div>

        <div className="admin-card" style={{ textAlign: "center", padding: "2.25rem 1.5rem" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "14px", backgroundColor: "#faf5ff", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", fontSize: "1.5rem" }}>
            <FaChartLine />
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Admin Verification Speed</h3>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#8b5cf6", margin: "0.4rem 0" }}>&lt; 2 Hours</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>98% of property listings verified within the same business day</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
