import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaHandshake, FaUser, FaPhoneAlt, FaEnvelope, FaComments, 
  FaCheckCircle, FaClock, FaCalendarAlt, FaCheckDouble, 
  FaMapMarkerAlt, FaBuilding, FaSearch
} from "react-icons/fa";
import DealChatModal from "../../components/DealChatModal";
import { STAGE_CONFIG } from "../dealer/MyDeals";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const UserDeals = ({ user }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (user) return user;
    const saved = localStorage.getItem("dealconnect_user") || localStorage.getItem("user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealForChat, setSelectedDealForChat] = useState(null);

  const fetchUserDeals = () => {
    setLoading(true);
    const userId = currentUser?.id || "";
    fetch(`${API_BASE}/user/deals?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success && Array.isArray(data.deals)) {
          setDeals(data.deals);
        } else {
          setDeals([]);
        }
      })
      .catch(err => {
        setLoading(false);
        console.error("Fetch user deals error:", err);
      });
  };

  useEffect(() => {
    fetchUserDeals();
  }, [currentUser?.id]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: "800", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <FaHandshake color="var(--primary)" /> My Property Inquiries & Deals
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Track your property inquiries, dealer acceptance status, and live chat once accepted.
          </p>
        </div>

        <button 
          onClick={fetchUserDeals} 
          className="btn-outline" 
          style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)", fontWeight: "600" }}>
          ⏳ Fetching your property inquiries...
        </div>
      ) : deals.length === 0 ? (
        <div className="card" style={{ padding: "3.5rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
          <FaBuilding size={44} style={{ color: "var(--text-muted)", opacity: 0.4, marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "0.4rem" }}>
            No Active Inquiries Yet
          </h3>
          <p style={{ fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto 1.5rem auto" }}>
            Browse verified properties across top cities. Whenever you click or express interest on a property, your deal tracking and dealer chat will appear here.
          </p>
          <Link to="/properties" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <FaBuilding /> Browse Properties
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {deals.map(deal => {
            const currentStage = Number(deal.status) || 1;
            const stageMeta = STAGE_CONFIG[currentStage] || STAGE_CONFIG[1];
            const StageIcon = stageMeta.icon;
            const timeAgo = deal.createdAt ? new Date(deal.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Recently";

            return (
              <div 
                key={deal.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  borderRadius: "18px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-card)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                      border: "1px solid var(--border-color)",
                      flexShrink: 0
                    }}>
                      <img 
                        src={deal.propertyImage || "/logo.png"} 
                        alt={deal.propertyTitle} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        onError={(e) => { e.target.onerror = null; e.target.src = "/logo.png"; }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)" }}>DEAL #{deal.id} • {timeAgo}</span>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)", margin: "0.15rem 0" }}>
                        <Link to={`/properties/${deal.property_id}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {deal.propertyTitle}
                        </Link>
                      </h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", margin: 0 }}>
                        <FaMapMarkerAlt color="var(--primary)" size={12} /> {deal.propertyLocation} • ₹ {deal.propertyPrice}
                      </p>
                    </div>
                  </div>

                  {/* Stage Pill */}
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 0.85rem",
                    borderRadius: "20px",
                    backgroundColor: stageMeta.bg,
                    color: stageMeta.color,
                    fontSize: "0.82rem",
                    fontWeight: "800"
                  }}>
                    <StageIcon size={14} /> Stage {currentStage}: {stageMeta.label}
                  </div>
                </div>

                {/* Progress Pipeline & Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      Dealer: <strong>{deal.dealerName || "Property Dealer"}</strong>
                    </span>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                      {stageMeta.desc}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    <Link to={`/properties/${deal.property_id}`} className="btn-outline" style={{ fontSize: "0.82rem", padding: "0.5rem 0.85rem" }}>
                      View Property
                    </Link>

                    {currentStage >= 2 ? (
                      <button
                        onClick={() => setSelectedDealForChat(deal)}
                        className="btn-primary"
                        style={{
                          backgroundColor: "#2563eb",
                          fontSize: "0.82rem",
                          padding: "0.5rem 1rem",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem"
                        }}
                      >
                        <FaComments /> Live Chat with Dealer
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        ⏳ Waiting for dealer acceptance to chat
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Deal Chat Modal */}
      {selectedDealForChat && (
        <DealChatModal
          deal={selectedDealForChat}
          currentUser={currentUser}
          onClose={() => setSelectedDealForChat(null)}
          onDealUpdated={(updated) => {
            setDeals(prev => prev.map(d => d.id === updated.id ? { ...d, status: updated.status } : d));
            setSelectedDealForChat(prev => ({ ...prev, status: updated.status }));
          }}
        />
      )}
    </div>
  );
};

export default UserDeals;
