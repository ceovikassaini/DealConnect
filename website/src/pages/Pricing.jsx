import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaCrown, FaCheck, FaLock, FaUserTie, FaUser } from "react-icons/fa";

const Pricing = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");
  const [activeRoleTab, setActiveRoleTab] = useState(user?.role === "user" ? "user" : "dealer");

  const handleSubscribe = (planName, price) => {
    if (!user) {
      navigate("/login?msg=login_required");
      return;
    }

    const updatedUser = {
      ...user,
      isSubscribed: true,
      subscriptionPlan: `${planName} (${activeRoleTab === 'dealer' ? 'Dealer' : 'User'})`,
      subscribedAt: new Date().toISOString()
    };

    if (setUser) {
      setUser(updatedUser);
    }
    localStorage.setItem("dealconnect_user", JSON.stringify(updatedUser));
    setSuccessMsg(`🎉 Success! You are now subscribed to the ${planName} (${price}). Your ${activeRoleTab === 'dealer' ? 'Dealer' : 'Buyer'} account features are unlocked!`);
  };

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "3.5rem 0 5rem 0" }}>
      <div className="container" style={{ textAlign: "center" }}>
        
        {/* Active Subscription Alert */}
        {user?.isSubscribed && (
          <div style={{
            backgroundColor: "#dcfce7",
            border: "1px solid #86efac",
            color: "#15803d",
            padding: "1rem 1.5rem",
            borderRadius: "16px",
            maxWidth: "780px",
            margin: "0 auto 2.5rem auto",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            boxShadow: "0 4px 15px rgba(21, 128, 61, 0.08)"
          }}>
            <FaCrown size={22} color="#d97706" />
            <span>Active Subscription: <strong>{user.subscriptionPlan || "Professional Plan"}</strong> — All Features Unlocked!</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #93c5fd",
            color: "#1e40af",
            padding: "1.25rem",
            borderRadius: "16px",
            maxWidth: "780px",
            margin: "0 auto 2.5rem auto",
            fontWeight: "700",
            boxShadow: "0 4px 15px rgba(30, 64, 175, 0.08)"
          }}>
            {successMsg}
            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={() => navigate(user?.role === "user" ? "/user/post-requirement" : "/dealer/add-property")} className="btn-primary" style={{ padding: "0.55rem 1.25rem", fontSize: "0.88rem" }}>
                {user?.role === "user" ? "+ Post Buyer Requirement" : "+ Add / Showcase Property"}
              </button>
              <button onClick={() => navigate("/properties")} className="btn-outline" style={{ padding: "0.55rem 1.25rem", fontSize: "0.88rem" }}>
                Browse Properties
              </button>
            </div>
          </div>
        )}

        <h1 style={{ fontSize: "2.4rem", fontWeight: "800", marginBottom: "0.6rem" }}>Simple, Transparent Subscription Plans</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
          Select whether you are a <strong>Dealer</strong> or a <strong>Buyer / User</strong> to view plans tailored specifically for your needs.
        </p>

        {/* ROLE TOGGLE SWITCHER (Dealer vs User) */}
        <div style={{
          display: "inline-flex",
          backgroundColor: "var(--bg-card)",
          padding: "0.4rem",
          borderRadius: "40px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          marginBottom: "3.5rem",
          gap: "0.3rem"
        }}>
          <button
            onClick={() => setActiveRoleTab("dealer")}
            style={{
              padding: "0.65rem 1.75rem",
              borderRadius: "30px",
              fontWeight: "800",
              fontSize: "0.95rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
              backgroundColor: activeRoleTab === "dealer" ? "#4f46e5" : "transparent",
              color: activeRoleTab === "dealer" ? "#ffffff" : "var(--text-muted)",
              boxShadow: activeRoleTab === "dealer" ? "0 4px 14px rgba(79, 70, 229, 0.35)" : "none"
            }}
          >
            <FaUserTie size={16} /> Dealer Plans
          </button>

          <button
            onClick={() => setActiveRoleTab("user")}
            style={{
              padding: "0.65rem 1.75rem",
              borderRadius: "30px",
              fontWeight: "800",
              fontSize: "0.95rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
              backgroundColor: activeRoleTab === "user" ? "#3b82f6" : "transparent",
              color: activeRoleTab === "user" ? "#ffffff" : "var(--text-muted)",
              boxShadow: activeRoleTab === "user" ? "0 4px 14px rgba(59, 130, 246, 0.35)" : "none"
            }}
          >
            <FaUser size={16} /> User / Buyer Plans
          </button>
        </div>

        {/* 2-PLAN CARDS CONTAINER */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: "2rem",
          alignItems: "stretch",
          maxWidth: "820px",
          margin: "0 auto"
        }}>

          {/* PLAN 1: FREE / BASIC (DEALER OR USER) */}
          <div className="card" style={{ padding: "2.25rem 2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "0.4rem" }}>
                {activeRoleTab === "dealer" ? "Free Dealer / Basic" : "Free Buyer / Guest"}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                {activeRoleTab === "dealer" ? "For casual browsing & basic portal access" : "For browsing verified listings without posting"}
              </p>
              <div style={{ fontSize: "2.75rem", fontWeight: "800", margin: "1.25rem 0", color: "var(--text-main)" }}>₹0</div>
              <ul style={featureListStyle}>
                <li><FaCheckCircle color="#10b981" /> Browse & Search Properties</li>
                <li><FaCheckCircle color="#10b981" /> View Public Listings</li>
                {activeRoleTab === "dealer" ? (
                  <>
                    <li style={{ color: "#9ca3af" }}><FaLock color="#9ca3af" /> Property Listing / Showcase Locked</li>
                    <li style={{ color: "#9ca3af" }}><FaLock color="#9ca3af" /> Direct Buyer Contacts Locked</li>
                  </>
                ) : (
                  <>
                    <li style={{ color: "#9ca3af" }}><FaLock color="#9ca3af" /> Posting Buyer Requirements Locked</li>
                    <li style={{ color: "#9ca3af" }}><FaLock color="#9ca3af" /> Dealer Direct Phone Numbers Locked</li>
                  </>
                )}
              </ul>
            </div>
            {!user ? (
              <Link to="/signup" className="btn-outline" style={{ justifyContent: "center", width: "100%", marginTop: "2rem", padding: "0.75rem" }}>
                Get Started Free
              </Link>
            ) : (
              <div style={{ color: "var(--text-muted)", fontWeight: "700", marginTop: "2rem", padding: "0.65rem", borderRadius: "12px", backgroundColor: "var(--bg-main)", fontSize: "0.88rem" }}>
                Current Basic Tier
              </div>
            )}
          </div>

          {/* PLAN 2: PROFESSIONAL (DEALER OR USER) - VISIBLE RECOMMENDED BADGE */}
          <div className="card" style={{ 
            padding: "2.25rem 2rem", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between", 
            border: "2px solid #4f46e5", 
            position: "relative",
            overflow: "visible", // OVERFLOW VISIBLE FIX FOR RECOMMENDED BADGE
            marginTop: "14px"
          }}>
            {/* RECOMMENDED BADGE (FULLY VISIBLE) */}
            <div style={{ 
              position: "absolute", 
              top: "-15px", 
              left: "50%", 
              transform: "translateX(-50%)", 
              backgroundColor: "#4f46e5", 
              color: "#ffffff", 
              padding: "0.35rem 1.25rem", 
              borderRadius: "20px", 
              fontSize: "0.78rem", 
              fontWeight: "800", 
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
              whiteSpace: "nowrap",
              zIndex: 10
            }}>
              RECOMMENDED
            </div>

            <div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "0.4rem" }}>
                {activeRoleTab === "dealer" ? "Dealer Professional" : "Premium Buyer"}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                {activeRoleTab === "dealer" ? "Full property showcase & unlimited lead matching" : "Post requirements & direct dealer phone contacts"}
              </p>
              
              <div style={{ fontSize: "2.75rem", fontWeight: "800", margin: "1.25rem 0", color: "#4f46e5" }}>
                {activeRoleTab === "dealer" ? "₹1,999" : "₹499"}{" "}
                <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: "600" }}>/mo</span>
              </div>

              <ul style={featureListStyle}>
                {activeRoleTab === "dealer" ? (
                  <>
                    <li><FaCheckCircle color="#10b981" /> Unlimited Property Showcase & Listings</li>
                    <li><FaCheckCircle color="#10b981" /> Unlock Full Buyer & Dealer Contacts</li>
                    <li><FaCheckCircle color="#10b981" /> Verified Dealer Badge & Profile</li>
                    <li><FaCheckCircle color="#10b981" /> Instant Lead Match Alerts</li>
                    <li><FaCheckCircle color="#10b981" /> Priority Directory Ranking</li>
                  </>
                ) : (
                  <>
                    <li><FaCheckCircle color="#10b981" /> Unlimited Buyer Requirement Posting</li>
                    <li><FaCheckCircle color="#10b981" /> Unlock Direct Verified Dealer Phone Numbers</li>
                    <li><FaCheckCircle color="#10b981" /> Premium Verified Buyer Badge</li>
                    <li><FaCheckCircle color="#10b981" /> Instant Property Matching Alerts</li>
                    <li><FaCheckCircle color="#10b981" /> Top Priority Requirement Feed</li>
                  </>
                )}
              </ul>
            </div>

            <button 
              onClick={() => handleSubscribe(
                activeRoleTab === "dealer" ? "Dealer Professional Plan" : "Premium Buyer Plan",
                activeRoleTab === "dealer" ? "₹1,999/mo" : "₹499/mo"
              )}
              className="btn-primary" 
              style={{ justifyContent: "center", width: "100%", marginTop: "2rem", cursor: "pointer", padding: "0.8rem", fontSize: "0.95rem" }}
            >
              {user?.isSubscribed ? (
                <> <FaCheck /> Active Plan </>
              ) : (
                `Subscribe ${activeRoleTab === "dealer" ? "Dealer Professional" : "Premium Buyer"}`
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const featureListStyle = {
  listStyle: "none",
  padding: 0,
  margin: "1.5rem 0",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: "0.85rem",
  fontSize: "0.9rem"
};

export default Pricing;
