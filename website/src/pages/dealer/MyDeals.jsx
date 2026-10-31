import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaHandshake, FaUser, FaPhoneAlt, FaEnvelope, FaComments, 
  FaCheckCircle, FaClock, FaCalendarAlt, FaCheckDouble, 
  FaMapMarkerAlt, FaFilter, FaSearch, FaArrowRight, FaBuilding,
  FaCrown, FaLock, FaTimes
} from "react-icons/fa";
import DealChatModal from "../../components/DealChatModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const STAGE_CONFIG = {
  1: {
    label: "User showed interest",
    color: "#d97706",
    bg: "#fef3c7",
    icon: FaClock,
    desc: "Buyer clicked or showed interest on this property"
  },
  2: {
    label: "Dealer accepted lead",
    color: "#2563eb",
    bg: "#dbeafe",
    icon: FaCheckCircle,
    desc: "Lead accepted. Live chat is now enabled"
  },
  3: {
    label: "Dealer contacted user",
    color: "#4f46e5",
    bg: "#e0e7ff",
    icon: FaPhoneAlt,
    desc: "Dealer initiated phone / email / chat discussion"
  },
  4: {
    label: "Site visit scheduled",
    color: "#7c3aed",
    bg: "#ede9fe",
    icon: FaCalendarAlt,
    desc: "Date agreed for inspecting the physical site"
  },
  5: {
    label: "Site visit completed",
    color: "#059669",
    bg: "#d1fae5",
    icon: FaCheckDouble,
    desc: "Buyer visited property. Closing in progress"
  }
};

const MyDeals = ({ user }) => {
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDealForChat, setSelectedDealForChat] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [backendDealerHasPro, setBackendDealerHasPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [proModalMsg, setProModalMsg] = useState("");

  // Determine if current dealer has active Professional plan
  const isDealerPro = Boolean(
    backendDealerHasPro ||
    deals.some(d => d.dealerHasPro === true) ||
    (
      (currentUser?.isSubscribed === true || currentUser?.subscriptionStatus === "active") &&
      (
        Number(currentUser?.subscriptionId || currentUser?.subscription_id) === 2 ||
        (currentUser?.subscriptionPlan || "").toLowerCase().includes("professional") ||
        (currentUser?.subscriptionPlan || "").toLowerCase().includes("pro")
      ) && !(currentUser?.subscriptionPlan || "").toLowerCase().includes("basic")
    )
  );

  const fetchDeals = () => {
    setLoading(true);
    const dealerId = currentUser?.id || "";
    fetch(`${API_BASE}/dealer/deals?dealer_id=${dealerId}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.dealerHasPro !== undefined) {
          setBackendDealerHasPro(data.dealerHasPro);
        }
        if (data.success && Array.isArray(data.deals)) {
          setDeals(data.deals);
        } else {
          setDeals([]);
        }
      })
      .catch(err => {
        setLoading(false);
        console.error("Fetch dealer deals error:", err);
      });
  };

  useEffect(() => {
    fetchDeals();
  }, [currentUser?.id]);

  const handleStatusChange = async (dealId, newStatus) => {
    // If dealer wants to accept lead (status 2), check if dealer has Professional subscription
    if (newStatus === 2 && !isDealerPro) {
      setProModalMsg("Chat dealer side se tabhi start hogi jab Professional subscription le rakhi hogi. Lead accept karne aur live buyer chat start karne ke liye Professional Plan (₹999) lein.");
      setShowProModal(true);
      return;
    }

    setUpdatingId(dealId);
    try {
      const res = await fetch(`${API_BASE}/deals/${dealId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      setUpdatingId(null);
      if (data.success) {
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus, canChat: newStatus >= 2 && isDealerPro } : d));
        // If status changed to 2 ("Dealer accepted lead"), open chat right away if Pro
        if (newStatus === 2 && isDealerPro) {
          const updatedDeal = deals.find(d => d.id === dealId);
          if (updatedDeal) {
            setSelectedDealForChat({ ...updatedDeal, status: 2, canChat: true, dealerHasPro: true });
          }
        }
      } else if (data.code === "PRO_REQUIRED" || data.requiresPro) {
        setProModalMsg(data.message || "Chat dealer side se tabhi start hogi jab Professional subscription le rakhi hogi.");
        setShowProModal(true);
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      setUpdatingId(null);
      console.error("Status update error:", err);
    }
  };

  const handleOpenChat = (deal) => {
    if (!isDealerPro) {
      setProModalMsg("Chat dealer side se tabhi start hogi jab Professional subscription le rakhi hogi. Free/Basic plan par chat locked hai.");
      setShowProModal(true);
      return;
    }
    setSelectedDealForChat(deal);
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      (deal.propertyTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.userPhone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.propertyLocation || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "leads") return Number(deal.status) === 1;
    if (activeTab === "accepted") return Number(deal.status) === 2;
    if (activeTab === "in_progress") return Number(deal.status) >= 2 && Number(deal.status) <= 4;
    if (activeTab === "completed") return Number(deal.status) === 5;
    return true;
  });

  const countNewLeads = deals.filter(d => Number(d.status) === 1).length;
  const countAccepted = deals.filter(d => Number(d.status) >= 2).length;
  const countCompleted = deals.filter(d => Number(d.status) === 5).length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: "800", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <FaHandshake color="var(--primary)" /> My Deals & Property Leads
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Whenever a buyer clicks or shows interest in your properties, they arrive here. Accept leads to initiate live chat and manage deal stages.
          </p>
        </div>

        <button 
          onClick={fetchDeals} 
          className="btn-outline" 
          style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
        >
          🔄 Refresh Deals
        </button>
      </div>

      {/* Professional Upgrade Banner if dealer has not subscribed to Professional Plan */}
      {!loading && !isDealerPro && (
        <div style={{
          backgroundColor: "#fffbeb",
          border: "1.5px solid #f59e0b",
          borderRadius: "16px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          boxShadow: "0 4px 18px rgba(245, 158, 11, 0.12)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", maxWidth: "680px" }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <FaCrown size={24} />
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", fontWeight: "800", color: "#92400e" }}>
                Professional Subscription Required for Live Buyer Chat
              </h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#b45309", lineHeight: "1.5" }}>
                Chat dealer side se tabhi start hogi jab Professional subscription (₹999) le rakhi ho. Free/Basic plan par chat locked rehti hai. Upgrade to start real-time messaging with buyers!
              </p>
            </div>
          </div>

          <Link
            to="/pricing?type=dealer"
            className="btn-primary"
            style={{
              backgroundColor: "#d97706",
              borderColor: "#d97706",
              padding: "0.7rem 1.4rem",
              fontSize: "0.9rem",
              fontWeight: "800",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)"
            }}
          >
            <FaCrown /> Upgrade to Professional (₹999)
          </Link>
        </div>
      )}

      {/* Summary Counters */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
        gap: "1rem",
        marginBottom: "1.75rem"
      }}>
        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--primary)" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>Total Inquiries</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "0.25rem" }}>{deals.length}</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Across all listed properties</span>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #f59e0b", backgroundColor: countNewLeads > 0 ? "rgba(245, 158, 11, 0.05)" : "inherit" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "#d97706", fontWeight: "700", textTransform: "uppercase" }}>Stage 1: New Leads</span>
            {countNewLeads > 0 && (
              <span style={{ backgroundColor: "#fef3c7", color: "#b45309", padding: "0.15rem 0.5rem", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "800" }}>
                Action Required
              </span>
            )}
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "0.25rem", color: "#d97706" }}>{countNewLeads}</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Buyers waiting for acceptance</span>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #3b82f6" }}>
          <span style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: "700", textTransform: "uppercase" }}>Active Deals</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "0.25rem", color: "#2563eb" }}>{countAccepted}</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Lead accepted & chat active</span>
        </div>

        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #10b981" }}>
          <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: "700", textTransform: "uppercase" }}>Stage 5: Completed</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "0.25rem", color: "#059669" }}>{countCompleted}</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Site visits completed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Deals (${deals.length})` },
            { id: "leads", label: `New Leads (${countNewLeads})` },
            { id: "in_progress", label: `In Progress (${countAccepted})` },
            { id: "completed", label: `Completed (${countCompleted})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                backgroundColor: activeTab === tab.id ? "var(--primary)" : "var(--bg-main)",
                color: activeTab === tab.id ? "#ffffff" : "var(--text-main)",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ minWidth: "260px", position: "relative" }}>
          <input
            type="text"
            placeholder="Search by buyer, property, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 1rem 0.5rem 2.2rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-main)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
          <FaSearch style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.8rem" }} />
        </div>
      </div>

      {/* Deals List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)", fontWeight: "600" }}>
          ⏳ Fetching your property deals...
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="card" style={{ padding: "3.5rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
          <FaHandshake size={44} style={{ color: "var(--text-muted)", opacity: 0.4, marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "0.4rem" }}>
            No Deals Found
          </h3>
          <p style={{ fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto 1.5rem auto" }}>
            When users click and express interest on your property listings, their leads will appear here with full buyer contact details and stage management.
          </p>
          <Link to="/dealer/my-properties" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <FaBuilding /> View My Properties
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {filteredDeals.map(deal => {
            const currentStage = Number(deal.status) || 1;
            const stageMeta = STAGE_CONFIG[currentStage] || STAGE_CONFIG[1];
            const StageIcon = stageMeta.icon;
            const timeAgo = deal.createdAt ? new Date(deal.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently";

            return (
              <div 
                key={deal.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  borderRadius: "18px",
                  border: currentStage === 1 ? "1.5px solid #f59e0b" : "1px solid var(--border-color)",
                  boxShadow: currentStage === 1 ? "0 4px 20px rgba(245, 158, 11, 0.12)" : "0 4px 15px rgba(0,0,0,0.04)",
                  backgroundColor: "var(--bg-card)",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Header row: Property + Deal ID + Status Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
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
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)" }}>DEAL #{deal.id}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>• {timeAgo}</span>
                      </div>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)", margin: "0.15rem 0" }}>
                        {deal.propertyTitle}
                      </h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", margin: 0 }}>
                        <FaMapMarkerAlt color="var(--primary)" size={12} /> {deal.propertyLocation} • ₹ {deal.propertyPrice}
                      </p>
                    </div>
                  </div>

                  {/* Stage Badge */}
                  <div style={{ textAlign: "right" }}>
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
                </div>

                {/* Middle section: Buyer info & Stage Progress Indicator */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                  gap: "1.25rem",
                  marginBottom: "1.25rem"
                }}>
                  {/* Buyer Contact Card */}
                  <div style={{
                    backgroundColor: "var(--bg-main)",
                    padding: "1rem",
                    borderRadius: "14px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase" }}>
                      Interested Buyer / Lead Details
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                      <div style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary-light)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        fontWeight: "800"
                      }}>
                        {deal.userName ? deal.userName[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.95rem", display: "block", color: "var(--text-main)" }}>
                          {deal.userName}
                        </strong>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                          {deal.userPhone && deal.userPhone !== "N/A" && (
                            <a href={`tel:${deal.userPhone}`} style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "700" }}>
                              <FaPhoneAlt size={11} /> {deal.userPhone}
                            </a>
                          )}
                          {deal.userEmail && deal.userEmail !== "N/A" && (
                            <a href={`mailto:${deal.userEmail}`} style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                              <FaEnvelope size={11} /> {deal.userEmail}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Pipeline Progress Tracker */}
                  <div style={{
                    backgroundColor: "var(--bg-main)",
                    padding: "1rem",
                    borderRadius: "14px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase" }}>
                        Deal Progress Pipeline
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: "800", color: stageMeta.color }}>
                        {currentStage * 20}% Completed
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: "8px", backgroundColor: "rgba(0,0,0,0.08)", borderRadius: "10px", overflow: "hidden", marginBottom: "0.6rem" }}>
                      <div style={{
                        height: "100%",
                        width: `${currentStage * 20}%`,
                        backgroundColor: stageMeta.color,
                        borderRadius: "10px",
                        transition: "width 0.4s ease"
                      }} />
                    </div>

                    {/* 5 Status Steps Dots */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      <span style={{ fontWeight: currentStage >= 1 ? "800" : "500", color: currentStage >= 1 ? "#d97706" : "inherit" }}>1. Interest</span>
                      <span style={{ fontWeight: currentStage >= 2 ? "800" : "500", color: currentStage >= 2 ? "#2563eb" : "inherit" }}>2. Accepted</span>
                      <span style={{ fontWeight: currentStage >= 3 ? "800" : "500", color: currentStage >= 3 ? "#4f46e5" : "inherit" }}>3. Contacted</span>
                      <span style={{ fontWeight: currentStage >= 4 ? "800" : "500", color: currentStage >= 4 ? "#7c3aed" : "inherit" }}>4. Site Visit</span>
                      <span style={{ fontWeight: currentStage >= 5 ? "800" : "500", color: currentStage >= 5 ? "#059669" : "inherit" }}>5. Closed</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row: Accept Lead + Status Dropdown + Live Chat */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px dashed var(--border-color)"
                }}>
                  {/* Status Dropdown Selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)" }}>
                      Manage Stage:
                    </span>
                    <select
                      value={currentStage}
                      disabled={updatingId === deal.id}
                      onChange={(e) => handleStatusChange(deal.id, Number(e.target.value))}
                      style={{
                        padding: "0.5rem 0.85rem",
                        borderRadius: "10px",
                        border: "1.5px solid var(--border-color)",
                        backgroundColor: "var(--bg-main)",
                        color: "var(--text-main)",
                        fontWeight: "700",
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      <option value={1}>1. User showed interest</option>
                      <option value={2}>2. Dealer accepted lead (Enables Chat)</option>
                      <option value={3}>3. Dealer contacted user</option>
                      <option value={4}>4. Site visit scheduled</option>
                      <option value={5}>5. Site visit completed</option>
                    </select>
                    {updatingId === deal.id && <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>Updating...</span>}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    {/* If Stage 1: Highlighted "Accept Lead" Button */}
                    {currentStage === 1 && (
                      <button
                        onClick={() => handleStatusChange(deal.id, 2)}
                        disabled={updatingId === deal.id}
                        className="btn-primary"
                        style={{
                          backgroundColor: isDealerPro ? "#2563eb" : "#d97706",
                          borderColor: isDealerPro ? "#2563eb" : "#d97706",
                          padding: "0.55rem 1.15rem",
                          fontSize: "0.85rem",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem"
                        }}
                      >
                        {isDealerPro ? <FaCheckCircle /> : <FaCrown />} Accept Lead & Start Chat {!isDealerPro && "(Pro Required)"}
                      </button>
                    )}

                    {/* Chat Button (Available when accepted, status >= 2) */}
                    {currentStage >= 2 ? (
                      <button
                        onClick={() => handleOpenChat(deal)}
                        className="btn-primary"
                        style={{
                          backgroundColor: isDealerPro ? "#2563eb" : "#6b7280",
                          borderColor: isDealerPro ? "#2563eb" : "#6b7280",
                          padding: "0.55rem 1.15rem",
                          fontSize: "0.85rem",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem"
                        }}
                      >
                        {isDealerPro ? <FaComments /> : <FaLock />} Live Chat with Buyer {!isDealerPro && "(Pro Only)"}
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        (Accept lead to start chat)
                      </span>
                    )}

                    {deal.userPhone && deal.userPhone !== "N/A" && (
                      <a
                        href={`tel:${deal.userPhone}`}
                        className="btn-outline"
                        style={{ padding: "0.55rem 0.85rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                      >
                        <FaPhoneAlt size={12} /> Call
                      </a>
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

      {/* Upgrade to Professional Modal */}
      {showProModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "var(--bg-card)",
            maxWidth: "500px",
            width: "100%",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            border: "1px solid var(--border-color)",
            textAlign: "center",
            position: "relative"
          }}>
            <button
              onClick={() => setShowProModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              <FaTimes />
            </button>

            <div style={{
              width: "65px",
              height: "65px",
              borderRadius: "50%",
              backgroundColor: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem auto"
            }}>
              <FaCrown size={32} />
            </div>

            <h2 style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "0.5rem" }}>
              Dealer Professional Subscription Required
            </h2>

            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: "1.55", marginBottom: "1.5rem" }}>
              {proModalMsg || "Chat dealer side se tabhi start hogi jab Professional subscription le rakhi hogi. Free/Basic plan par chat locked hai."}
            </p>

            <div style={{
              backgroundColor: "var(--bg-main)",
              borderRadius: "14px",
              padding: "1rem 1.25rem",
              textAlign: "left",
              marginBottom: "1.75rem",
              border: "1px solid var(--border-color)"
            }}>
              <strong style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Professional Plan Benefits (₹999/month):
              </strong>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.7" }}>
                <li>💬 <strong>Unlimited 1-on-1 Live Chat</strong> with interested buyers</li>
                <li>🤝 <strong>Instant Lead Acceptance</strong> & pipeline status tracking</li>
                <li>📞 <strong>Full Buyer Contact Access</strong> (Phone & Email)</li>
                <li>⭐ <strong>Verified Dealer Badge</strong> & priority placement</li>
              </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={() => {
                  setShowProModal(false);
                  navigate("/pricing?type=dealer");
                }}
                className="btn-primary"
                style={{
                  backgroundColor: "#d97706",
                  borderColor: "#d97706",
                  width: "100%",
                  justifyContent: "center",
                  padding: "0.85rem",
                  fontSize: "1rem",
                  fontWeight: "800",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)"
                }}
              >
                <FaCrown /> Upgrade to Professional (₹999)
              </button>

              <button
                onClick={() => setShowProModal(false)}
                className="btn-outline"
                style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.9rem" }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDeals;
