import React from "react";

const PaymentsManagement = () => {
  const payments = [
    { id: "pay-101", dealer: "Sharma Associates", plan: "Enterprise Plan", amount: "₹4,999", date: "2026-07-26", status: "Success" },
    { id: "pay-102", dealer: "Realty Connect", plan: "Professional Plan", amount: "₹1,999", date: "2026-07-25", status: "Success" },
    { id: "pay-103", dealer: "Property Hub", plan: "Professional Plan", amount: "₹1,999", date: "2026-07-24", status: "Success" }
  ];

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Payments & Subscriptions</h1>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Dealer</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: "700" }}>{p.id}</td>
                <td>{p.dealer}</td>
                <td>{p.plan}</td>
                <td style={{ color: "#10b981", fontWeight: "700" }}>{p.amount}</td>
                <td>{p.date}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#d1fae5", color: "#059669", fontSize: "0.75rem", fontWeight: "700" }}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsManagement;
