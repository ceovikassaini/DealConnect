import React, { useState, useEffect } from "react";

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/testimonials")
      .then(res => res.json())
      .then(data => {
        if (data.success) setTestimonials(data.testimonials);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Testimonials Management</h1>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dealer Name</th>
              <th>Company</th>
              <th>Comment</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: "700" }}>{t.name}</td>
                <td>{t.company}</td>
                <td style={{ color: "#64748b" }}>"{t.comment}"</td>
                <td style={{ color: "#f59e0b", fontWeight: "700" }}>★ {t.rating}</td>
                <td><span style={{ padding: "0.2rem 0.6rem", borderRadius: "12px", backgroundColor: "#d1fae5", color: "#059669", fontSize: "0.75rem", fontWeight: "700" }}>Published</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestimonialsManagement;
