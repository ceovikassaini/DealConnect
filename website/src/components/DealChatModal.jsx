import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaPaperPlane, FaUser, FaBuilding, FaCheckCircle, FaClock, FaCalendarAlt, FaCheckDouble, FaPhoneAlt, FaCrown, FaLock } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const STATUS_CONFIG = {
  1: { label: "User showed interest", color: "#f59e0b", bg: "#fef3c7" },
  2: { label: "Dealer accepted lead", color: "#3b82f6", bg: "#dbeafe" },
  3: { label: "Dealer contacted user", color: "#6366f1", bg: "#e0e7ff" },
  4: { label: "Site visit scheduled", color: "#8b5cf6", bg: "#ede9fe" },
  5: { label: "Site visit completed", color: "#10b981", bg: "#d1fae5" }
};

const DealChatModal = ({ deal, currentUser, onClose, onDealUpdated }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dealerHasPro, setDealerHasPro] = useState(deal?.dealerHasPro ?? false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef(null);

  const isDealer = currentUser?.id === deal?.dealer_id || currentUser?.role === "dealer" || currentUser?.role === 2 || currentUser?.role === "2";
  
  // Check if current user is dealer with active Professional plan
  const isCurrentUserDealerPro = isDealer ? Boolean(
    (currentUser?.isSubscribed === true || currentUser?.subscriptionStatus === "active") &&
    (
      Number(currentUser?.subscriptionId || currentUser?.subscription_id) === 2 ||
      (currentUser?.subscriptionPlan || "").toLowerCase().includes("professional") ||
      (currentUser?.subscriptionPlan || "").toLowerCase().includes("pro")
    ) && !(currentUser?.subscriptionPlan || "").toLowerCase().includes("basic")
  ) : false;

  const effectiveDealerHasPro = Boolean(dealerHasPro || isCurrentUserDealerPro);

  const otherPartyName = isDealer ? (deal?.userName || deal?.user?.name || "Buyer") : (deal?.dealerName || deal?.dealer?.name || "Dealer");
  const otherPartyRole = isDealer ? "Buyer / Lead" : "Verified Dealer";
  const otherPartyPhone = isDealer ? (deal?.userPhone || deal?.user?.mobile_no) : (deal?.dealerPhone || deal?.dealer?.mobile_no);

  const fetchMessages = () => {
    if (!deal?.id) return;
    fetch(`${API_BASE}/deals/${deal.id}/messages`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.dealerHasPro !== undefined) {
          setDealerHasPro(data.dealerHasPro);
        }
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      })
      .catch(err => {
        setLoading(false);
        console.error("Fetch deal chat error:", err);
      });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [deal?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    if (isDealer && !effectiveDealerHasPro) {
      setErrorMessage("Chat dealer side se tabhi start hogi jab Professional subscription le rakhi hogi.");
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);
    setErrorMessage("");

    // Optimistic message append
    const tempMsg = {
      id: "temp_" + Date.now(),
      sender_id: currentUser?.id,
      message: messageText,
      createdAt: new Date().toISOString(),
      sender: { id: currentUser?.id, name: currentUser?.name }
    };
    setMessages(prev => [...prev, tempMsg]);

    fetch(`${API_BASE}/deals/${deal.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deal_connect_id: deal.id,
        sender_id: currentUser?.id,
        message: messageText
      })
    })
      .then(res => res.json())
      .then(data => {
        setSending(false);
        if (data.success && data.chat) {
          setMessages(prev => prev.map(m => m.id === tempMsg.id ? data.chat : m));
        } else {
          setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
          setErrorMessage(data.message || "Failed to send message");
        }
      })
      .catch(err => {
        setSending(false);
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        setErrorMessage("Network error sending message");
        console.error("Send message error:", err);
      });
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === 2 && isDealer && !effectiveDealerHasPro) {
      setErrorMessage("Dealer side se lead accept karne aur chat start karne ke liye Professional subscription zaroori hai.");
      return;
    }

    fetch(`${API_BASE}/deals/${deal.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (onDealUpdated) onDealUpdated({ ...deal, status: newStatus });
          fetchMessages();
          setErrorMessage("");
        } else {
          setErrorMessage(data.message || "Could not update deal stage");
        }
      })
      .catch(err => console.error("Error updating status:", err));
  };

  const statusInfo = STATUS_CONFIG[deal?.status] || STATUS_CONFIG[1];

  return (
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
      padding: "clamp(0.4rem, 2vw, 1rem)"
    }}>
      <div 
        className="deal-chat-modal-content"
        style={{
          backgroundColor: "var(--bg-card)",
          width: "95vw",
          maxWidth: "960px",
          height: "90vh",
          maxHeight: "840px",
          borderRadius: "24px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid var(--border-color)"
        }}
      >
        {/* Header */}
        <div 
          className="deal-chat-header"
          style={{
            padding: "1.15rem 1.75rem",
            borderBottom: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-main)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "54px",
              height: "54px",
              borderRadius: "14px",
              overflow: "hidden",
              backgroundColor: "#ffffff",
              border: "1px solid var(--border-color)",
              flexShrink: 0
            }}>
              <img
                src={deal?.propertyImage || "/logo.png"}
                alt={deal?.propertyTitle || "Property"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.onerror = null; e.target.src = "/logo.png"; }}
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <strong style={{ fontSize: "1.15rem", color: "var(--text-main)" }}>
                  {otherPartyName}
                </strong>
                <span style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "12px",
                  fontWeight: "700",
                  backgroundColor: isDealer ? "#e0e7ff" : "#d1fae5",
                  color: isDealer ? "#4338ca" : "#065f46"
                }}>
                  {otherPartyRole}
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                Property: <strong>{deal?.propertyTitle || "Property Lead"}</strong> (Deal #{deal?.id})
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            {otherPartyPhone && otherPartyPhone !== "N/A" && (
              <a
                href={`tel:${otherPartyPhone}`}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                }}
                title={`Call ${otherPartyName}`}
              >
                <FaPhoneAlt size={16} />
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "none",
                border: "none",
                fontSize: "1.35rem",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div style={{
          backgroundColor: statusInfo.bg,
          padding: "0.75rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.65rem",
          borderBottom: "1px solid var(--border-color)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: "700", color: statusInfo.color }}>
              STAGE {deal?.status || 1}/5: {statusInfo.label}
            </span>
          </div>

          {/* If dealer, allow updating the status from inside chat */}
          {isDealer && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: "600" }}>Update Status:</span>
              <select
                value={deal?.status || 2}
                onChange={(e) => handleStatusChange(Number(e.target.value))}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.82rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.2)",
                  fontWeight: "700",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  cursor: "pointer"
                }}
              >
                <option value={1}>1. User showed interest</option>
                <option value={2}>2. Dealer accepted lead</option>
                <option value={3}>3. Dealer contacted user</option>
                <option value={4}>4. Site visit scheduled</option>
                <option value={5}>5. Site visit completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div 
          className="deal-chat-thread"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem 1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            backgroundColor: "var(--bg-main)"
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", margin: "auto", color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", margin: "auto", color: "var(--text-muted)", padding: "2.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.6rem" }}>💬</div>
              <p style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-main)" }}>Chat started between Dealer and Buyer!</p>
              <p style={{ fontSize: "0.88rem" }}>Say hello or discuss property details, pricing, and site visits below.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === currentUser?.id;
              const timeStr = m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";

              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMine ? "flex-end" : "flex-start",
                    maxWidth: "72%",
                    alignSelf: isMine ? "flex-end" : "flex-start"
                  }}
                >
                  <div style={{
                    padding: "0.85rem 1.25rem",
                    borderRadius: isMine ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    backgroundColor: isMine ? "var(--primary)" : "var(--bg-card)",
                    color: isMine ? "#ffffff" : "var(--text-main)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    border: isMine ? "none" : "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    wordBreak: "break-word"
                  }}>
                    {m.message}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", padding: "0 6px" }}>
                    {timeStr}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div style={{
            padding: "0.75rem 1.75rem",
            backgroundColor: "#fef2f2",
            borderTop: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "0.85rem",
            fontWeight: "700",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage("")}
              style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontWeight: "800" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* If Dealer does NOT have Professional Subscription: LOCK CHAT & Show Upgrade Paywall */}
        {isDealer && !effectiveDealerHasPro ? (
          <div style={{
            padding: "1.35rem 1.75rem",
            backgroundColor: "#fffbeb",
            borderTop: "2px solid #f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.25rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", maxWidth: "540px" }}>
              <div style={{
                width: "48px",
                height: "48px",
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
                <strong style={{ fontSize: "0.98rem", color: "#92400e", display: "block" }}>
                  Dealer Professional Subscription Required
                </strong>
                <p style={{ fontSize: "0.82rem", color: "#b45309", margin: "3px 0 0 0", lineHeight: "1.45" }}>
                  Chat dealer side se tabhi start hogi jab Professional subscription le rakhi hogi. Free/Basic plan par chat locked hai.
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
                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.28)"
              }}
            >
              <FaCrown /> Upgrade to Professional (₹999)
            </Link>
          </div>
        ) : (
          <>
            {/* Quick Suggestion Chips */}
            <div style={{
              padding: "0.6rem 1.75rem",
              display: "flex",
              gap: "0.6rem",
              overflowX: "auto",
              backgroundColor: "var(--bg-card)",
              borderTop: "1px solid var(--border-color)"
            }}>
              {(isDealer
                ? ["Hello! How can I help you?", "When are you available for a site visit?", "Price is negotiable. Let's discuss."]
                : ["Is this property still available?", "What is the final negotiable price?", "Can we schedule a site visit this week?"]
              ).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => setNewMessage(chip)}
                  style={{
                    padding: "0.4rem 0.85rem",
                    borderRadius: "18px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-main)",
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="deal-chat-footer"
              style={{
                padding: "1rem 1.75rem",
                backgroundColor: "var(--bg-card)",
                display: "flex",
                gap: "0.85rem",
                alignItems: "center"
              }}
            >
              <input
                type="text"
                placeholder={deal?.status >= 2 ? "Type your message..." : "Waiting for dealer to accept lead..."}
                disabled={deal?.status < 2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.85rem 1.35rem",
                  borderRadius: "28px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
              <button
                type="submit"
                disabled={deal?.status < 2 || !newMessage.trim() || sending}
                className="btn-primary"
                style={{
                  borderRadius: "50%",
                  width: "48px",
                  height: "48px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  opacity: (!newMessage.trim() || deal?.status < 2) ? 0.6 : 1,
                  cursor: (!newMessage.trim() || deal?.status < 2) ? "not-allowed" : "pointer"
                }}
              >
                <FaPaperPlane size={17} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DealChatModal;
