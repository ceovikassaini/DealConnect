import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  FaChartPie, FaPlusSquare
} from "react-icons/fa";

const UserLayout = ({ user }) => {
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
          <img src={user?.avatar || user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"} alt="User" style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <strong style={{ fontSize: "0.95rem", display: "block", color: "var(--text-main)" }}>{user?.name || "User"}</strong>
            <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>User Portal</span>
          </div>
        </div>

        <NavLink to="/user/dashboard" end className={navClass}>
          <FaChartPie /> My Dashboard
        </NavLink>
        <NavLink to="/user/post-requirement" className={navClass}>
          <FaPlusSquare /> Post Requirement
        </NavLink>
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

export default UserLayout;
