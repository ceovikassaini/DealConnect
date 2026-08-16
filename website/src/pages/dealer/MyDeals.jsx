import React from "react";

const MyDeals = () => {
  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>My Deals</h1>
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1rem" }}>
          <div>
            <strong style={{ fontSize: "1.1rem" }}>Deal #DCL-1250: 3 BHK Flat in Sector 7</strong>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Buyer Dealer: Sharma Associates | Commission: 1% (₹65,000)</p>
          </div>
          <span className="badge badge-featured">In Progress (Agreement Signed)</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong style={{ fontSize: "1.1rem" }}>Deal #DCL-1248: Commercial Shop Sector 27</strong>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Buyer Dealer: Shree Shyam Property | Commission: 1.5% (₹1.87 Lakh)</p>
          </div>
          <span className="badge badge-verified">Closed</span>
        </div>
      </div>
    </div>
  );
};

export default MyDeals;
