import React, { useState } from "react";
import { FaQuoteLeft, FaStar, FaCheckCircle, FaTrash, FaUserTie } from "react-icons/fa";

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: "Rajesh Sharma",
      company: "Sharma & Associates Realty, Sonipat",
      comment: "DealConnect helped us close 3 commercial deals within the first month. The direct dealer-to-dealer network eliminates fake listings completely.",
      rating: 5,
      status: "Published"
    },
    {
      id: 2,
      name: "Vikas Saini",
      company: "vikasdeler Realty Agency, Mohali",
      comment: "The fast site visit scheduling and direct chat between subscribed dealers is a game changer for real estate brokers in Punjab and Haryana.",
      rating: 5,
      status: "Published"
    },
    {
      id: 3,
      name: "Jashanpreet Singh",
      company: "jashan Real Estate, Tricity",
      comment: "Verified property listings with exact dimensions, road facing details, and badges save hours of back-and-forth negotiation.",
      rating: 5,
      status: "Published"
    }
  ]);

  const toggleStatus = (id) => {
    setTestimonials(testimonials.map(t => 
      t.id === id ? { ...t, status: t.status === "Published" ? "Pending" : "Published" } : t
    ));
  };

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Dealer Testimonials & Reviews</h1>
          <p className="admin-page-subtitle">
            Manage public dealer reviews and testimonials displayed on the homepage
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dealer / Broker</th>
              <th>Review & Feedback</th>
              <th>Rating</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                      <FaUserTie size={14} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>{t.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{t.company}</span>
                    </div>
                  </div>
                </td>

                <td style={{ maxWidth: "340px", fontSize: "0.85rem", color: "#475569", lineHeight: "1.4" }}>
                  "{t.comment}"
                </td>

                <td>
                  <div style={{ display: "flex", gap: "2px", color: "#f59e0b" }}>
                    {[...Array(t.rating)].map((_, i) => (
                      <FaStar key={i} size={13} />
                    ))}
                  </div>
                </td>

                <td>
                  <span className={`badge-status ${t.status === "Published" ? "verified" : "pending"}`}>
                    <FaCheckCircle /> {t.status}
                  </span>
                </td>

                <td style={{ textAlign: "right" }}>
                  <button 
                    onClick={() => toggleStatus(t.id)}
                    className={`btn-action ${t.status === "Published" ? "unverify" : "verify"}`}
                  >
                    {t.status === "Published" ? "Unpublish" : "Publish"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestimonialsManagement;
