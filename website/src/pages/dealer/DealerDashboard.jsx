import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaListAlt, FaHandshake, FaChartLine, FaPlus, FaSpinner } from "react-icons/fa";

const DealerDashboard = ({ user: propUser }) => {
  const [stats, setStats] = useState({
    myListings: 0,
    myRequirements: 0,
    myDeals: 0,
    matchingLeads: 0,
    recentProperties: [],
    recentRequirements: []
  });
  const [loading, setLoading] = useState(true);

  const user = propUser || JSON.parse(
    localStorage.getItem("dealconnect_user") ||
    localStorage.getItem("user") ||
    "{}"
  );

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
        const userId = user?.id || "";
        const res = await fetch(`${API_BASE}/stats?userId=${userId}&role=dealer`);
        const data = await res.json();
        if (data.success && data.body) {
          setStats(data.body);
        }
      } catch (err) {
        console.error("Error fetching dealer stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  const formatPrice = (val) => {
    if (!val) return "₹ Price on Request";
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
      return `₹${num.toLocaleString("en-IN")}`;
    }
    return String(val).startsWith("₹") ? val : `₹${val}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>
            Dealer Dashboard ({user?.name || "Dealer"})
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Live overview of your properties, requirements, and active deal matches from database
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/dealer/add-property" className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <FaPlus /> Add Property
          </Link>
          <Link to="/dealer/add-requirement" className="btn-outline" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <FaPlus /> Add Requirement
          </Link>
        </div>
      </div>

      {/* Metrics Row (DYNAMIC FROM DATABASE) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <MetricCard 
          icon={<FaBuilding color="#4f46e5" />} 
          title="My Active Listings" 
          value={loading ? "..." : `${stats.myListings} ${stats.myListings === 1 ? "Property" : "Properties"}`} 
          bg="#eef2ff" 
        />
        <MetricCard 
          icon={<FaListAlt color="#10b981" />} 
          title="Posted Requirements" 
          value={loading ? "..." : `${stats.myRequirements} ${stats.myRequirements === 1 ? "Requirement" : "Requirements"}`} 
          bg="#ecfdf5" 
        />
        <MetricCard 
          icon={<FaHandshake color="#f59e0b" />} 
          title="Closed Deals" 
          value={loading ? "..." : `${stats.myDeals} ${stats.myDeals === 1 ? "Deal" : "Deals"}`} 
          bg="#fef3c7" 
        />
        <MetricCard 
          icon={<FaChartLine color="#3b82f6" />} 
          title="Matching Leads" 
          value={loading ? "..." : `${stats.matchingLeads} Matched`} 
          bg="#eff6ff" 
        />
      </div>

      {/* Content Grid (DYNAMIC FROM DATABASE) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Recent Listings */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Recent Property Listings</h3>
            <Link to="/dealer/my-properties" style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700" }}>
              View All ({stats.myListings})
            </Link>
          </div>
          
          {loading ? (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <FaSpinner className="spin" /> Loading properties...
            </div>
          ) : stats.recentProperties && stats.recentProperties.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.recentProperties.map(p => (
                <ItemRow 
                  key={p.id} 
                  title={p.title || p.name || `Property #${p.id}`} 
                  meta={`${p.location || "Location N/A"} • ${formatPrice(p.price)}`} 
                  status={p.status || "Active"} 
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1.75rem 1rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "0.88rem", marginBottom: "0.85rem" }}>No property listings in database yet.</p>
              <Link to="/dealer/add-property" className="btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", display: "inline-flex", gap: "0.3rem" }}>
                <FaPlus /> Add First Property
              </Link>
            </div>
          )}
        </div>

        {/* Recent Requirements */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Recent Requirements</h3>
            <Link to="/dealer/my-requirements" style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700" }}>
              View All ({stats.myRequirements})
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <FaSpinner className="spin" /> Loading requirements...
            </div>
          ) : stats.recentRequirements && stats.recentRequirements.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.recentRequirements.map(r => (
                <ItemRow 
                  key={r.id} 
                  title={r.title || `Requirement #${r.id}`} 
                  meta={`${r.location || "Location N/A"} • Budget: ${r.budget || "N/A"}`} 
                  status={r.status || "Active"} 
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1.75rem 1rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "0.88rem", marginBottom: "0.85rem" }}>No requirements posted in database yet.</p>
              <Link to="/dealer/add-requirement" className="btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", display: "inline-flex", gap: "0.3rem" }}>
                <FaPlus /> Post First Requirement
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, title, value, bg }) => (
  <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", borderRadius: "14px" }}>
    <div style={{ width: "46px", height: "46px", borderRadius: "12px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
      {icon}
    </div>
    <div>
      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>{title}</span>
      <strong style={{ fontSize: "1.25rem", color: "var(--text-main)", fontWeight: "800" }}>{value}</strong>
    </div>
  </div>
);

const ItemRow = ({ title, meta, status }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0", borderBottom: "1px solid var(--border-color)" }}>
    <div>
      <strong style={{ fontSize: "0.9rem", display: "block", color: "var(--text-main)" }}>{title}</strong>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{meta}</span>
    </div>
    <span className="badge badge-featured" style={{ fontSize: "0.72rem", padding: "0.2rem 0.6rem" }}>{status}</span>
  </div>
);

export default DealerDashboard;
