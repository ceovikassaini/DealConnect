import React from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaListAlt, FaHandshake, FaChartLine, FaPlus } from "react-icons/fa";

const DealerDashboard = () => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>Dealer Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Overview of your properties, requirements, and active deal matches</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/dealer/add-property" className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
            <FaPlus /> Add Property
          </Link>
          <Link to="/dealer/add-requirement" className="btn-outline" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
            <FaPlus /> Add Requirement
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <MetricCard icon={<FaBuilding color="#4f46e5" />} title="Active Listings" value="18 Properties" bg="#eef2ff" />
        <MetricCard icon={<FaListAlt color="#10b981" />} title="Posted Requirements" value="8 Requirements" bg="#ecfdf5" />
        <MetricCard icon={<FaHandshake color="#f59e0b" />} title="Closed Deals" value="142 Deals" bg="#fef3c7" />
        <MetricCard icon={<FaChartLine color="#3b82f6" />} title="Matching Leads" value="24 Matched" bg="#eff6ff" />
      </div>

      {/* Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Recent Listings */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Recent Property Listings</h3>
            <Link to="/dealer/my-properties" style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700" }}>View All</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <ItemRow title="100 Sq. Yd. Residential Plot" meta="Sector 14, Sonipat • ₹38.50 Lakh" status="Active" />
            <ItemRow title="Luxury 3 BHK Apartment" meta="Golf Course Road, Gurgaon • ₹2.45 Cr" status="Active" />
            <ItemRow title="Commercial Shop" meta="Sector 27, Sonipat • ₹1.25 Cr" status="Pending" />
          </div>
        </div>

        {/* Recent Requirements */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Recent Requirements</h3>
            <Link to="/dealer/my-requirements" style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700" }}>View All</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <ItemRow title="3 BHK Flat in Gurgaon" meta="Golf Course Ext • Budget: ₹1.5 Cr - ₹2.0 Cr" status="Matching" />
            <ItemRow title="Commercial Office Space 1000 Sq.ft." meta="Cyber City • Rent: ₹80k - ₹1.2 Lakh" status="Active" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, title, value, bg }) => (
  <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
    <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
      {icon}
    </div>
    <div>
      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>{title}</span>
      <strong style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>{value}</strong>
    </div>
  </div>
);

const ItemRow = ({ title, meta, status }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid var(--border-color)" }}>
    <div>
      <strong style={{ fontSize: "0.9rem", display: "block" }}>{title}</strong>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{meta}</span>
    </div>
    <span className="badge badge-featured" style={{ fontSize: "0.7rem" }}>{status}</span>
  </div>
);

export default DealerDashboard;
