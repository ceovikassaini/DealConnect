import React, { useState } from "react";
import { FaImages, FaPlus, FaCheckCircle, FaTrash, FaEye } from "react-icons/fa";

const BannerManagement = () => {
  const [banners, setBanners] = useState([
    { 
      id: "BAN-01", 
      title: "Direct B2B Deal Matching Across India", 
      subtitle: "Verified Properties • Direct Dealer Chat • Zero Brokerage Leakage", 
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      cta: "Explore Properties",
      active: true 
    },
    { 
      id: "BAN-02", 
      title: "Unlock Pro Dealer Benefits & Exclusive Leads", 
      subtitle: "Get Direct Client Chat, Verified Dealer Badge, and Unlimited Listings", 
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      cta: "Upgrade to Pro",
      active: true 
    }
  ]);

  const toggleStatus = (id) => {
    setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Website Banner Management</h1>
          <p className="admin-page-subtitle">
            Configure homepage hero banners, promotional sliders, and Call-to-Action campaigns
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "90px" }}>Banner Preview</th>
              <th>Banner Heading</th>
              <th>Subtitle / Tagline</th>
              <th>Call to Action</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map(b => (
              <tr key={b.id}>
                <td>
                  <img 
                    src={b.image} 
                    alt={b.title} 
                    style={{ width: "80px", height: "48px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                </td>
                <td>
                  <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>{b.title}</strong>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {b.id}</span>
                </td>
                <td style={{ color: "#475569", fontSize: "0.85rem", maxWidth: "260px" }}>{b.subtitle}</td>
                <td>
                  <span style={{ backgroundColor: "#eef2ff", color: "#4f46e5", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.78rem" }}>
                    {b.cta}
                  </span>
                </td>
                <td>
                  {b.active ? (
                    <span className="badge-status verified">
                      <FaCheckCircle /> Active
                    </span>
                  ) : (
                    <span className="badge-status standard">
                      Inactive
                    </span>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button 
                    onClick={() => toggleStatus(b.id)}
                    className={`btn-action ${b.active ? "unverify" : "verify"}`}
                  >
                    {b.active ? "Deactivate" : "Activate"}
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

export default BannerManagement;
