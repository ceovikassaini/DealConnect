import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserTie, FaCheckCircle, FaStar, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const DealersListing = () => {
  const [dealers, setDealers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/dealers")
      .then(res => res.json())
      .then(data => {
        if (data.success) setDealers(data.dealers);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "3rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Verified Property Dealers</h1>
          <p style={{ color: "var(--text-muted)" }}>Connect with trusted real estate brokers and property agents</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.75rem" }}>
          {dealers.map(dlr => (
            <div key={dlr.id} className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <img src={dlr.avatar} alt={dlr.name} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 1rem auto" }} />
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <Link to={`/dealers/${dlr.id}`}>{dlr.name}</Link> <FaCheckCircle color="#10b981" />
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: "600", marginBottom: "0.4rem" }}>{dlr.company}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>{dlr.location} • {dlr.experience} Exp</p>

              <div style={{ display: "flex", justifyContent: "space-around", backgroundColor: "var(--bg-main)", padding: "0.75rem", borderRadius: "12px", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
                <div>
                  <strong style={{ display: "block" }}>{dlr.dealsClosed}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Deals Closed</span>
                </div>
                <div>
                  <strong style={{ display: "block" }}>{dlr.activeListings}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Listings</span>
                </div>
                <div>
                  <strong style={{ display: "block", color: "#f59e0b" }}>★ {dlr.rating}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rating</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a href={`tel:${dlr.phone}`} className="btn-primary" style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem", justifyContent: "center" }}>
                  <FaPhoneAlt /> Call
                </a>
                <a href={`mailto:${dlr.email}`} className="btn-outline" style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem", justifyContent: "center" }}>
                  <FaEnvelope /> Email
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealersListing;
