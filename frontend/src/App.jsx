import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/admin.css";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PropertyManagement from "./pages/admin/PropertyManagement";
import DealerManagement from "./pages/admin/DealerManagement";
import UserManagement from "./pages/admin/UserManagement";
import RequirementsManagement from "./pages/admin/RequirementsManagement";
import DealsManagement from "./pages/admin/DealsManagement";
import PaymentsManagement from "./pages/admin/PaymentsManagement";
import BlogsManagement from "./pages/admin/BlogsManagement";
import BannerManagement from "./pages/admin/BannerManagement";
import TestimonialsManagement from "./pages/admin/TestimonialsManagement";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import Login from "./pages/admin/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="properties" element={<PropertyManagement />} />
          <Route path="dealers" element={<DealerManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="requirements" element={<RequirementsManagement />} />
          <Route path="deals" element={<DealsManagement />} />
          <Route path="payments" element={<PaymentsManagement />} />
          <Route path="blogs" element={<BlogsManagement />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="testimonials" element={<TestimonialsManagement />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
