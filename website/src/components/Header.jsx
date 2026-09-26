import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBuilding, FaSun, FaMoon, FaUserAlt, FaSignOutAlt } from "react-icons/fa";

const Header = ({ darkMode, setDarkMode, user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "var(--bg-card)",
      borderBottom: "1px solid var(--border-color)",
      backdropFilter: "blur(8px)",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px"
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <img 
            src="/logo.png" 
            alt="DealConnect Logo" 
            style={{ height: "42px", width: "auto", objectFit: "contain" }} 
          />
          <div>
            <div style={{ fontWeight: "800", fontSize: "1.25rem", color: "var(--text-main)", lineHeight: "1.1" }}>
              DealConnect
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "500" }}>
              Dealer & Buyer Platform
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.75rem", whiteSpace: "nowrap" }}>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Home
          </NavLink>
          <NavLink to="/properties" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Properties
          </NavLink>
          <NavLink to="/requirements" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Requirements
          </NavLink>
          <NavLink to="/deals" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Deals
          </NavLink>
          <NavLink to="/dealers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Dealers
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Pricing
          </NavLink>
          
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            About Us
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            FAQs
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Contact Us
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark/Light Mode"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem"
            }}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {user.role === "user" ? (
                <Link to="/user/dashboard" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                  <FaUserAlt /> My Dashboard ({user.name})
                </Link>
              ) : (
                <Link to="/dealer/dashboard" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                  <FaUserAlt /> Dealer Portal ({user.name})
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                title="Logout"
                style={{ background: "none", color: "#ef4444", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                Login
              </Link>
              <Link to="/signup" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
