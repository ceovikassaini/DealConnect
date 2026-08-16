import React, { useState, useEffect } from "react";

const DealsManagement = () => {
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
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Deals Management</h1>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Deal Code</th>
              <th>Property</th>
              <th>Price</th>
              <th>Seller Dealer</th>
              <th>Buyer Dealer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: "700" }}>{d.dealCode}</td>
                <td>{d.propertyTitle}</td>
                <td style={{ color: "#4f46e5", fontWeight: "700" }}>{d.price}</td>
                <td>{d.sellerDealer}</td>
                <td>{d.buyerDealer}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#fef3c7", color: "#d97706", fontSize: "0.75rem", fontWeight: "700" }}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealsManagement;
