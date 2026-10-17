import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { 
  FaChartPie, FaBuilding, FaPlusSquare, FaListAlt, 
  FaHandshake, FaBell, FaCrown, FaCog, FaUserTie, FaSignOutAlt
} from "react-icons/fa";

const DealerLayout = ({ user }) => {
  const isSubscribed = user?.isSubscribed === true || user?.subscriptionStatus === "active" || (user?.subscriptionPlan && user?.subscriptionPlan !== "Free" && user?.subscriptionPlan !== "None");

  return (
    <div style={{ display: "flex", minHeight: "85vh", backgroundColor: "var(--bg-main)" }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: "260px",
        backgroundColor: "var(--bg-card)",
        borderRight: "1px solid var(--border-color)",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }}>
        <div style={{ padding: "0.5rem 0.75rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src={user?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"} alt="User" style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <strong style={{ fontSize: "0.95rem", display: "block", color: "var(--text-main)" }}>{user?.name || "Amit Sharma"}</strong>
            <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>Dealer Portal</span>
          </div>
        </div>

        <NavLink to="/dealer/dashboard" className={navClass}>
          <FaChartPie /> Dealer Dashboard
        </NavLink>
        <NavLink to="/dealer/my-properties" className={navClass}>
          <FaBuilding /> My Properties
        </NavLink>
        <NavLink to={isSubscribed ? "/dealer/add-property" : "/pricing?msg=subscription_required"} className={navClass}>
          <FaPlusSquare /> Add Property
        </NavLink>
        <NavLink to="/dealer/my-requirements" className={navClass}>
          <FaListAlt /> My Requirements
        </NavLink>
        <NavLink to={isSubscribed ? "/dealer/add-requirement" : "/pricing?msg=subscription_required"} className={navClass}>
          <FaPlusSquare /> Add Requirement
        </NavLink>
        <NavLink to="/dealer/my-deals" className={navClass}>
          <FaHandshake /> My Deals
        </NavLink>
        <NavLink to="/dealer/notifications" className={navClass}>
          <FaBell /> Notifications
        </NavLink>
        <NavLink to="/dealer/subscription" className={navClass}>
          <FaCrown /> Subscription / Plan
        </NavLink>
        <NavLink to="/dealer/settings" className={navClass}>
          <FaCog /> Settings
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
      <main style={{ flex: 1, padding: "2rem" }}>
        <Outlet />
      </main>
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

export default DealerLayout;
