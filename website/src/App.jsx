import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/dealconnect.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import PropertiesListing from "./pages/PropertiesListing";
import PropertyDetails from "./pages/PropertyDetails";
import RequirementsListing from "./pages/RequirementsListing";
import DealsListing from "./pages/DealsListing";
import DealersListing from "./pages/DealersListing";
import Pricing from "./pages/Pricing";
import BlogListing from "./pages/BlogListing";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

import DealerLayout from "./pages/dealer/DealerLayout";
import DealerDashboard from "./pages/dealer/DealerDashboard";
import MyProperties from "./pages/dealer/MyProperties";
import AddProperty from "./pages/dealer/AddProperty";
import MyRequirements from "./pages/dealer/MyRequirements";
import AddRequirement from "./pages/dealer/AddRequirement";
import MyDeals from "./pages/dealer/MyDeals";
import SubscriptionPlan from "./pages/dealer/SubscriptionPlan";
import Notifications from "./pages/dealer/Notifications";
import DealerSettings from "./pages/dealer/DealerSettings";
import UserLayout from "./pages/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("dealconnect_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null; // default guest unauthenticated
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("dealconnect_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("dealconnect_user");
    }
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header darkMode={darkMode} setDarkMode={setDarkMode} user={user} setUser={setUser} />
        
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/properties" element={<PropertiesListing />} />
            <Route path="/properties/:id" element={<PropertyDetails user={user} />} />
            <Route path="/requirements" element={<RequirementsListing user={user} />} />
            <Route path="/requirements/:id" element={<RequirementsListing user={user} />} />
            <Route path="/deals" element={<DealsListing />} />
            <Route path="/dealers" element={<DealersListing />} />
            <Route path="/pricing" element={<Pricing user={user} setUser={setUser} />} />
            <Route path="/blogs" element={<BlogListing />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<SignUp setUser={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* User Dashboard */}
            <Route path="/user" element={user ? <UserLayout user={user} /> : <Navigate to="/login?msg=login_required" replace />}>
              <Route path="dashboard" element={<UserDashboard user={user} setUser={setUser} />} />
              <Route path="post-requirement" element={<AddRequirement user={user} />} />
            </Route>

            {/* Dealer Dashboard */}
            <Route path="/dealer" element={user ? <DealerLayout user={user} /> : <Navigate to="/login?msg=login_required" replace />}>
              <Route path="dashboard" element={<DealerDashboard />} />
              <Route path="my-properties" element={<MyProperties />} />
              <Route path="add-property" element={<AddProperty user={user} />} />
              <Route path="my-requirements" element={<MyRequirements user={user} />} />
              <Route path="add-requirement" element={<AddRequirement user={user} />} />
              <Route path="my-deals" element={<MyDeals />} />
              <Route path="subscription" element={<SubscriptionPlan />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<DealerSettings user={user} setUser={setUser} />} />
            </Route>
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
