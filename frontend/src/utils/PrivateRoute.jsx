import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const permissionMap = {
  "/dashboard": { section: "main", key: "dashboard" },
  "/usersList": { section: "management", key: "users" },
  "/usersView": { section: "management", key: "users" },
  "/driversList": { section: "management", key: "drivers" },
  "/driversView": { section: "management", key: "drivers" },
  "/jobs": { section: "management", key: "rides" },
  "/payments": { section: "management", key: "payments" },
  "/subscriptions": { section: "management", key: "subscriptions" },
  "/admin/geofences": { section: "management", key: "geofences" },
  "/notifications": { section: "content", key: "notifications" },
  "/promo-codes": { section: "content", key: "promoCodes" },
  "/contactUs": { section: "content", key: "support" },
  "/viewContactUs": { section: "content", key: "support" },
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

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const reduxUser = useSelector((state) => state.users?.user);
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {}

  const currentUser = reduxUser || storedUser;

  if (!token) {
    return <Navigate to="/" />;
  }

  if (currentUser && currentUser.role === "subadmin") {
    const currentPath = location.pathname;
    // Find matching route rule
    const matchedKey = Object.keys(permissionMap).find(path => currentPath.startsWith(path));
    if (matchedKey && matchedKey !== "/dashboard") {
      const config = permissionMap[matchedKey];
      const perms = currentUser.permissions || {};
      const secPerm = perms[config.section];
      const itemPerm = secPerm ? secPerm[config.key] : null;
      if (!itemPerm || !itemPerm.read) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return element;
};

export default PrivateRoute;
