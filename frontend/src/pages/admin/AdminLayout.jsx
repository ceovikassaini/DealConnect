import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  FaChartPie, FaBuilding, FaUserTie, FaUsers, FaListAlt, 
  FaHandshake, FaMoneyBillWave, FaNewspaper, FaImages, 
  FaQuoteLeft, FaChartBar, FaCog, FaSignOutAlt, FaShieldAlt,
  FaExternalLinkAlt
} from "react-icons/fa";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Poll or fetch pending properties count
    const checkPendingProperties = () => {
      fetch("http://localhost:5000/api/properties")
        .then(res => res.json())
        .then(data => {
          const list = data.properties || data.body || [];
          const pending = list.filter(p => Number(p.status) !== 1).length;
          setPendingCount(pending);
        })
        .catch(() => {});
    };

    checkPendingProperties();
    const interval = setInterval(checkPendingProperties, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: "0.5rem 0.5rem 1.25rem 0.5rem", borderBottom: "1px solid #1e293b", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            position: "relative",
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
            padding: "2px",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0
          }}>
            <img 
              src="/logo.png" 
              alt="DealConnect Logo" 
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                backgroundColor: "#ffffff",
                display: "block"
              }} 
            />
          </div>
          <div>
            <div style={{ fontSize: "1.15rem", fontWeight: "900", color: "#fff", display: "block", letterSpacing: "-0.02em", lineHeight: "1.1" }}>
              Deal<span style={{ color: "#38bdf8" }}>Connect</span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: "800", letterSpacing: "0.06em" }}>ADMIN PORTAL</span>
          </div>
        </div>

        <NavLink to="/admin/dashboard" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaChartPie /> <span>Dashboard</span>
          </div>
        </NavLink>

        <NavLink to="/admin/properties" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaBuilding /> <span>Property Verification</span>
          </div>
          {pendingCount > 0 && (
            <span className="sidebar-badge">{pendingCount}</span>
          )}
        </NavLink>

        <NavLink to="/admin/dealers" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaUserTie /> <span>Dealer Network</span>
          </div>
        </NavLink>

        <NavLink to="/admin/requirements" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaListAlt /> <span>Buyer Requirements</span>
          </div>
        </NavLink>

        <NavLink to="/admin/deals" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaHandshake /> <span>Deals Pipeline</span>
          </div>
        </NavLink>

        <NavLink to="/admin/payments" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaMoneyBillWave /> <span>Subscriptions & Plans</span>
          </div>
        </NavLink>

        <NavLink to="/admin/users" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaUsers /> <span>User Management</span>
          </div>
        </NavLink>

        <NavLink to="/admin/banners" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaImages /> <span>Banner Management</span>
          </div>
        </NavLink>

        <NavLink to="/admin/blogs" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaNewspaper /> <span>Blogs & News</span>
          </div>
        </NavLink>

        <NavLink to="/admin/testimonials" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaQuoteLeft /> <span>Testimonials</span>
          </div>
        </NavLink>

        <NavLink to="/admin/reports" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaChartBar /> <span>Reports & Analytics</span>
          </div>
        </NavLink>

        <NavLink to="/admin/settings" className={navClass}>
          <div className="admin-nav-item-inner">
            <FaCog /> <span>Settings</span>
          </div>
        </NavLink>

        {/* Live Website Link */}
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <a 
            href="http://localhost:5173" 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              color: "#94a3b8", 
              textDecoration: "none", 
              fontSize: "0.82rem", 
              fontWeight: "600", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.04)"
            }}
          >
            <FaExternalLinkAlt size={12} color="#10b981" /> Open Live Website
          </a>

          <button 
            onClick={() => navigate("/login")}
            style={{ 
              width: "100%", 
              background: "none", 
              color: "#ef4444", 
              padding: "0.55rem", 
              borderRadius: "8px", 
              border: "1px solid rgba(239, 68, 68, 0.4)", 
              fontWeight: "700", 
              fontSize: "0.82rem",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "0.5rem", 
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

const navClass = ({ isActive }) => "admin-nav-item" + (isActive ? " active" : "");

export default AdminLayout;
