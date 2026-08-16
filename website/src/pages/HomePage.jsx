import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaCheckCircle, FaSearch, FaArrowRight, FaChartLine, 
  FaUserTie, FaBuilding, FaHandshake, FaStar, FaQuoteLeft,
  FaMapMarkerAlt, FaRegCompass, FaShieldAlt, FaCrown, FaLock
} from "react-icons/fa";

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [searchTab, setSearchTab] = useState("properties"); // properties or requirements
  const [locationInput, setLocationInput] = useState("");
  const [typeInput, setTypeInput] = useState("All Types");
  const [stats, setStats] = useState({
    activeDealers: "2,450+",
    propertiesListed: "12,850+",
    dealsClosed: "3,240+",
    requirementsPosted: "5,630+",
    todayNewRequirements: 128,
    todayPropertiesAdded: 243,
    todayDealsClosed: 67
  });

  const [featuredProperties, setFeaturedProperties] = useState([]);

  // Animated Hero Image Slider
  const heroImages = [
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", title: "Modern Luxury Villa with Pool" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", title: "Contemporary Architectural Design" },
    { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", title: "Luxury Waterfront Estate" },
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", title: "High-End Residential Penthouse" }
  ];

  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Animated Hero Title Typewriter Effect
  const line1Full = "Connect. Match. Close.";
  const line2Full = "Grow Your Property Business";

  const [textLine1, setTextLine1] = useState("");
  const [textLine2, setTextLine2] = useState("");

  useEffect(() => {
    let index1 = 0;
    let index2 = 0;

    const timer1 = setInterval(() => {
      if (index1 < line1Full.length) {
        setTextLine1(line1Full.slice(0, index1 + 1));
        index1++;
      } else {
        clearInterval(timer1);
        const timer2 = setInterval(() => {
          if (index2 < line2Full.length) {
            setTextLine2(line2Full.slice(0, index2 + 1));
            index2++;
          } else {
            clearInterval(timer2);
          }
        }, 45);
      }
    }, 55);

    return () => {
      clearInterval(timer1);
    };
  }, []);

  const renderLine2Animated = () => {
    if (!textLine2) return null;
    if (textLine2.length <= 10) {
      return <span>{textLine2}</span>;
    } else if (textLine2.length <= 18) {
      return (
        <>
          Grow Your{" "}
          <span style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            {textLine2.slice(10)}
          </span>
        </>
      );
    } else {
      return (
        <>
          Grow Your{" "}
          <span style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Property
          </span>
          {textLine2.slice(18)}
        </>
      );
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/properties")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.properties) {
          setFeaturedProperties(data.properties);
        } else {
          setFeaturedProperties([]);
        }
      })
      .catch(() => {
        setFeaturedProperties([]);
      });
  }, []);

  const handlePostRequirementClick = () => {
    if (!user) {
      navigate("/login?msg=login_required");
    } else if (user.role === "user") {
      navigate("/user/post-requirement");
    } else {
      navigate("/dealer/add-requirement");
    }
  };

  const handleJoinClick = () => {
    if (!user) {
      navigate("/signup");
    } else if (user.role === "dealer") {
      navigate("/dealer/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTab === "properties") {
      navigate(`/properties?location=${encodeURIComponent(locationInput)}&type=${encodeURIComponent(typeInput)}`);
    } else {
      navigate(`/requirements?location=${encodeURIComponent(locationInput)}&type=${encodeURIComponent(typeInput)}`);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--bg-main)" }}>
      {/* HERO SECTION */}
      <section style={{
        position: "relative",
        paddingTop: "3.5rem",
        paddingBottom: "4rem",
        overflow: "hidden"
      }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3rem",
            alignItems: "center"
          }}>
            {/* Left Content */}
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 1rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                fontWeight: "700",
                fontSize: "0.85rem",
                marginBottom: "1.5rem"
              }}>
                <span>☆ India's #1 Property Dealer Network</span>
              </div>

              <h1 style={{
                fontSize: "clamp(2.3rem, 4vw, 3.4rem)",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                lineHeight: "1.2",
                marginBottom: "1.25rem",
                color: "var(--text-main)",
                minHeight: "2.4em"
              }}>
                <span>{textLine1}</span>
                {textLine1.length < line1Full.length && (
                  <span style={{ color: "#4f46e5", marginLeft: "2px", opacity: 0.8 }} className="pulse-animated">|</span>
                )}
                <br />
                {renderLine2Animated()}
                {textLine1.length >= line1Full.length && textLine2.length < line2Full.length && (
                  <span style={{ color: "#4f46e5", marginLeft: "2px", opacity: 0.8 }} className="pulse-animated">|</span>
                )}
              </h1>

              <p style={{
                fontSize: "1.1rem",
                color: "var(--text-muted)",
                lineHeight: "1.6",
                marginBottom: "2rem",
                maxWidth: "540px"
              }}>
                DealConnect is a smart platform for property dealers and buyers to connect, share requirements, match properties and close more deals.
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
                <button onClick={() => navigate("/properties")} className="btn-primary" style={{ padding: "0.9rem 1.75rem", fontSize: "1rem" }}>
                  Explore Properties <FaArrowRight />
                </button>
                <button onClick={() => navigate("/pricing")} className="btn-outline" style={{ padding: "0.9rem 1.75rem", fontSize: "1rem", borderColor: "#d97706", color: "#d97706" }}>
                  <FaCrown /> Get Subscription Plan
                </button>
              </div>

              {/* Highlights Chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FaCheckCircle color="var(--primary)" /> Verified Dealers
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FaShieldAlt color="var(--primary)" /> Secure Platform
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FaRegCompass color="var(--primary)" /> Smart Matching
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FaHandshake color="var(--primary)" /> Deal Protection
                </span>
              </div>
            </div>

            {/* Right Hero Image with Animated Luxury Slider */}
            <div style={{ position: "relative" }}>
              <div style={{
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
                height: "440px",
                position: "relative",
                backgroundColor: "#0f172a"
              }}>
                {heroImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img.url} 
                    alt={img.title}
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      opacity: idx === heroSlideIndex ? 1 : 0,
                      transform: idx === heroSlideIndex ? "scale(1.06)" : "scale(1)",
                      transition: "opacity 1.2s ease-in-out, transform 4s ease-out"
                    }}
                  />
                ))}

                {/* Subtle Gradient Shadow Overlay */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "120px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                  pointerEvents: "none"
                }} />

                {/* Floating Live Badge */}
                <div style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(10px)",
                  color: "#111827",
                  padding: "0.45rem 0.9rem",
                  borderRadius: "30px",
                  fontSize: "0.78rem",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.15)"
                }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.3)"
                  }} />
                  Featured Showcase Properties
                </div>

                {/* Floating Dots Indicator */}
                <div style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "0.5rem",
                  zIndex: 2
                }}>
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroSlideIndex(idx)}
                      style={{
                        width: idx === heroSlideIndex ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "10px",
                        backgroundColor: idx === heroSlideIndex ? "#ffffff" : "rgba(255,255,255,0.5)",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING SEARCH FILTER BAR */}
          <div style={{
            marginTop: "3rem",
            backgroundColor: "var(--bg-card)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-color)"
          }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
              <button
                onClick={() => setSearchTab("properties")}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: searchTab === "properties" ? "var(--primary-light)" : "transparent",
                  color: searchTab === "properties" ? "var(--primary)" : "var(--text-muted)"
                }}
              >
                Find Properties
              </button>
              <button
                onClick={() => setSearchTab("requirements")}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: searchTab === "requirements" ? "var(--primary-light)" : "transparent",
                  color: searchTab === "requirements" ? "var(--primary)" : "var(--text-muted)"
                }}
              >
                Find Requirements
              </button>
            </div>

            {/* Filter Form */}
            <form onSubmit={handleSearch} style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr)) 120px",
              gap: "1rem",
              alignItems: "end"
            }}>
              <div>
                <label style={labelStyle}>Location</label>
                <input 
                  type="text" 
                  placeholder="Enter Location" 
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Property Type</label>
                <select 
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  style={inputStyle}
                >
                  <option value="All Types">All Types</option>
                  <option value="Plot">Plot / Land</option>
                  <option value="Flat">Flat / Apartment</option>
                  <option value="Commercial">Commercial Shop</option>
                  <option value="Kothi">Kothi / Villa</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Budget</label>
                <select style={inputStyle}>
                  <option>Min - Max</option>
                  <option>₹20 Lakh - ₹50 Lakh</option>
                  <option>₹50 Lakh - ₹1 Cr</option>
                  <option>₹1 Cr - ₹3 Cr</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Area</label>
                <input type="text" placeholder="Min - Max (Sq.ft)" style={inputStyle} />
              </div>

              <button type="submit" className="btn-primary" style={{ height: "46px", justifyContent: "center" }}>
                <FaSearch /> Search
              </button>
            </form>
          </div>

          {/* KEY STATS COUNTER BAR */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginTop: "3rem"
          }}>
            <StatCard icon={<FaUserTie size={24} color="#4f46e5" />} count={stats.activeDealers} label="Active Dealers" change="+12% this month" bg="#eef2ff" />
            <StatCard icon={<FaBuilding size={24} color="#10b981" />} count={stats.propertiesListed} label="Properties Listed" change="+18% this month" bg="#ecfdf5" />
            <StatCard icon={<FaHandshake size={24} color="#f59e0b" />} count={stats.dealsClosed} label="Deals Closed" change="+25% this month" bg="#fef3c7" />
            <StatCard icon={<FaChartLine size={24} color="#3b82f6" />} count={stats.requirementsPosted} label="Requirements Posted" change="+15% this month" bg="#eff6ff" />
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION */}
      <section style={{ padding: "4rem 0", backgroundColor: "var(--bg-card)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-main)" }}>Featured Properties</h2>
            </div>
            <Link to="/properties" style={{ color: "var(--primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              View All Properties <FaArrowRight />
            </Link>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: featuredProperties.length > 0 ? "repeat(auto-fill, 310px)" : "1fr",
            gap: "1.5rem",
            justifyContent: "flex-start"
          }}>
            {featuredProperties.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", backgroundColor: "var(--bg-main)", borderRadius: "16px", border: "1px dashed var(--border-color)", gridColumn: "1 / -1" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem" }}>No Properties Found in Database</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>Browse all verified real estate properties listed on DealConnect.</p>
                <Link to="/properties" className="btn-primary" style={{ display: "inline-flex", padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
                  Browse Properties
                </Link>
              </div>
            ) : (
              featuredProperties.map((prop) => {
                const imgSrc = Array.isArray(prop.images) && prop.images.length > 0 
                  ? prop.images[0] 
                  : (typeof prop.images === "string" && prop.images.startsWith("http") ? prop.images : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80");

                const cleanFacing = (prop.facing || "Road Facing").replace(/ Facing/i, "").trim();

                return (
                  <Link 
                    key={prop.id} 
                    to={`/properties/${prop.id}`} 
                    className="card"
                    style={{ 
                      textDecoration: "none", 
                      color: "inherit", 
                      display: "flex", 
                      flexDirection: "column",
                      width: "310px",
                      padding: "0",
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: "1px solid var(--border-color)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    }}
                  >
                    {/* Property Image & Badges */}
                    <div style={{ position: "relative", height: "175px", overflow: "hidden", backgroundColor: "#f3f4f6" }}>
                      <img src={imgSrc} alt={prop.title || prop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      
                      {/* Floating Badges */}
                      <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                        <span style={{ 
                          backgroundColor: "rgba(254, 243, 199, 0.95)", 
                          color: "#d97706", 
                          fontSize: "0.72rem", 
                          fontWeight: "800", 
                          padding: "0.3rem 0.65rem", 
                          borderRadius: "8px", 
                          border: "1px solid #fde68a" 
                        }}>
                          Premium
                        </span>
                      </div>

                      <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                        <span style={{ 
                          backgroundColor: "rgba(99, 102, 241, 0.95)", 
                          color: "#ffffff", 
                          fontSize: "0.72rem", 
                          fontWeight: "800", 
                          padding: "0.3rem 0.65rem", 
                          borderRadius: "8px" 
                        }}>
                          Featured
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "800", marginBottom: "0.4rem", color: "var(--text-main)", lineHeight: "1.3", height: "2.6em", overflow: "hidden" }}>
                        {prop.title || prop.name}
                      </h3>
                      
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <FaMapMarkerAlt color="var(--primary)" size={13} flexShrink={0} /> {prop.location || "Sonipat, Haryana"}
                      </p>

                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "1rem" }}>
                        <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#6366f1" }}>
                          ₹ {typeof prop.price === "number" ? prop.price.toLocaleString("en-IN") : prop.price}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                          Negotiable
                        </span>
                      </div>

                      {/* 3-Column Metadata Grid */}
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr 1.2fr", 
                        gap: "0.4rem", 
                        backgroundColor: "var(--bg-main)", 
                        padding: "0.65rem 0.75rem", 
                        borderRadius: "12px", 
                        border: "1px solid var(--border-color)",
                        marginTop: "auto"
                      }}>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {prop.area || "100 Sq. Yd."}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Area</div>
                        </div>

                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {cleanFacing}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Facing</div>
                        </div>

                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: "90px" }}>
                              {prop.dealerName || "Sharma Associates"}
                            </span>
                            <FaCheckCircle color="#3b82f6" size={11} style={{ flexShrink: 0 }} />
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "2px" }}>Dealer</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* HOW DEALCONNECT WORKS */}
      <section id="how-it-works" style={{ padding: "4.5rem 0", backgroundColor: "var(--bg-main)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>How DealConnect Works?</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "3rem" }}>A simple 4-step process to explore properties and connect</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem"
          }}>
            <StepItem num="01" title="Join as Dealer / User" desc="Create your profile and verify your details" icon={<FaUserTie size={24} color="#4f46e5" />} />
            <StepItem num="02" title="Browse Properties" desc="Search verified property listings across top cities" icon={<FaBuilding size={24} color="#10b981" />} />
            <StepItem num="03" title="Get Subscription" desc="Unlock full dealer phone numbers and email contacts" icon={<FaRegCompass size={24} color="#f59e0b" />} />
            <StepItem num="04" title="Connect & Close" desc="Contact dealers directly and close deals easily." icon={<FaHandshake size={24} color="#3b82f6" />} />
          </div>
        </div>
      </section>

      {/* WHAT DEALERS SAY (TESTIMONIALS) */}
      <section id="testimonials" style={{ padding: "4.5rem 0", backgroundColor: "var(--bg-card)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: "800" }}>What Dealers Say</h2>
            </div>
            <Link to="/testimonials" style={{ color: "var(--primary)", fontWeight: "700" }}>View All Testimonials</Link>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.75rem"
          }}>
            <TestimonialCard 
              comment="DealConnect has completely changed the way we do business. Got quality leads and closed deals faster than ever."
              name="Amit Sharma"
              company="Sharma Associates"
              avatar="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
            />
            <TestimonialCard 
              comment="The requirement matching feature is amazing. Now we get notified instantly when a matching property is available."
              name="Rohit Bansal"
              company="Realty Connect"
              avatar="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"
            />
            <TestimonialCard 
              comment="Best platform for property dealers. Highly recommended for serious real estate professionals."
              name="Vikram Singh"
              company="Property Hub"
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
            />
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{
        padding: "4rem 0",
        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
        color: "#ffffff"
      }}>
        <div className="container" style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2rem"
        }}>
          <div>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Ready to Explore Premium Properties?</h2>
            <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>Browse verified property listings and connect with top dealers on DealConnect.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => navigate("/properties")} style={{
              backgroundColor: "#ffffff",
              color: "#4f46e5",
              padding: "0.9rem 1.75rem",
              borderRadius: "var(--radius-md)",
              fontWeight: "700",
              border: "none",
              cursor: "pointer"
            }}>
              Browse Properties →
            </button>
            <button onClick={() => navigate("/pricing")} style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "#ffffff",
              padding: "0.9rem 1.75rem",
              borderRadius: "var(--radius-md)",
              fontWeight: "700",
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.3)"
            }}>
              Get Subscription →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, count, label, change, bg }) => (
  <div style={{
    backgroundColor: "var(--bg-card)",
    borderRadius: "16px",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--border-color)"
  }}>
    <div style={{
      width: "50px",
      height: "50px",
      borderRadius: "12px",
      backgroundColor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "1.4rem", fontWeight: "800" }}>{count}</div>
      <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>{label}</div>
      <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600" }}>{change}</div>
    </div>
  </div>
);

const StepItem = ({ num, title, desc, icon }) => (
  <div style={{
    backgroundColor: "var(--bg-card)",
    padding: "2rem 1.5rem",
    borderRadius: "16px",
    border: "1px solid var(--border-color)",
    textAlign: "center"
  }}>
    <div style={{
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      backgroundColor: "var(--primary-light)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1.25rem auto"
    }}>
      {icon}
    </div>
    <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--primary)" }}>{num}</span>
    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0.5rem 0" }}>{title}</h3>
    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{desc}</p>
  </div>
);

const TestimonialCard = ({ comment, name, company, avatar }) => (
  <div style={{
    backgroundColor: "var(--bg-main)",
    padding: "1.75rem",
    borderRadius: "16px",
    border: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  }}>
    <div>
      <div style={{ color: "#f59e0b", display: "flex", gap: "0.2rem", marginBottom: "1rem" }}>
        <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
      </div>
      <p style={{ fontSize: "0.95rem", color: "var(--text-main)", fontStyle: "italic", marginBottom: "1.5rem" }}>
        "{comment}"
      </p>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <img src={avatar} alt={name} style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} />
      <div>
        <strong style={{ fontSize: "0.95rem", display: "block", color: "var(--text-main)" }}>{name}</strong>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{company}</span>
      </div>
    </div>
  </div>
);

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: "700",
  marginBottom: "0.4rem",
  color: "var(--text-muted)"
};

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-main)",
  color: "var(--text-main)",
  fontSize: "0.9rem",
  outline: "none"
};

export default HomePage;
