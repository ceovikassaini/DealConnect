import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FaMapMarkerAlt, FaCheckCircle, FaPhoneAlt, FaEnvelope, 
  FaRulerCombined, FaChevronLeft, FaChevronRight, FaImages, 
  FaLock, FaCrown, FaTimes, FaHandshake, FaComments, FaClock 
} from "react-icons/fa";
import DealChatModal from "../components/DealChatModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const PropertyDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Deal Connect & Live Chat State
  const [deal, setDeal] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const isSubscribed = user?.isSubscribed === true || user?.subscriptionStatus === "active" || (user?.subscriptionPlan && user?.subscriptionPlan !== "Free" && user?.subscriptionPlan !== "None");

  const subId = Number(user?.subscriptionId || user?.subscription_id || 0);
  const planName = (user?.subscriptionPlan || "").toLowerCase();
  
  // Basic Plan check (subId 1 or name containing basic)
  const isBasicPlan = subId === 1 || planName.includes("basic");

  // Pro Plan is ONLY true if user is subscribed AND NOT on Basic Plan
  const isProPlan = isSubscribed && !isBasicPlan && (
    subId === 2 || 
    subId === 4 || 
    planName.includes("professional") || 
    planName.includes("enterprise")
  );

  useEffect(() => {
    if (!isSubscribed) {
      navigate("/pricing?msg=subscription_required");
    }
  }, [isSubscribed, navigate]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`${API_BASE}/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success && data.property) {
          setProperty(data.property);
        } else {
          setError(true);
        }
      })
      .catch(err => {
        setLoading(false);
        setError(true);
        console.error("Error fetching property details:", err);
      });
  }, [id]);

  // Automatically register deal interest when any user clicks or views a property
  useEffect(() => {
    if (property && user?.id) {
      const activeDealerId = property.dealerId || property.dealer_id || property.user_id;
      // If user is not the owner dealer of the property, register interest (Stage 1: User showed interest)
      if (Number(user.id) !== Number(activeDealerId)) {
        fetch(`${API_BASE}/deals/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            property_id: property.id,
            dealer_id: activeDealerId
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.deal) {
              setDeal(data.deal);
            }
          })
          .catch(err => console.error("Auto deal connect error:", err));
      } else {
        // Dealer viewing own property: check deal status
        fetch(`${API_BASE}/deals/check?user_id=${user.id}&property_id=${property.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.deal) setDeal(data.deal);
          })
          .catch(() => {});
      }
    }
  }, [property?.id, user?.id]);

  // Periodically check deal status updates (e.g. when dealer accepts lead or updates stage)
  useEffect(() => {
    if (property?.id && user?.id) {
      const timer = setInterval(() => {
        fetch(`${API_BASE}/deals/check?user_id=${user.id}&property_id=${property.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.deal) {
              setDeal(data.deal);
            }
          })
          .catch(() => {});
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [property?.id, user?.id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "5rem 0", textAlign: "center", color: "var(--text-muted)" }}>
        <h2>Loading property details from database...</h2>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container" style={{ padding: "5rem 0", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1rem" }}>Property Not Found</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>The property listing you are looking for does not exist in the database.</p>
        <Link to="/properties" className="btn-primary">Browse All Properties</Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"];

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleContactClick = (e) => {
    if (!isProPlan) {
      e.preventDefault();
      setShowSubscriptionModal(true);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--bg-main)", padding: "3rem 0" }}>
      <div className="container">
        {/* Back navigation link */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link to="/properties" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}>
            ← Back to All Properties
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
          {/* Main Info */}
          <div>
            {/* Multiple Images Carousel / Main Image View */}
            <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", height: "420px", marginBottom: "1rem", backgroundColor: "#000" }}>
              <img 
                src={images[activeImageIndex]} 
                alt={`${property.title} - Photo ${activeImageIndex + 1}`} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
              
              {/* Image Navigation Arrows if multiple images */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage} 
                    style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={handleNextImage} 
                    style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <FaChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              <div style={{ position: "absolute", bottom: "15px", right: "15px", backgroundColor: "rgba(0,0,0,0.75)", color: "#fff", padding: "0.35rem 0.75rem", borderRadius: "20px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaImages /> {activeImageIndex + 1} / {images.length} Photos
              </div>
            </div>

            {/* Multiple Thumbnails Bar */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
                {images.map((imgUrl, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIndex(idx)} 
                    style={{ 
                      width: "85px", 
                      height: "65px", 
                      borderRadius: "10px", 
                      overflow: "hidden", 
                      border: activeImageIndex === idx ? "3px solid var(--primary)" : "2px solid transparent", 
                      padding: 0, 
                      cursor: "pointer", 
                      flexShrink: 0,
                      opacity: activeImageIndex === idx ? 1 : 0.75
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Property Overview Card */}
            <div style={{ backgroundColor: "var(--bg-card)", padding: "1.75rem", borderRadius: "16px", border: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.4rem" }}>{property.title || property.name}</h1>
                  <p style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaMapMarkerAlt color="var(--primary)" /> {property.location}
                  </p>
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--primary)" }}>
                  ₹ {property.price}
                </div>
              </div>

              {/* Property Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", backgroundColor: "var(--bg-main)", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Property Type</span>
                  <strong style={{ fontSize: "0.95rem" }}>{property.propertyType || "Plot"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Area</span>
                  <strong style={{ fontSize: "0.95rem" }}>{property.area || "N/A"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Dimensions (H x W)</span>
                  <strong style={{ fontSize: "0.95rem" }}>{property.height || 0}ft × {property.width || 0}ft</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Facing</span>
                  <strong style={{ fontSize: "0.95rem" }}>{property.facing || "Road Facing"}</strong>
                </div>
                {property.society && (
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Society Name</span>
                    <strong style={{ fontSize: "0.95rem", color: isProPlan ? "inherit" : "#d97706" }}>
                      {isProPlan ? property.society : "🔒 Locked (User Professional Plan Required)"}
                    </strong>
                  </div>
                )}
                {property.flat_no && (
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Flat / House No.</span>
                    <strong style={{ fontSize: "0.95rem", color: isProPlan ? "inherit" : "#d97706" }}>
                      {isProPlan ? property.flat_no : "🔒 Locked (User Professional Plan Required)"}
                    </strong>
                  </div>
                )}
              </div>

              {property.other_details && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.75rem" }}>Other Details</h3>
                  {isProPlan ? (
                    <p style={{ color: "var(--text-muted)", lineHeight: "1.7", whiteSpace: "pre-line" }}>{property.other_details}</p>
                  ) : (
                    <div style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "1rem", borderRadius: "12px", border: "1px dashed #f59e0b", color: "#b45309", fontSize: "0.9rem", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaLock /> Other details locked. User Professional Plan required to view.
                      </div>
                      <button onClick={() => navigate("/pricing")} className="btn-primary" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
                        Upgrade Plan
                      </button>
                    </div>
                  )}
                </div>
              )}

              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.75rem" }}>Description</h3>
              {isProPlan ? (
                <p style={{ color: "var(--text-muted)", lineHeight: "1.7", whiteSpace: "pre-line" }}>{property.description || "No description available."}</p>
              ) : (
                <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", backgroundColor: "var(--bg-main)", padding: "1.25rem", border: "1px dashed var(--border-color)" }}>
                  <p style={{ color: "var(--text-muted)", lineHeight: "1.7", filter: "blur(4px)", select: "none" }}>
                    This premium property details section is reserved for User Professional Plan subscribers. Unlock complete dealer contacts, full address details, and documentation.
                  </p>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#ffffff", padding: "1rem" }}>
                    <FaLock size={22} style={{ color: "#f59e0b" }} />
                    <strong style={{ fontSize: "1rem" }}>Full Description Locked</strong>
                    <span style={{ fontSize: "0.8rem", color: "#fef3c7" }}>Upgrade to User Professional Plan (₹499) to view full property details.</span>
                    <button onClick={() => navigate("/pricing")} className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      <FaCrown /> Upgrade to Professional Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dealer Sidebar */}
          <div>
            <div style={{ backgroundColor: "var(--bg-card)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)", position: "sticky", top: "100px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}>Listed By Dealer</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: "800" }}>
                  {(property.dealerName || "D")[0]}
                </div>
                <div>
                  <strong style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {property.dealerName || "Sharma Associates"} <FaCheckCircle color="#10b981" />
                  </strong>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Verified Property Dealer</span>
                </div>
              </div>

              {isProPlan ? (
                <>
                  <a href={`tel:${property.dealerPhone || "+919812345678"}`} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "0.75rem" }}>
                    <FaPhoneAlt /> Call Dealer ({property.dealerPhone || "+91 98123 45678"})
                  </a>
                  <a href={`mailto:${property.dealerEmail || "dealer@dealconnect.com"}`} className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                    <FaEnvelope /> Send Inquiry ({property.dealerEmail || "dealer@dealconnect.com"})
                  </a>
                </>
              ) : (
                <>
                  <div style={{
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    padding: "0.85rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    marginBottom: "1rem",
                    textAlign: "center",
                    fontWeight: "600"
                  }}>
                    <FaLock style={{ marginRight: "4px" }} /> Dealer Phone & Email details locked for Basic Plan.
                  </div>
                  <button 
                    onClick={handleContactClick} 
                    className="btn-primary" 
                    style={{ width: "100%", justifyContent: "center", marginBottom: "0.75rem", backgroundColor: "#d97706" }}
                  >
                    <FaCrown /> Unlock Dealer Phone (+91 98******78)
                  </button>
                  <button 
                    onClick={handleContactClick} 
                    className="btn-outline" 
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <FaLock /> Unlock Email Info
                  </button>
                </>
              )}

              {/* Deal Status & Live Chat Section */}
              <div style={{
                marginTop: "1.25rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--border-color)"
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Deal Status & Chat
                </span>

                {user ? (
                  deal ? (
                    <div style={{ marginTop: "0.6rem" }}>
                      <div style={{
                        padding: "0.75rem",
                        borderRadius: "12px",
                        backgroundColor: deal.status >= 2 ? "#dbeafe" : "#fef3c7",
                        color: deal.status >= 2 ? "#1e40af" : "#92400e",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        marginBottom: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        {deal.status >= 2 ? <FaCheckCircle color="#2563eb" /> : <FaClock color="#d97706" />}
                        <span>
                          {deal.status === 1 && "Stage 1: User showed interest (Waiting for Dealer)"}
                          {deal.status === 2 && "Stage 2: Dealer accepted lead (Chat Active)"}
                          {deal.status === 3 && "Stage 3: Dealer contacted user"}
                          {deal.status === 4 && "Stage 4: Site visit scheduled"}
                          {deal.status === 5 && "Stage 5: Site visit completed"}
                        </span>
                      </div>

                      {deal.status >= 2 ? (
                        <button
                          onClick={() => setShowChatModal(true)}
                          className="btn-primary"
                          style={{
                            width: "100%",
                            justifyContent: "center",
                            backgroundColor: "#2563eb",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontWeight: "800",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                          }}
                        >
                          <FaComments /> Live Chat with Dealer
                        </button>
                      ) : (
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.45" }}>
                          🔔 Your interest has been received by <strong>{property.dealerName || "the dealer"}</strong>! As soon as the dealer accepts your lead, live chat will start here.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: "0.6rem" }}>
                      <button
                        onClick={() => {
                          const activeDealerId = property.dealerId || property.dealer_id || property.user_id;
                          fetch(`${API_BASE}/deals/connect`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              user_id: user.id,
                              property_id: property.id,
                              dealer_id: activeDealerId
                            })
                          })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success && data.deal) setDeal(data.deal);
                            })
                            .catch(err => console.error("Error connecting deal:", err));
                        }}
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                      >
                        <FaHandshake /> Express Interest & Connect
                      </button>
                    </div>
                  )
                ) : (
                  <div style={{ marginTop: "0.6rem" }}>
                    <Link to="/login" className="btn-outline" style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem" }}>
                      Log in to Connect with Dealer & Chat
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Paywall Modal */}
      {showSubscriptionModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "var(--bg-card)",
            maxWidth: "480px",
            width: "100%",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            position: "relative",
            textAlign: "center"
          }}>
            <button 
              onClick={() => setShowSubscriptionModal(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "var(--text-muted)"
              }}
            >
              <FaTimes />
            </button>

            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem auto"
            }}>
              <FaCrown size={28} />
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.75rem" }}>
              Upgrade to Professional Plan
            </h2>

            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
              User Basic Plan allows viewing property listings & posting requirements. To unlock Society Name, Flat No., Other Details, Description, and direct Dealer Phone & Email, please upgrade to <strong>User Professional Plan (₹499)</strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button 
                onClick={() => {
                  setShowSubscriptionModal(false);
                  navigate("/pricing");
                }}
                className="btn-primary" 
                style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "1rem" }}
              >
                <FaCrown /> Upgrade to User Professional Plan
              </button>
              <button 
                onClick={() => setShowSubscriptionModal(false)}
                className="btn-outline" 
                style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Modal with Dealer */}
      {showChatModal && deal && (
        <DealChatModal
          deal={{
            ...deal,
            propertyTitle: property?.name || property?.title || deal?.propertyTitle,
            propertyImage: property?.images?.[0] || deal?.propertyImage,
            propertyPrice: property?.price || deal?.propertyPrice,
            dealerName: property?.dealerName || deal?.dealerName,
            dealerPhone: property?.dealerPhone || deal?.dealerPhone,
            user_id: user?.id,
            dealer_id: property?.dealerId || property?.dealer_id || property?.user_id
          }}
          currentUser={user}
          onClose={() => setShowChatModal(false)}
          onDealUpdated={(updated) => setDeal(prev => ({ ...prev, ...updated }))}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
