import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaSun, FaMoon, FaUserAlt, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

const Header = ({ darkMode, setDarkMode, user, setUser }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("dealconnect_user");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/properties", label: "Properties" },
    { path: "/requirements", label: "Requirements" },
    { path: "/deals", label: "Deals" },
    { path: "/dealers", label: "Dealers" },
    { path: "/pricing", label: "Pricing" },
    { path: "/about", label: "About Us" },
    { path: "/faq", label: "FAQs" },
    { path: "/contact", label: "Contact Us" },
  ];

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 1000,
      backgroundColor: "var(--bg-card)",
      borderBottom: "1px solid var(--border-color)",
      backdropFilter: "blur(12px)",
      boxShadow: "var(--shadow-sm)",
      transition: "var(--transition)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px",
        maxWidth: "1480px",
        margin: "0 auto",
        padding: "0 1.25rem",
        boxSizing: "border-box",
        gap: "0.75rem"
      }}>
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          style={{ display: "flex", alignItems: "center", gap: "0.7rem", textDecoration: "none", flexShrink: 0 }}
        >
          <div style={{
            position: "relative",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
            padding: "2px",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
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
            <div style={{ 
              fontWeight: "900", 
              fontSize: "1.25rem", 
              lineHeight: "1.1", 
              letterSpacing: "-0.03em",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{ color: "var(--text-main)" }}>Deal</span>
              <span style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Connect</span>
            </div>
            <div style={{ 
              fontSize: "0.68rem", 
              color: "var(--text-muted)", 
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              marginTop: "2px"
            }}>
              <span style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                boxShadow: "0 0 6px rgba(16, 185, 129, 0.8)",
                display: "inline-block"
              }} />
              <span>Dealer & Buyer Platform</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "0.2rem", flexWrap: "nowrap" }}>
          {navLinks.map((link) => (
            <NavLink 
              key={link.path}
              to={link.path} 
              end={link.path === "/"}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              style={{ 
                padding: "0.4rem 0.55rem", 
                fontSize: "0.85rem", 
                fontWeight: "600",
                whiteSpace: "nowrap" 
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flexShrink: 0 }}>
          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.95rem",
              transition: "transform 0.2s ease, background-color 0.2s ease",
              cursor: "pointer",
              border: "none",
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {darkMode ? <FaSun style={{ color: "#f59e0b" }} /> : <FaMoon />}
          </button>

          {/* Desktop User Action Buttons */}
          <div className="desktop-user-actions" style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {/* Portal Link Button */}
                <Link 
                  to={user.role === "user" ? "/user/dashboard" : "/dealer/dashboard"} 
                  className="btn-primary" 
                  style={{ 
                    padding: "0.42rem 0.75rem", 
                    fontSize: "0.82rem", 
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    borderRadius: "10px",
                    fontWeight: "700"
                  }}
                >
                  <FaUserAlt style={{ fontSize: "0.78rem" }} /> 
                  <span>{user.role === "user" ? "Dashboard" : "Portal"}</span>
                  <span style={{
                    background: "rgba(255,255,255,0.22)",
                    padding: "1px 6px",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: "600",
                    maxWidth: "85px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {user.name || (user.role === "user" ? "User" : "Dealer")}
                  </span>
                </Link>

                {/* Highly Visible, Stylish Logout Button */}
                <button 
                  onClick={handleLogout} 
                  title="Logout from DealConnect"
                  className="nav-logout-btn"
                  style={{ 
                    background: "rgba(239, 68, 68, 0.1)", 
                    border: "1.5px solid rgba(239, 68, 68, 0.35)", 
                    color: "#ef4444", 
                    fontSize: "0.82rem", 
                    fontWeight: "700", 
                    padding: "0.42rem 0.8rem",
                    borderRadius: "10px",
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.4rem", 
                    cursor: "pointer", 
                    whiteSpace: "nowrap",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 2px 5px rgba(239, 68, 68, 0.08)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ef4444";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "#ef4444";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(239, 68, 68, 0.35)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.35)";
                    e.currentTarget.style.boxShadow = "0 2px 5px rgba(239, 68, 68, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <FaSignOutAlt style={{ fontSize: "0.9rem" }} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline" style={{ padding: "0.42rem 0.85rem", fontSize: "0.82rem", whiteSpace: "nowrap", borderRadius: "10px" }}>
                  Login
                </Link>
                <Link to="/signup" className="btn-primary" style={{ padding: "0.42rem 0.95rem", fontSize: "0.82rem", whiteSpace: "nowrap", borderRadius: "10px" }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button 
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            style={{
              display: "none",
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              border: "none",
              cursor: "pointer"
            }}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: "var(--bg-card)",
          borderTop: "1px solid var(--border-color)",
          padding: "1rem 1.25rem 1.5rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
        }}>
          {navLinks.map((link) => (
            <NavLink 
              key={link.path}
              to={link.path} 
              end={link.path === "/"}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", width: "100%" }}
            >
              {link.label}
            </NavLink>
          ))}

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {user ? (
              <>
                <Link 
                  to={user.role === "user" ? "/user/dashboard" : "/dealer/dashboard"} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="btn-primary" 
                  style={{ justifyContent: "center", padding: "0.75rem 1rem" }}
                >
                  <FaUserAlt /> {user.role === "user" ? "My Dashboard" : "Dealer Portal"} ({user.name || "User"})
                </Link>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    background: "rgba(239, 68, 68, 0.12)", 
                    border: "1.5px solid rgba(239, 68, 68, 0.35)", 
                    color: "#ef4444", 
                    padding: "0.75rem", 
                    borderRadius: "var(--radius-md)", 
                    fontWeight: "700", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "0.5rem",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-outline" style={{ justifyContent: "center" }}>
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ justifyContent: "center" }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Query Styles for Header */}
      <style>{`
        @media (max-width: 1220px) {
          .desktop-nav, .desktop-user-actions {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
