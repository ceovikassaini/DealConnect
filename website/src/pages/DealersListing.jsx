import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaStar, FaShieldAlt, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";

const DealerCard = ({ dlr }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    if (!dlr.avatar || dlr.avatar.startsWith("/images/admin") || dlr.avatar.trim() === "") {
      return "/default-avatar.svg";
    }
    return dlr.avatar;
  });

  return (
    <div 
      className="card" 
      style={{ 
        padding: "1.75rem 1.5rem", 
        textAlign: "center", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between",
        borderRadius: "16px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        position: "relative"
      }}
    >
      <div>
        {/* Avatar with Circular Frame & Verified Check */}
        <div style={{ position: "relative", width: "88px", height: "88px", margin: "0 auto 1.1rem auto" }}>
          <img 
            src={imgSrc} 
            alt={dlr.name} 
            onError={() => setImgSrc("/default-avatar.svg")}
            style={{ 
              width: "100%", 
              height: "100%", 
              borderRadius: "50%", 
              objectFit: "cover", 
              border: "3px solid rgba(59, 130, 246, 0.35)",
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.2)",
              display: "block",
              backgroundColor: "var(--bg-main)"
            }} 
          />
          <div 
            title="Verified Dealer"
            style={{
              position: "absolute",
              bottom: "0px",
              right: "2px",
              backgroundColor: "#10b981",
              color: "#ffffff",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: "bold",
              boxShadow: "0 2px 6px rgba(16, 185, 129, 0.45)",
              border: "2px solid var(--card-bg, #1e293b)"
            }}
          >
            ✓
          </div>
        </div>

        {/* Dealer Name */}
        <h3 style={{ 
          fontSize: "1.2rem", 
          fontWeight: "700", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "0.4rem", 
          marginBottom: "0.3rem",
          color: "var(--text-main)"
        }}>
          <span>{dlr.name}</span> 
          <FaCheckCircle color="#10b981" size={16} title="Verified Identity" />
        </h3>

        {/* Agency / Company */}
        <p style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: "600", marginBottom: "0.35rem" }}>
          {dlr.company}
        </p>

        {/* Location & Experience */}
        <p style={{ 
          fontSize: "0.82rem", 
          color: "var(--text-muted)", 
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem"
        }}>
          <FaMapMarkerAlt size={12} color="var(--primary)" />
          <span>{dlr.location}</span>
          <span>•</span>
          <FaBriefcase size={11} />
          <span>{dlr.experience} Exp</span>
        </p>
      </div>

      <div>
        {/* Deal Stats Box */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-around", 
          backgroundColor: "var(--bg-main)", 
          padding: "0.85rem 0.5rem", 
          borderRadius: "12px", 
          fontSize: "0.85rem",
          border: "1px solid var(--border-color, rgba(255, 255, 255, 0.06))",
          marginBottom: "0.75rem"
        }}>
          <div>
            <strong style={{ display: "block", fontSize: "1.05rem", color: "var(--text-main)" }}>
              {dlr.dealsClosed}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Deals Closed</span>
          </div>
          <div style={{ 
            borderLeft: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))", 
            borderRight: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))", 
            padding: "0 0.85rem" 
          }}>
            <strong style={{ display: "block", fontSize: "1.05rem", color: "var(--text-main)" }}>
              {dlr.activeListings}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Listings</span>
          </div>
          <div>
            <strong style={{ display: "block", color: "#f59e0b", fontSize: "1.05rem" }}>
              ★ {dlr.rating}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rating</span>
          </div>
        </div>

        {/* Verified Network Member Badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          fontSize: "0.78rem",
          fontWeight: "600",
          color: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          padding: "0.45rem 0.75rem",
          borderRadius: "8px",
          border: "1px solid rgba(16, 185, 129, 0.18)"
        }}>
          <FaShieldAlt size={12} />
          <span>Verified Network Member</span>
        </div>
      </div>
    </div>
  );
};

const DealersListing = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
    fetch(`${API_BASE}/dealers`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        const list = data.body?.dealers || data.dealers || data.body?.list || [];
        if (data.success && list.length > 0) {
          setDealers(list);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "3rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>
            Verified Property Dealers {dealers.length > 0 && <span style={{ fontSize: "1.4rem", color: "var(--primary)" }}>({dealers.length})</span>}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Connect with trusted real estate brokers and verified property agents live from database
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            Loading verified dealers...
          </div>
        ) : dealers.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--text-muted)" }}>No verified dealers found right now.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "1.75rem" 
          }}>
            {dealers.map(dlr => (
              <DealerCard key={dlr.id} dlr={dlr} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealersListing;
