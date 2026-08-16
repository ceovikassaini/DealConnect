import React, { useState, useEffect } from "react";
import { FaHandshake, FaCheckCircle, FaClock } from "react-icons/fa";

const DealsListing = () => {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/deals")
      .then(res => res.json())
      .then(data => {
        if (data.success) setDeals(data.deals);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "3rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Deals Pipeline & Showcase</h1>
          <p style={{ color: "var(--text-muted)" }}>Track active deal matches and successful dealer collaborations</p>
        </div>

        <div style={{ display: "grid", gap: "1.25rem" }}>
          {deals.map(deal => (
            <div key={deal.id} className="card" style={{ padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                  <span className="badge badge-featured">{deal.dealCode}</span>
                  <span style={{
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    backgroundColor: deal.status === "Closed" ? "#d1fae5" : "#fef3c7",
                    color: deal.status === "Closed" ? "#059669" : "#d97706"
                  }}>
                    {deal.status} ({deal.stage})
                  </span>
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.4rem" }}>{deal.propertyTitle}</h3>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", gap: "1.5rem" }}>
                  <span>Seller Dealer: <strong>{deal.sellerDealer}</strong></span>
                  <span>Buyer Dealer: <strong>{deal.buyerDealer}</strong></span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--primary)" }}>{deal.price}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Commission: {deal.commission}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealsListing;
