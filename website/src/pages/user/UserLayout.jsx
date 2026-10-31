import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  FaChartPie, FaPlusSquare, FaSignOutAlt, FaHandshake, FaBars, FaTimes
} from "react-icons/fa";

const UserLayout = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSubscribed = user?.isSubscribed === true || user?.subscriptionStatus === "active" || (user?.subscriptionPlan && user?.subscriptionPlan !== "Free" && user?.subscriptionPlan !== "None");

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="portal-layout">
      {/* Mobile Top Sub-Header for Portal */}
      <div className="user-mobile-bar" style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border-color)",
        padding: "0.75rem 1rem",
        display: "none",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        zIndex: 90
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img 
            src={user?.avatar || user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} 
            alt="User" 
            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} 
          />
          <div>
            <strong style={{ fontSize: "0.88rem", display: "block", color: "var(--text-main)" }}>
              {user?.name || "User"}
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: "700" }}>
              User Portal
            </span>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 0.85rem",
            borderRadius: "10px",
            backgroundColor: "var(--primary-light)",
            color: "var(--primary)",
            fontWeight: "700",
            fontSize: "0.82rem",
            border: "none",
            cursor: "pointer"
          }}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
          <span>{sidebarOpen ? "Close Menu" : "Portal Menu"}</span>
        </button>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {sidebarOpen && (
        <div 
          onClick={closeSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 98
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`portal-sidebar ${sidebarOpen ? "sidebar-open-mobile" : ""}`}
        style={{
          width: "260px",
          backgroundColor: "var(--bg-card)",
          borderRight: "1px solid var(--border-color)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.45rem",
          flexShrink: 0
        }}
      >
        <div style={{ padding: "0.5rem 0.75rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src={user?.avatar || user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt="User" style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <strong style={{ fontSize: "0.95rem", display: "block", color: "var(--text-main)" }}>{user?.name || "User"}</strong>
            <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>User Portal</span>
          </div>
        </div>

        <NavLink to="/user/dashboard" end onClick={closeSidebar} className={navClass}>
          <FaChartPie /> My Dashboard
        </NavLink>
        <NavLink to={isSubscribed ? "/user/post-requirement" : "/pricing?msg=subscription_required"} onClick={closeSidebar} className={navClass}>
          <FaPlusSquare /> Post Requirement
        </NavLink>
        <NavLink to="/user/my-deals" onClick={closeSidebar} className={navClass}>
          <FaHandshake /> My Inquiries & Deals
        </NavLink>

        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
          <button
            onClick={() => {
              localStorage.removeItem("dealconnect_user");
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              fontWeight: "700",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#ef4444",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
              e.currentTarget.style.color = "#ef4444";
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main">
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 992px) {
          .user-mobile-bar {
            display: flex !important;
          }
          .portal-sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 99;
            transform: translateX(-100%);
            box-shadow: 0 0 25px rgba(0,0,0,0.3);
            width: 270px !important;
            height: 100vh !important;
            overflow-y: auto;
          }
          .portal-sidebar.sidebar-open-mobile {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
};

const navClass = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "var(--radius-md)",
  fontSize: "0.9rem",
  fontWeight: "600",
  textDecoration: "none",
  color: isActive ? "#ffffff" : "var(--text-main)",
  backgroundColor: isActive ? "var(--primary)" : "transparent",
  transition: "all 0.2s"
});

export default UserLayout;
