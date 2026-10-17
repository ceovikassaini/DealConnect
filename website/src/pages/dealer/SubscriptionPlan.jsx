import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCrown, FaCheckCircle, FaCalendarAlt, FaReceipt, FaCreditCard, FaArrowRight, FaClock } from "react-icons/fa";

const SubscriptionPlan = () => {
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("dealconnect_user") ||
    localStorage.getItem("user") ||
    "{}"
  );

  useEffect(() => {
    const fetchActiveSub = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
        const res = await fetch(`${API_BASE}/user_subscription?user_id=${user.id}`);
        const data = await res.json();
        if (data.success && data.body?.subscription) {
          setSubData(data.body.subscription);
        } else if (user.isSubscribed) {
          // Fallback to user profile state if present
          setSubData({
            plan_name: user.subscriptionPlan || "Standard Plan",
            status: "Active",
            price: "Paid",
            start_date: user.subscribedAt || new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            transaction_id: "DC_TXN_ACTIVE"
          });
        }
      } catch (err) {
        console.error("Error fetching subscription from subscription_buy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSub();
  }, [user?.id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const getRemainingDays = (endDateStr) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getRemainingDays(subData?.end_date);
  const isPro = (subData?.plan_name || "").toLowerCase().includes("professional") || (subData?.plan_name || "").toLowerCase().includes("pro");
  const isBasic = (subData?.plan_name || "").toLowerCase().includes("basic") || (subData?.plan_name || "").toLowerCase().includes("free");

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" }}>
          Subscription & Billing
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Your current plan managed in the database (<code>subscription_buy</code> table).
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading your subscription details...
        </div>
      ) : subData ? (
        <div className="card" style={{ padding: "2rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: "#fef3c7",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FaCrown size={26} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>
                    {subData.plan_name || "Active Plan"}
                  </h3>
                  <span style={{
                    backgroundColor: "#dcfce7",
                    color: "#15803d",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}>
                    {subData.status || "Active"}
                    {daysRemaining !== null && ` (${daysRemaining} Days Left)`}
                  </span>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Saved in database <code>subscription_buy</code>
                </span>
              </div>
            </div>

            {isBasic ? (
              <Link to="/pricing" className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.55rem 1.15rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                ⚡ Upgrade to Professional
              </Link>
            ) : isPro ? (
              <span style={{ 
                backgroundColor: "#ecfdf5", 
                color: "#047857", 
                padding: "0.45rem 1rem", 
                borderRadius: "10px", 
                fontWeight: "700", 
                fontSize: "0.85rem", 
                border: "1px solid #a7f3d0",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem"
              }}>
                <FaCrown color="#d97706" /> Professional Active (Downgrade Not Allowed)
              </span>
            ) : (
              <Link to="/pricing" className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Change Plan
              </Link>
            )}
          </div>

          {/* Upgrade notice for Basic subscribers */}
          {isBasic && (
            <div style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1d4ed8",
              padding: "0.85rem 1.15rem",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.6rem"
            }}>
              <span>💡 You are on the <strong>Basic Plan</strong>. You can upgrade to <strong>Professional Plan</strong> anytime for unlimited listings & direct contact access!</span>
              <Link to="/pricing" style={{ color: "#1d4ed8", fontWeight: "800", textDecoration: "underline" }}>
                Upgrade Now →
              </Link>
            </div>
          )}

          {/* Details Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            padding: "1.25rem",
            backgroundColor: "var(--bg-main)",
            borderRadius: "12px",
            marginBottom: "1.5rem"
          }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>
                Price / Amount
              </span>
              <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>
                {subData.price ? (subData.price.startsWith("₹") ? subData.price : `₹${subData.price}`) : "Active"}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.2rem" }}>
                <FaCalendarAlt size={12} /> Activated On
              </span>
              <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                {formatDate(subData.start_date || subData.createdAt)}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.2rem" }}>
                <FaCalendarAlt size={12} /> Valid Until
              </span>
              <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                {formatDate(subData.end_date)}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.2rem" }}>
                <FaReceipt size={12} /> Transaction ID
              </span>
              <code style={{ fontSize: "0.8rem", color: "var(--primary)" }}>
                {subData.transaction_id || `TXN_${subData.id || "001"}`}
              </code>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.2rem" }}>
                <FaClock size={12} /> Days Pending
              </span>
              <strong style={{ fontSize: "0.95rem", color: "#10b981", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                {daysRemaining !== null ? `${daysRemaining} Days Left` : "Active"}
              </strong>
            </div>
          </div>

          {/* Features Unlocked */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.75rem" }}>
              Unlocked Plan Privileges:
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.6rem", fontSize: "0.88rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaCheckCircle color="#10b981" /> Unlimited Property & Requirement Postings
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaCheckCircle color="#10b981" /> Instant Priority Lead Match Alerts
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaCheckCircle color="#10b981" /> Direct Dealer Phone & WhatsApp Contacts
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaCheckCircle color="#10b981" /> Verified Dealer Gold Badge & Ranking
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "3rem", textAlign: "center", borderRadius: "16px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "var(--primary-light)",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem auto"
          }}>
            <FaCrown size={28} />
          </div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "0.5rem" }}>
            No Active Subscription Found
          </h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "440px", margin: "0 auto 1.5rem auto", fontSize: "0.9rem" }}>
            Subscribe to unlock property listings, buyer requirements, and direct verified dealer contact numbers.
          </p>
          <Link to="/pricing" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            View Subscription Plans <FaArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlan;
