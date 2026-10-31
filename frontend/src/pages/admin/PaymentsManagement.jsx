import React from "react";
import { FaMoneyBillWave, FaCheckCircle, FaCrown, FaCreditCard, FaSearch } from "react-icons/fa";

const PaymentsManagement = () => {
  const payments = [
    { id: "TXN-894101", dealer: "jashan Real Estate", plan: "Professional Dealer Plan", amount: "₹ 1,999", date: "30 Oct 2026", status: "Success", method: "Razorpay UPI" },
    { id: "TXN-894102", dealer: "vikasdeler Realty Agency", plan: "Professional Dealer Plan", amount: "₹ 1,999", date: "29 Oct 2026", status: "Success", method: "Net Banking" },
    { id: "TXN-894103", dealer: "Realty Connect Hub", plan: "Enterprise Annual Plan", amount: "₹ 9,999", date: "25 Oct 2026", status: "Success", method: "Credit Card" },
    { id: "TXN-894104", dealer: "Mohali Prime Brokers", plan: "Professional Dealer Plan", amount: "₹ 1,999", date: "24 Oct 2026", status: "Success", method: "Razorpay UPI" }
  ];

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Payments & Subscriptions</h1>
          <p className="admin-page-subtitle">
            Revenue tracking: Dealer subscription tiers, plan renewals, and platform transactions
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card primary">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
            <FaMoneyBillWave />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Total Platform Revenue</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800" }}>₹ 8.45 Lakh</strong>
            <span style={{ fontSize: "0.75rem", color: "#059669", display: "block", fontWeight: "600" }}>+28% this month</span>
          </div>
        </div>

        <div className="admin-stat-card purple">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "#faf5ff", color: "#8b5cf6" }}>
            <FaCrown />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", display: "block" }}>Active Pro Subscriptions</span>
            <strong style={{ fontSize: "1.5rem", fontWeight: "800", color: "#7c3aed" }}>142 Dealers</strong>
            <span style={{ fontSize: "0.75rem", color: "#7c3aed", display: "block", fontWeight: "600" }}>₹1,999 / month tier</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Dealer / Broker Firm</th>
              <th>Subscription Plan</th>
              <th>Amount Paid</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td>
                  <span style={{ fontFamily: "monospace", fontWeight: "700", backgroundColor: "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>
                    {p.id}
                  </span>
                </td>
                <td style={{ fontWeight: "700" }}>{p.dealer}</td>
                <td>
                  <span style={{ 
                    padding: "0.25rem 0.6rem", 
                    borderRadius: "12px", 
                    backgroundColor: "#faf5ff", 
                    color: "#7c3aed", 
                    fontSize: "0.76rem", 
                    fontWeight: "700",
                    border: "1px solid #e9d5ff" 
                  }}>
                    {p.plan}
                  </span>
                </td>
                <td style={{ color: "#059669", fontWeight: "800" }}>{p.amount}</td>
                <td style={{ color: "#64748b", fontSize: "0.85rem" }}>{p.method}</td>
                <td style={{ color: "#64748b", fontSize: "0.85rem" }}>{p.date}</td>
                <td>
                  <span className="badge-status verified">
                    <FaCheckCircle /> {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsManagement;
