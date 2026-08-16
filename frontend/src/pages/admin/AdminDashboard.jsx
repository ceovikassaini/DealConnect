import React, { useState, useEffect } from "react";
import { FaUserTie, FaBuilding, FaHandshake, FaMoneyBillWave, FaChartLine } from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    activeDealers: 2450,
    propertiesListed: 12850,
    dealsClosed: 3240,
    monthlyRevenue: "₹8.45 Lakh"
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/stats")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({
            ...prev,
            activeDealers: data.stats.activeDealers,
            propertiesListed: data.stats.propertiesListed,
            dealsClosed: data.stats.dealsClosed
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>Admin Dashboard</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Executive overview of DealConnect B2B Dealer Platform</p>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <StatCard icon={<FaUserTie color="#4f46e5" />} title="Total Active Dealers" value={stats.activeDealers.toLocaleString()} change="+14% this month" bg="#eef2ff" />
        <StatCard icon={<FaBuilding color="#10b981" />} title="Total Properties Listed" value={stats.propertiesListed.toLocaleString()} change="+18% this month" bg="#ecfdf5" />
        <StatCard icon={<FaHandshake color="#f59e0b" />} title="Total Deals Closed" value={stats.dealsClosed.toLocaleString()} change="+22% this month" bg="#fef3c7" />
        <StatCard icon={<FaMoneyBillWave color="#3b82f6" />} title="Monthly Platform Revenue" value={stats.monthlyRevenue} change="+28% this month" bg="#eff6ff" />
      </div>

      {/* Overview Panels */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        <div className="admin-card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Platform Growth & Activity Chart</h3>
          <div style={{ height: "240px", backgroundColor: "#f8fafc", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #cbd5e1" }}>
            <div style={{ textAlign: "center", color: "#64748b" }}>
              <FaChartLine size={32} color="#4f46e5" style={{ marginBottom: "0.5rem" }} />
              <p style={{ fontWeight: "700" }}>Properties & Leads Growth Trend</p>
              <span style={{ fontSize: "0.8rem" }}>2,450 Verified Dealers • 12,850 Active Listings</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Recent Dealer Verifications</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <ActivityItem name="Sharma Associates" location="Sonipat" status="Verified" />
            <ActivityItem name="Realty Connect" location="Gurgaon" status="Verified" />
            <ActivityItem name="Property Hub" location="Kundli" status="Verified" />
            <ActivityItem name="Shree Shyam Property" location="Sonipat" status="Pending" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, change, bg }) => (
  <div className="admin-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
    <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
      {icon}
    </div>
    <div>
      <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>{title}</span>
      <strong style={{ fontSize: "1.3rem" }}>{value}</strong>
      <span style={{ fontSize: "0.75rem", color: "#10b981", display: "block", fontWeight: "600" }}>{change}</span>
    </div>
  </div>
);

const ActivityItem = ({ name, location, status }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #e2e8f0" }}>
    <div>
      <strong style={{ fontSize: "0.9rem", display: "block" }}>{name}</strong>
      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{location}</span>
    </div>
    <span style={{
      fontSize: "0.7rem",
      fontWeight: "700",
      padding: "0.2rem 0.5rem",
      borderRadius: "10px",
      backgroundColor: status === "Verified" ? "#d1fae5" : "#fef3c7",
      color: status === "Verified" ? "#059669" : "#d97706"
    }}>
      {status}
    </span>
  </div>
);

export default AdminDashboard;
