import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaCrown, FaCheck, FaUserTie, FaUser, FaSpinner, FaClock, FaCalendarAlt } from "react-icons/fa";

const fallbackPlans = [
  { id: 1, type: "dealer", name: "Free Dealer / Basic", price: "99", description: "Browse & Search Properties\nView Public Listings" },
  { id: 2, type: "dealer", name: "Dealer Professional", price: "999", description: "Unlimited Property Showcase & Listings\nUnlock Full Buyer & Dealer Contacts\nVerified Dealer Badge & Profile\nInstant Lead Match Alerts\nPriority Directory Ranking" },
  { id: 3, type: "user", name: "Free User/ Basic", price: "49", description: "only see property\nadd requrment" },
  { id: 4, type: "user", name: "User Professional", price: "499", description: "see property\nadd requrment\nsee delar no" }
];

const Pricing = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [activeSubData, setActiveSubData] = useState(null);

  // Determine user role if logged in
  const userRole = user?.role === "dealer" || user?.role === 2 || user?.role === "2" ? "dealer" : (user?.role === "user" ? "user" : null);
  const [activeRoleTab, setActiveRoleTab] = useState(userRole || "dealer");

  useEffect(() => {
    if (userRole) {
      setActiveRoleTab(userRole);
    }
  }, [userRole]);

  // Fetch plans from backend DB table 'subscription'
  useEffect(() => {
    setLoadingPlans(true);
    fetch("http://localhost:5000/api/subscriptions")
      .then(res => res.json())
      .then(data => {
        setLoadingPlans(false);
        const fetchedList = data.body?.list || data.list || data.data || [];
        if (data.success && fetchedList.length > 0) {
          setPlans(fetchedList);
        }
      })
      .catch(err => {
        setLoadingPlans(false);
        console.error("Error fetching subscriptions from DB:", err);
      });
  }, []);

  // Sync active subscription from DB on load if user is logged in
  useEffect(() => {
    if (user?.id) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
      fetch(`${API_BASE}/user_subscription?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.body?.hasSubscription && data.body?.subscription) {
            const sub = data.body.subscription;
            setActiveSubData(sub);
            const updatedUser = {
              ...user,
              isSubscribed: true,
              subscriptionPlan: sub.plan_name,
              subscriptionId: sub.subscription_id,
              subscribedAt: sub.start_date,
              subscriptionEndDate: sub.end_date
            };
            if (!user.isSubscribed || user.subscriptionPlan !== sub.plan_name || user.subscriptionId !== sub.subscription_id) {
              if (setUser) setUser(updatedUser);
              localStorage.setItem("dealconnect_user", JSON.stringify(updatedUser));
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          } else if (data.success && !data.body?.hasSubscription) {
            setActiveSubData(null);
            if (user.isSubscribed) {
              const updatedUser = {
                ...user,
                isSubscribed: false,
                subscriptionPlan: null,
                subscriptionId: null,
                subscriptionEndDate: null
              };
              if (setUser) setUser(updatedUser);
              localStorage.setItem("dealconnect_user", JSON.stringify(updatedUser));
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          }
        })
        .catch(err => console.warn("Could not check user subscription from DB:", err));
    }
  }, [user?.id]);

  const activeType = userRole || activeRoleTab;
  const currentPlans = (plans.length > 0 ? plans : fallbackPlans).filter(p => p.type === activeType);

  const getRemainingDays = () => {
    const endDateStr = activeSubData?.end_date || user?.subscriptionEndDate;
    if (endDateStr) {
      const end = new Date(endDateStr);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    if (user?.subscribedAt) {
      const start = new Date(user.subscribedAt);
      const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 30;
  };

  const getFormattedEndDate = () => {
    const endDateStr = activeSubData?.end_date || user?.subscriptionEndDate;
    let targetDate = null;
    if (endDateStr) {
      targetDate = new Date(endDateStr);
    } else if (user?.subscribedAt) {
      const start = new Date(user.subscribedAt);
      targetDate = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    if (!targetDate || isNaN(targetDate.getTime())) return null;
    return targetDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const daysRemaining = getRemainingDays();
  const formattedEndDate = getFormattedEndDate();

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate("/login?msg=login_required");
      return;
    }

    const subId = Number(user?.subscriptionId || user?.subscription_id || 0);
    const planName = (user?.subscriptionPlan || "").toLowerCase();

    // Prevent buying if this exact plan is already active
    if (user?.isSubscribed && (subId === plan.id || (user?.subscriptionPlan && planName.includes(plan.name.toLowerCase())))) {
      setSuccessMsg(`ℹ️ You already have the ${plan.name} active on your account!`);
      return;
    }

    const isUserOnPro = user?.isSubscribed && (planName.includes("professional") || planName.includes("pro"));
    const isTargetBasic = plan.name.toLowerCase().includes("basic") || plan.name.toLowerCase().includes("free");

    // Prevent downgrade from Professional to Basic
    if (isUserOnPro && isTargetBasic) {
      alert("⚠️ You have an active Professional plan. Downgrade to Basic plan is not allowed!");
      setSuccessMsg("⚠️ Downgrade to Basic is not allowed while Professional plan is active.");
      return;
    }

    const fullPlanName = `${plan.name} (${plan.type === 'dealer' ? 'Dealer' : 'User'})`;
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
    const txnId = `DC_SUB_${Date.now()}`;
    let newSub = null;

    // 1. Save to backend database subscription_buy table
    try {
      const response = await fetch(`${API_BASE}/buy_subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id || 1,
          subscription_id: plan.id,
          plan_name: fullPlanName,
          role: plan.type,
          price: String(plan.price),
          payment_method: "Online",
          transaction_id: txnId
        })
      });
      const resData = await response.json();
      if (!resData.success) {
        alert(resData.message || resData.msg || "Failed to process subscription.");
        return;
      }
      newSub = resData.body?.subscription;
      if (newSub) setActiveSubData(newSub);
      console.log("✅ Subscription saved to subscription_buy database table:", resData);
    } catch (err) {
      console.error("Error calling buy_subscription API:", err);
    }

    // 2. Update local user state & localStorage
    const updatedUser = {
      ...user,
      isSubscribed: true,
      subscriptionPlan: fullPlanName,
      subscriptionId: plan.id,
      subscribedAt: newSub?.start_date || new Date().toISOString(),
      subscriptionEndDate: newSub?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    if (setUser) {
      setUser(updatedUser);
    }
    localStorage.setItem("dealconnect_user", JSON.stringify(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setSuccessMsg(`🎉 Success! Your ${plan.name} (₹${plan.price}) subscription has been activated and saved to database ('subscription_buy' table)! Txn ID: ${txnId}`);
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
            maxWidth: "820px",
            margin: "0 auto 2.5rem auto",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            flexWrap: "wrap",
            boxShadow: "0 4px 15px rgba(21, 128, 61, 0.08)"
          }}>
            <FaCrown size={22} color="#d97706" />
            <span>Active Plan: <strong>{user.subscriptionPlan || "Professional Plan"}</strong></span>
            <span style={{
              backgroundColor: "#15803d",
              color: "#ffffff",
              padding: "0.22rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontWeight: "800"
            }}>
              <FaClock size={12} /> {daysRemaining} Days Pending
            </span>
            {formattedEndDate && (
              <span style={{ fontSize: "0.85rem", color: "#166534" }}>
                (Valid until: <strong>{formattedEndDate}</strong>)
              </span>
            )}
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

        <h1 style={{ fontSize: "2.4rem", fontWeight: "800", marginBottom: "0.6rem" }}>
          Simple, Transparent Subscription Plans
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
          {userRole ? (
            <>Showing <strong>{userRole === "dealer" ? "Dealer" : "Buyer / User"}</strong> subscription plans from database database.</>
          ) : (
            <>Select whether you are a <strong>Dealer</strong> or a <strong>Buyer / User</strong> to view plans.</>
          )}
        </p>

        {/* ROLE TOGGLE SWITCHER (ONLY SHOWN WHEN NOT LOGGED IN) */}
        {!userRole ? (
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
        ) : (
          <div style={{ marginBottom: "2.5rem" }}>
            <span style={{
              backgroundColor: activeType === "dealer" ? "rgba(79, 70, 229, 0.15)" : "rgba(59, 130, 246, 0.15)",
              color: activeType === "dealer" ? "#4f46e5" : "#3b82f6",
              padding: "0.5rem 1.25rem",
              borderRadius: "30px",
              fontWeight: "800",
              fontSize: "0.95rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              {activeType === "dealer" ? <FaUserTie /> : <FaUser />}
              {activeType === "dealer" ? "Dealer Subscription Plans" : "Buyer / User Subscription Plans"}
            </span>
          </div>
        )}

        {/* DYNAMIC PLAN CARDS FROM DATABASE */}
        {loadingPlans ? (
          <div style={{ padding: "3rem", color: "var(--text-muted)", fontSize: "1.1rem" }}>
            <FaSpinner className="spin" size={24} style={{ marginRight: "8px" }} /> Loading subscription plans from database...
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: "2rem",
            alignItems: "stretch",
            maxWidth: "820px",
            margin: "0 auto"
          }}>
            {currentPlans.map((plan, index) => {
              const userPlanLower = (user?.subscriptionPlan || "").toLowerCase();
              const isUserSubscribed = Boolean(user?.isSubscribed);
              const isUserOnPro = isUserSubscribed && (userPlanLower.includes("professional") || userPlanLower.includes("pro"));
              const isUserOnBasic = isUserSubscribed && (userPlanLower.includes("basic") || userPlanLower.includes("free"));

              const isPlanPro = plan.name.toLowerCase().includes("professional") || plan.name.toLowerCase().includes("pro");
              const isPlanBasic = plan.name.toLowerCase().includes("basic") || plan.name.toLowerCase().includes("free");

              const isActivePlan = isUserSubscribed && (
                user?.subscriptionId === plan.id ||
                (isUserOnPro && isPlanPro) ||
                (isUserOnBasic && isPlanBasic) ||
                userPlanLower.includes(plan.name.toLowerCase())
              );

              const isDowngradeDisabled = isUserOnPro && isPlanBasic;
              const isUpgradeAvailable = isUserOnBasic && isPlanPro;

              const descriptions = plan.description 
                ? plan.description.split(/\n|,/).map(s => s.trim()).filter(Boolean)
                : ["Portal Access", "Listing Features"];

              // Determine card border & shadow
              let cardBorder = "1px solid var(--border-color)";
              let cardShadow = "none";
              let cardOpacity = 1;

              if (isActivePlan) {
                cardBorder = "2.5px solid #10b981";
                cardShadow = "0 8px 25px rgba(16, 185, 129, 0.22)";
              } else if (isDowngradeDisabled) {
                cardBorder = "1px dashed var(--border-color)";
                cardOpacity = 0.65;
              } else if (isPlanPro || isUpgradeAvailable) {
                cardBorder = "2.5px solid #4f46e5";
                cardShadow = "0 8px 25px rgba(79, 70, 229, 0.2)";
              }

              return (
                <div 
                  key={plan.id || index} 
                  className="card" 
                  style={{ 
                    padding: "2.25rem 2rem", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "space-between",
                    border: cardBorder,
                    boxShadow: cardShadow,
                    opacity: cardOpacity,
                    position: "relative",
                    overflow: "visible",
                    marginTop: (isActivePlan || isPlanPro) ? "14px" : "0",
                    transition: "all 0.3s ease"
                  }}
                >
                  {/* Badge on top */}
                  {isActivePlan ? (
                    <div style={{ 
                      position: "absolute", 
                      top: "-15px", 
                      left: "50%", 
                      transform: "translateX(-50%)", 
                      backgroundColor: "#10b981", 
                      color: "#ffffff", 
                      padding: "0.38rem 1.3rem", 
                      borderRadius: "20px", 
                      fontSize: "0.78rem", 
                      fontWeight: "800", 
                      letterSpacing: "0.5px",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}>
                      <FaCheck /> SELECTED / CURRENT PLAN
                    </div>
                  ) : isDowngradeDisabled ? (
                    <div style={{ 
                      position: "absolute", 
                      top: "-15px", 
                      left: "50%", 
                      transform: "translateX(-50%)", 
                      backgroundColor: "#64748b", 
                      color: "#ffffff", 
                      padding: "0.32rem 1.1rem", 
                      borderRadius: "20px", 
                      fontSize: "0.74rem", 
                      fontWeight: "800", 
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                      zIndex: 10
                    }}>
                      DOWNGRADE NOT ALLOWED
                    </div>
                  ) : isUpgradeAvailable ? (
                    <div style={{ 
                      position: "absolute", 
                      top: "-15px", 
                      left: "50%", 
                      transform: "translateX(-50%)", 
                      backgroundColor: "#4f46e5", 
                      color: "#ffffff", 
                      padding: "0.38rem 1.3rem", 
                      borderRadius: "20px", 
                      fontSize: "0.78rem", 
                      fontWeight: "800", 
                      letterSpacing: "0.5px",
                      boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
                      whiteSpace: "nowrap",
                      zIndex: 10
                    }}>
                      ⚡ UPGRADE AVAILABLE
                    </div>
                  ) : isPlanPro ? (
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
                  ) : null}

                  <div>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "0.4rem" }}>
                      {plan.name}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                      {plan.type === "dealer" ? "Dealer Subscription Tier" : "Buyer / User Subscription Tier"}
                    </p>
                    
                    <div style={{ fontSize: "2.75rem", fontWeight: "800", margin: "1.25rem 0", color: (isActivePlan ? "#10b981" : (isPlanPro ? "#4f46e5" : "var(--text-main)")) }}>
                      ₹{plan.price}
                      <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: "600" }}>/mo</span>
                    </div>

                    <ul style={featureListStyle}>
                      {descriptions.map((desc, idx) => (
                        <li key={idx} style={{ textTransform: "capitalize" }}>
                          <FaCheckCircle color={isActivePlan ? "#10b981" : "#10b981"} /> {desc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!user ? (
                    <Link to="/login?msg=login_required" className={isPlanPro ? "btn-primary" : "btn-outline"} style={{ justifyContent: "center", width: "100%", marginTop: "2rem", padding: "0.8rem" }}>
                      Login to Subscribe (₹{plan.price})
                    </Link>
                  ) : (
                    <button 
                      onClick={() => handleSubscribe(plan)}
                      disabled={isActivePlan || isDowngradeDisabled}
                      className={isActivePlan ? "btn-outline" : (isDowngradeDisabled ? "btn-outline" : "btn-primary")}
                      style={{ 
                        justifyContent: "center", 
                        width: "100%", 
                        marginTop: "2rem", 
                        cursor: (isActivePlan || isDowngradeDisabled) ? "not-allowed" : "pointer", 
                        padding: "0.8rem", 
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        ...(isActivePlan ? { 
                          borderColor: "#10b981", 
                          color: "#10b981", 
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)"
                        } : isDowngradeDisabled ? {
                          borderColor: "var(--border-color)",
                          color: "var(--text-muted)",
                          backgroundColor: "rgba(148, 163, 184, 0.12)"
                        } : {
                          boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)"
                        })
                      }}
                    >
                      {isActivePlan ? (
                        <> <FaCheck /> Selected (Active Plan) </>
                      ) : isDowngradeDisabled ? (
                        `🚫 Cannot Downgrade to Basic`
                      ) : isUpgradeAvailable ? (
                        `🚀 Upgrade to Professional (₹${plan.price})`
                      ) : (
                        `Subscribe ${plan.name} (₹${plan.price})`
                      )}
                    </button>
                  )}

                  {/* Days Pending & Expiry Date for Selected Active Plan */}
                  {isActivePlan && (
                    <div style={{
                      marginTop: "0.85rem",
                      padding: "0.65rem 0.9rem",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.35)",
                      borderRadius: "12px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontWeight: "800",
                        fontSize: "0.9rem",
                        color: "#10b981"
                      }}>
                        <FaClock size={13} />
                        <span>{daysRemaining} Days Pending / Remaining</span>
                      </div>
                      {formattedEndDate && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.78rem",
                          color: "var(--text-muted)"
                        }}>
                          <FaCalendarAlt size={11} />
                          <span>Valid Until: <strong style={{ color: "var(--text-main)" }}>{formattedEndDate}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
