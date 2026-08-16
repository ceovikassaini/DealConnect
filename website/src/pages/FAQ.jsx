import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "What is DealConnect and how does it work?",
      a: "DealConnect is a dedicated property dealer network platform where brokers can list properties, post buyer requirements, and instantly get matched with other verified dealers."
    },
    {
      q: "How are dealers verified on the platform?",
      a: "Dealers must submit business proof (RERA registration, GST, or shop establishment certificate) which is manually verified by our team within 24 hours."
    },
    {
      q: "Is there any commission taken by DealConnect?",
      a: "No, DealConnect charges zero commission on deal closures. We operate on a transparent subscription model."
    },
    {
      q: "Can I post requirements for clients directly?",
      a: "Yes! You can post detailed buyer/tenant requirements with budget and location constraints to receive matching property suggestions from fellow network dealers."
    }
  ];

  return (
    <div style={{ backgroundColor: "var(--bg-main)", minHeight: "80vh", padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem", textAlign: "center" }}>Frequently Asked Questions</h1>
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "3rem" }}>Everything you need to know about DealConnect</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {faqs.map((faq, i) => (
            <div key={i} className="card" style={{ padding: "1.25rem 1.5rem" }}>
              <div 
                onClick={() => setOpenIdx(openIdx === i ? null : i)} 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "700", fontSize: "1.05rem" }}
              >
                <span>{faq.q}</span>
                {openIdx === i ? <FaChevronUp color="var(--primary)" /> : <FaChevronDown color="var(--text-muted)" />}
              </div>
              {openIdx === i && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", color: "var(--text-muted)", lineHeight: "1.7" }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
