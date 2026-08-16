import React from "react";
import { FaBell } from "react-icons/fa";

const Notifications = () => {
  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Notifications</h1>
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1rem" }}>
          <FaBell color="var(--primary)" />
          <div>
            <strong style={{ display: "block", fontSize: "0.95rem" }}>New Property Match Found!</strong>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Realty Connect posted a 3 BHK Flat matching your requirement in Gurgaon.</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <FaBell color="var(--primary)" />
          <div>
            <strong style={{ display: "block", fontSize: "0.95rem" }}>Deal Stage Updated</strong>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Deal #DCL-1250 status changed to Agreement Signed.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
