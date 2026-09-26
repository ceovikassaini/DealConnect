import React, { useState, useEffect } from "react";
import { FaHandshake, FaCheckCircle, FaClock, FaUserTie, FaBuilding, FaRegCompass } from "react-icons/fa";

const DealsListing = () => {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/deals")
      .then(res => res.json())
      .then(data => {
        if (data.success) setDeals(data.deals);
      })
      .catch(() => { });
  }, []);

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "3rem 0" }}>
      <div className="container">
        {/* <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Deals Pipeline & Showcase</h1>
          <p style={{ color: "var(--text-muted)" }}>Track active deal matches and successful dealer collaborations</p>
        </div> */}

        {/* HOW DEALCONNECT WORKS */}
        <section id="how-it-works" style={{ padding: "4.5rem 0", backgroundColor: "var(--bg-main)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>How DealConnect Works?</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "3rem" }}>A simple 4-step process to explore properties and connect</p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2rem"
            }}>
              <StepItem num="01" title="Join as Dealer / User" desc="Create your profile and verify your details" icon={<FaUserTie size={24} color="#4f46e5" />} />
              <StepItem num="02" title="Browse Properties" desc="Search verified property listings across top cities" icon={<FaBuilding size={24} color="#10b981" />} />
              <StepItem num="03" title="Get Subscription" desc="Unlock full dealer phone numbers and email contacts" icon={<FaRegCompass size={24} color="#f59e0b" />} />
              <StepItem num="04" title="Connect & Close" desc="Contact dealers directly and close deals easily." icon={<FaHandshake size={24} color="#3b82f6" />} />
            </div>
          </div>
        </section>
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

const StepItem = ({ num, title, desc, icon }) => (
  <div style={{
    backgroundColor: "var(--bg-card)",
    padding: "2rem 1.5rem",
    borderRadius: "16px",
    border: "1px solid var(--border-color)",
    textAlign: "center"
  }}>
    <div style={{
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      backgroundColor: "var(--primary-light)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1.25rem auto"
    }}>
      {icon}
    </div>
    <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--primary)" }}>{num}</span>
    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0.5rem 0" }}>{title}</h3>
    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{desc}</p>
  </div>
);

export default DealsListing;
