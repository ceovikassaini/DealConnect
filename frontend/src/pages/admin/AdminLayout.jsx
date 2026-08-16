import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  FaChartPie, FaBuilding, FaUserTie, FaUsers, FaListAlt, 
  FaHandshake, FaMoneyBillWave, FaNewspaper, FaImages, 
  FaQuoteLeft, FaChartBar, FaCog, FaSignOutAlt, FaShieldAlt
} from "react-icons/fa";

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: "0.5rem 0.5rem 1.25rem 0.5rem", borderBottom: "1px solid #1e293b", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <FaShieldAlt size={20} />
          </div>
          <div>
            <strong style={{ fontSize: "1.1rem", color: "#fff", display: "block" }}>DealConnect</strong>
            <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "700" }}>ADMIN PORTAL</span>
          </div>
        </div>

        <NavLink to="/admin/dashboard" className={navClass}>
          <FaChartPie /> Admin Dashboard
        </NavLink>
        <NavLink to="/admin/properties" className={navClass}>
          <FaBuilding /> Property Management
        </NavLink>
        <NavLink to="/admin/dealers" className={navClass}>
          <FaUserTie /> Dealer Management
        </NavLink>
        <NavLink to="/admin/users" className={navClass}>
          <FaUsers /> User Management
        </NavLink>
        <NavLink to="/admin/requirements" className={navClass}>
          <FaListAlt /> Requirements Mgmt
        </NavLink>
        <NavLink to="/admin/deals" className={navClass}>
          <FaHandshake /> Deals Management
        </NavLink>
        <NavLink to="/admin/payments" className={navClass}>
          <FaMoneyBillWave /> Payments & Subscriptions
        </NavLink>
        <NavLink to="/admin/blogs" className={navClass}>
          <FaNewspaper /> Blogs Management
        </NavLink>
        <NavLink to="/admin/banners" className={navClass}>
          <FaImages /> Banner Management
        </NavLink>
        <NavLink to="/admin/testimonials" className={navClass}>
          <FaQuoteLeft /> Testimonials Mgmt
        </NavLink>
        <NavLink to="/admin/reports" className={navClass}>
          <FaChartBar /> Reports & Analytics
        </NavLink>
        <NavLink to="/admin/settings" className={navClass}>
          <FaCog /> System Settings
        </NavLink>

        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #1e293b" }}>
          <button 
            onClick={() => navigate("/")}
            style={{ width: "100%", background: "none", color: "#ef4444", padding: "0.6rem", borderRadius: "8px", border: "1px solid #ef4444", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" }}
          >
            <FaSignOutAlt /> Exit Admin
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
