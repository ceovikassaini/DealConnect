import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaUserTie, FaBuilding, FaHandshake, FaMoneyBillWave, 
  FaChartLine, FaCheckCircle, FaClock, FaShieldAlt, 
  FaExternalLinkAlt, FaListAlt, FaArrowRight, FaCrown 
} from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    activeDealers: 0,
    propertiesListed: 0,
    verifiedProperties: 0,
    pendingProperties: 0,
    premiumProperties: 0,
    requirementsCount: 0,
    dealsClosed: 0,
    monthlyRevenue: "₹8.45 Lakh"
  });

  const [pendingList, setPendingList] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [dealersList, setDealersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);

    // Fetch Properties
    const propPromise = fetch("http://localhost:5000/api/properties")
      .then(res => res.json())
      .then(data => {
        const list = data.properties || data.body || [];
        const verified = list.filter(p => Number(p.status) === 1).length;
        const pending = list.filter(p => Number(p.status) !== 1);
        const premium = list.filter(p => Number(p.badge_id) === 1).length;

        setStats(prev => ({
          ...prev,
          propertiesListed: list.length,
          verifiedProperties: verified,
          pendingProperties: pending.length,
          premiumProperties: premium
        }));

        setPendingList(pending);
        setRecentProperties(list.slice(0, 5));
      })
      .catch(() => {});

    // Fetch Dealers
    const dealerPromise = fetch("http://localhost:5000/api/dealers")
      .then(res => res.json())
      .then(data => {
        const list = (data.body && data.body.dealers) || data.dealers || [];
        setStats(prev => ({ ...prev, activeDealers: list.length || 3 }));
        setDealersList(list.slice(0, 4));
      })
      .catch(() => {});

    // Fetch Requirements
    const reqPromise = fetch("http://localhost:5000/api/requirements")
      .then(res => res.json())
      .then(data => {
        const list = data.body || data.requirements || [];
        setStats(prev => ({ ...prev, requirementsCount: list.length || 0 }));
      })
      .catch(() => {});

    // Fetch Stats summary
    const statsPromise = fetch("http://localhost:5000/api/stats")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.body) {
          setStats(prev => ({
            ...prev,
            dealsClosed: data.body.dealsClosed || 0
          }));
        }
      })
      .catch(() => {});

    Promise.all([propPromise, dealerPromise, reqPromise, statsPromise])
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 1-Click Verification from Dashboard
  const handleQuickVerify = async (propId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/properties/${propId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Quick verify error:", err);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Admin Command Dashboard</h1>
          <p className="admin-page-subtitle">
            Executive control panel for DealConnect B2B Dealer Network & Property Verification
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <a 
            href="http://localhost:5173" 
            target="_blank" 
            rel="noreferrer"
            className="btn-action inspect"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <FaExternalLinkAlt size={12} /> View Live Website
          </a>
        </div>
      </div>

      {/* Attention Alert if properties are awaiting verification */}
      {stats.pendingProperties > 0 && (
        <div style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "14px",
          padding: "1rem 1.5rem",
          marginBottom: "1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
              <FaClock size={18} />
            </div>
            <div>
              <strong style={{ fontSize: "0.95rem", color: "#92400e", display: "block" }}>
                {stats.pendingProperties} Properties Awaiting Admin Verification!
              </strong>
              <span style={{ fontSize: "0.82rem", color: "#b45309" }}>
                New listings posted by dealers require verification before becoming active on the public website.
              </span>
            </div>
          </div>
          <Link 
            to="/admin/properties" 
            className="btn-action"
            style={{ backgroundColor: "#d97706", color: "#fff", textDecoration: "none" }}
          >
            Review & Verify Now
          </Link>
        </div>
      )}

      {/* Top KPI Stat Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card primary">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
            <FaBuilding />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Total Properties Listed</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800" }}>{stats.propertiesListed}</strong>
            <span style={{ fontSize: "0.75rem", color: "#059669", display: "block", fontWeight: "600" }}>
              {stats.verifiedProperties} Verified & Active
            </span>
          </div>
        </div>

        <div className="admin-stat-card warning">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>
            <FaClock />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Pending Verification</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800", color: "#d97706" }}>{stats.pendingProperties}</strong>
            <span style={{ fontSize: "0.75rem", color: "#d97706", display: "block", fontWeight: "700" }}>
              {stats.pendingProperties > 0 ? "Requires Admin Action" : "All Clear"}
            </span>
          </div>
        </div>

        <div className="admin-stat-card success">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#ecfdf5", color: "#10b981" }}>
            <FaUserTie />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Active Broker Network</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800" }}>{stats.activeDealers}</strong>
            <span style={{ fontSize: "0.75rem", color: "#10b981", display: "block", fontWeight: "600" }}>Verified Real Estate Dealers</span>
          </div>
        </div>

        <div className="admin-stat-card purple">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#faf5ff", color: "#8b5cf6" }}>
            <FaListAlt />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Buyer Requirements</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800" }}>{stats.requirementsCount}</strong>
            <span style={{ fontSize: "0.75rem", color: "#7c3aed", display: "block", fontWeight: "600" }}>Live Investor Leads</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Verifications & Dealer Verifications */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Left Column: Properties Awaiting Verification */}
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
                Properties Verification Queue
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
                Admin review queue: Verify new listings before they display on the website
              </p>
            </div>
            <Link 
              to="/admin/properties" 
              style={{ fontSize: "0.84rem", color: "#4f46e5", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              View All <FaArrowRight size={10} />
            </Link>
          </div>

          {pendingList.length === 0 ? (
            <div style={{ 
              padding: "2.5rem 1.5rem", 
              textAlign: "center", 
              backgroundColor: "#f8fafc", 
              borderRadius: "12px", 
              border: "1px dashed #cbd5e1" 
            }}>
              <FaCheckCircle size={36} color="#10b981" style={{ marginBottom: "0.6rem" }} />
              <h4 style={{ fontSize: "0.98rem", fontWeight: "700", color: "#0f172a" }}>
                All Properties are Verified!
              </h4>
              <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
                There are no pending property listings awaiting admin verification right now.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {pendingList.map(p => (
                <div 
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 1rem",
                    backgroundColor: "#fffbeb",
                    borderRadius: "10px",
                    border: "1px solid #fde68a"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img 
                      src={(p.images && p.images[0]) || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80"}
                      alt={p.name}
                      style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }}
                    />
                    <div>
                      <strong style={{ fontSize: "0.9rem", color: "#0f172a", display: "block" }}>
                        {p.name || p.title || `Property #${p.id}`}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {p.location || "Location N/A"} • ₹ {p.price} • {p.dealerName || "Dealer"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={() => handleQuickVerify(p.id)}
                      className="btn-action verify"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
                    >
                      <FaShieldAlt size={11} /> Verify Now
                    </button>
                    <Link 
                      to="/admin/properties"
                      className="btn-action inspect"
                      style={{ padding: "0.4rem 0.7rem", fontSize: "0.78rem", textDecoration: "none" }}
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Dealers & Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Recent Dealers */}
          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a" }}>
                Registered Dealers
              </h3>
              <Link 
                to="/admin/dealers" 
                style={{ fontSize: "0.82rem", color: "#4f46e5", fontWeight: "700", textDecoration: "none" }}
              >
                Manage
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {dealersList.map((d, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.6rem", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                      <FaUserTie size={14} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.88rem", display: "block" }}>{d.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{d.company || d.location}</span>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: "0.72rem", 
                    fontWeight: "700", 
                    padding: "0.2rem 0.5rem", 
                    borderRadius: "8px", 
                    backgroundColor: "#ecfdf5", 
                    color: "#059669" 
                  }}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Navigation Shortcuts */}
          <div className="admin-card">
            <h4 style={{ fontSize: "0.95rem", fontWeight: "800", marginBottom: "0.75rem", color: "#0f172a" }}>
              Quick Admin Shortcuts
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link 
                to="/admin/properties" 
                className="btn-action inspect" 
                style={{ justifyContent: "space-between", textDecoration: "none", padding: "0.6rem 0.9rem" }}
              >
                <span>Verify Properties</span>
                <FaArrowRight size={11} />
              </Link>
              <Link 
                to="/admin/dealers" 
                className="btn-action inspect" 
                style={{ justifyContent: "space-between", textDecoration: "none", padding: "0.6rem 0.9rem" }}
              >
                <span>Manage Dealer Network</span>
                <FaArrowRight size={11} />
              </Link>
              <Link 
                to="/admin/requirements" 
                className="btn-action inspect" 
                style={{ justifyContent: "space-between", textDecoration: "none", padding: "0.6rem 0.9rem" }}
              >
                <span>View Buyer Requirements</span>
                <FaArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
