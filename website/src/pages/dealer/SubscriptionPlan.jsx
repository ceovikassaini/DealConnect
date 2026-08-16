import React from "react";
import { Link } from "react-router-dom";
import { FaCrown, FaCheckCircle } from "react-icons/fa";

const SubscriptionPlan = () => {
  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Subscription / Plan</h1>
      <div className="card" style={{ padding: "2rem", maxWidth: "600px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaCrown size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Enterprise Plan Active</h3>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Renews on August 26, 2026</span>
          </div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem 0", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem" }}>
          <li><FaCheckCircle color="#10b981" /> Unlimited Property Listings</li>
          <li><FaCheckCircle color="#10b981" /> Instant Priority Lead Match</li>
          <li><FaCheckCircle color="#10b981" /> Verified Dealer Gold Badge</li>
        </ul>

        <Link to="/pricing" className="btn-outline" style={{ display: "inline-flex" }}>Change Plan</Link>
      </div>
    </div>
  );
};

export default SubscriptionPlan;
