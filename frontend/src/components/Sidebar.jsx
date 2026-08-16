import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const menuSections = [
  {
    label: "MAIN",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    ]
  },
  {
    label: "MANAGEMENT",
    items: [
      { to: "/usersList", label: "Users", icon: "people", activePaths: ["/usersView"] },
      { to: "/driversList", label: "Drivers", icon: "sports_motorsports", activePaths: ["/driversListDeleted", "/driversView"] },
      { to: "/jobs", label: "Rides Management", icon: "local_taxi", activePaths: ["/jobs"] },
      { to: "/payments", label: "Payments", icon: "payments" },
      { to: "/subscriptions", label: "Subscriptions", icon: "card_membership" },
      { to: "/admin/geofences", label: "Geofences", icon: "map" },
    ]
  },
  {
    label: "CONTENT",
    items: [
      { to: "/notifications", label: "Notifications", icon: "notifications" },
      { to: "/promo-codes", label: "Promo Codes", icon: "local_offer" },
      { to: "/contactUs", label: "Support", icon: "support_agent", activePaths: ["/viewContactUs"] },
    ]
  },
  {
    label: "CMS PAGES",
    items: [
      { to: "/about-us", label: "About Us", icon: "info" },
      { to: "/privacy", label: "Privacy Policy", icon: "privacy_tip" },
      { to: "/terms", label: "Terms & Conditions", icon: "gavel" },
      { to: "/faqs", label: "FAQs", icon: "question_answer" },
      { to: "/landingpage", label: "Landing Page", icon: "web" },
      { to: "/safety", label: "Safety Settings", icon: "security" },
    ]
  },
  {
    label: "SETTINGS",
    items: [
      { to: "/settings/configuration", label: "Configuration", icon: "settings" },
      { to: "/settings/vehicles", label: "Vehicles Settings", icon: "local_taxi" },
      { to: "/settings/user-access", label: "User & Access", icon: "admin_panel_settings" },
      { to: "/settings/logs", label: "Logs", icon: "history" }
    ]
  },
];

const permissionMap = {
  "/dashboard": { section: "main", key: "dashboard" },
  "/usersList": { section: "management", key: "users" },
  "/driversList": { section: "management", key: "drivers" },
  "/jobs": { section: "management", key: "rides" },
  "/payments": { section: "management", key: "payments" },
  "/subscriptions": { section: "management", key: "subscriptions" },
  "/admin/geofences": { section: "management", key: "geofences" },
  "/notifications": { section: "content", key: "notifications" },
  "/promo-codes": { section: "content", key: "promoCodes" },
  "/contactUs": { section: "content", key: "support" },
  "/about-us": { section: "cmsPages", key: "aboutUs" },
  "/privacy": { section: "cmsPages", key: "privacy" },
  "/terms": { section: "cmsPages", key: "terms" },
  "/faqs": { section: "cmsPages", key: "faqs" },
  "/landingpage": { section: "cmsPages", key: "landingPage" },
  "/safety": { section: "cmsPages", key: "safety" },
  "/settings/configuration": { section: "settings", key: "configuration" },
  "/settings/vehicles": { section: "settings", key: "vehicles" },
  "/settings/user-access": { section: "settings", key: "userAccess" },
  "/settings/logs": { section: "settings", key: "logs" },
};

const isActivePath = (to, activePaths = []) =>
  window.location.pathname === to ||
  window.location.pathname.startsWith(`${to}/`) ||
  activePaths.some((p) => window.location.pathname.startsWith(p));

const Sidebar = ({ handleLinkClick, isCollapsed }) => {
  const reduxUser = useSelector((state) => state.users?.user);
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {}

  const currentUser = reduxUser || storedUser;

  const isNavItemAllowed = (item) => {
    if (!currentUser) return true;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'subadmin') {
      const config = permissionMap[item.to];
      if (!config) return true;
      const perms = currentUser.permissions || {};
      const secPerm = perms[config.section];
      if (!secPerm) return false;
      const itemPerm = secPerm[config.key];
      if (!itemPerm) return false;
      return !!itemPerm.read;
    }
    return true;
  };

  const renderNavItem = ({ to, label, icon, activePaths = [] }) => (
    <li key={to} style={{ margin: "2px 8px" }}>
      <NavLink
        to={to}
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `sidebar-link ${isActive || isActivePath(to, activePaths) ? "active" : ""}`
        }
        style={({ isActive }) => {
          const active = isActive || isActivePath(to, activePaths);
          return {
            display: "flex",
            alignItems: "center",
            padding: isCollapsed ? "11px 0" : "10px 14px",
            justifyContent: isCollapsed ? "center" : "flex-start",
            borderRadius: "12px",
            textDecoration: "none",
            color: active ? "#fff" : "rgba(255,255,255,0.55)",
            background: active
              ? "var(--grad-primary)"
              : "transparent",
            transition: "all 0.2s ease",
            gap: "12px",
            fontSize: "14px",
            fontWeight: active ? "600" : "400",
            boxShadow: active ? "0 4px 16px var(--p-teal-glow)" : "none",
          };
        }}
      >
        <i
          className="material-icons"
          style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1 }}
        >
          {icon}
        </i>
        {!isCollapsed && (
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </span>
        )}
      </NavLink>
    </li>
  );

  return (
    <aside
      style={{
        width: "100%",
        height: "100vh",
        background: "linear-gradient(180deg, #070b14 0%, #0d1424 50%, #0b1020 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "#ffffff",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          <img src="/logo-MyRyd.png" alt="Myryd Logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
        </div>
        {!isCollapsed && (
          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "16px",
                letterSpacing: "-0.3px",
                background: "var(--grad-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MyRyd
            </div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "1px" }}>
              {currentUser?.role === 'subadmin' ? 'Sub-Admin Panel' : 'Admin Panel'}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "10px 0",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--p-teal-glow) transparent",
        }}
      >
        {menuSections.map((section) => {
          const filteredItems = section.items.filter(isNavItemAllowed);
          if (filteredItems.length === 0) return null;

          return (
            <div key={section.label} style={{ marginBottom: "6px" }}>
              {!isCollapsed && (
                <div
                  style={{
                    color: "rgba(255,255,255,0.22)",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "1.8px",
                    padding: "8px 24px 4px",
                    textTransform: "uppercase",
                  }}
                >
                  {section.label}
                </div>
              )}
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {filteredItems.map(renderNavItem)}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── Footer Profile Link ── */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <NavLink
          to="/profile"
          onClick={handleLinkClick}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "linear-gradient(135deg, var(--p-teal-glow), var(--p-purple-glow))",
              border: "1px solid rgba(255,0,117,0.3)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="material-icons" style={{ color: "var(--p-pink)", fontSize: "18px" }}>
              account_circle
            </i>
          </div>
          {!isCollapsed && (
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: "500" }}>
              {currentUser?.name ? `${currentUser.name} ${currentUser.last_name || ''}` : 'My Profile'}
            </span>
          )}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
