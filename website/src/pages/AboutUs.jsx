import React from "react";
import { FaBuilding, FaHandshake, FaShieldAlt, FaUsers } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "1rem", textAlign: "center" }}>
          India's #1 Property Dealer Network
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", textAlign: "center", lineHeight: "1.8", marginBottom: "3rem" }}>
          DealConnect was built to empower property dealers, brokers, and real estate professionals across India. We eliminate inventory matching friction by connecting verified dealers in a secure, transparent environment.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          <StatBox num="2,450+" title="Active Dealers" />
          <StatBox num="12,850+" title="Properties Listed" />
          <StatBox num="3,240+" title="Deals Closed" />
          <StatBox num="99%" title="Verified Network" />
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "1rem" }}>Our Core Values</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: "1.7" }}>
            We believe in transparency, speed, and protecting broker commissions. Every property dealer on our platform goes through a strict verification process to ensure high trust and seamless transaction closures.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ num, title }) => (
  <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
    <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--primary)" }}>{num}</div>
    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{title}</div>
  </div>
);

export default AboutUs;
