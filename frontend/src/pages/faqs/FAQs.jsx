import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import apiInstance from "../../utils/apiInstance";
import { PageHeader, TableCard, Modal, PrimaryBtn } from "../../components/common/PageTable";

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [currentFaq, setCurrentFaq] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  
  // Dual-mode state
  const [isManageMode, setIsManageMode] = useState(false);
  
  // Accordion active state (index of expanded item)
  const [expandedId, setExpandedId] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get("/faqs");
      if (res.data.status) {
        setFaqs(res.data.data);
      }
    } catch (err) {
      toast.error("Error fetching FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentFaq(null);
    setQuestion("");
    setAnswer("");
    setShowModal(true);
  };

  const handleEditClick = (faq) => {
    setCurrentFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || !answer) {
      toast.error("Question and answer are required");
      return;
    }
    
    try {
      setLoading(true);
      if (currentFaq) {
        await apiInstance.put(`/faqs/${currentFaq.id}`, { question, answer });
        toast.success("FAQ updated successfully");
      } else {
        await apiInstance.post("/faqs", { question, answer });
        toast.success("FAQ added successfully");
      }
      setShowModal(false);
      fetchFaqs();
    } catch (err) {
      toast.error("Error saving FAQ");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await apiInstance.put(`/faqs/status/${id}`);
      toast.success("FAQ status updated");
      fetchFaqs();
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await apiInstance.delete(`/faqs/${id}`);
      toast.success("FAQ deleted successfully");
      fetchFaqs();
    } catch (err) {
      toast.error("Error deleting FAQ");
    }
  };

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter FAQs based on active status & search query (Preview Mode)
  const activeFaqs = faqs.filter(faq => 
    faq.status === 'active' && 
    (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      
      <PageHeader 
        title="FAQs" 
        subtitle={isManageMode ? "Manage frequently asked questions" : "Browse help articles and questions"} 
        action={
          <div className="d-flex gap-2">
            <button 
              className={`btn ${isManageMode ? 'btn-outline-primary' : 'btn-primary'}`} 
              onClick={() => setIsManageMode(!isManageMode)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "10px",
                padding: "8px 16px",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s ease"
              }}
            >
              <i className="material-icons" style={{ fontSize: "20px" }}>
                {isManageMode ? "visibility" : "settings"}
              </i>
              {isManageMode ? "Preview FAQs" : "Manage FAQs"}
            </button>
            {isManageMode && (
              <PrimaryBtn icon="add" label="Add FAQ" onClick={handleAddClick} />
            )}
          </div>
        }
      />

      {isManageMode ? (
        // Admin CRUD Management view
        <TableCard>
          {loading && faqs.length === 0 ? (
            <div className="p-4 text-center">Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 border-0">Question</th>
                    <th className="px-4 py-3 border-0">Answer</th>
                    <th className="px-4 py-3 border-0">Status</th>
                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map(faq => (
                    <tr key={faq.id}>
                      <td className="px-4 py-3"><strong>{faq.question}</strong></td>
                      <td className="px-4 py-3 text-muted">
                        {faq.answer.length > 80 ? faq.answer.substring(0, 80) + "..." : faq.answer}
                      </td>
                      <td className="px-4 py-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={faq.status === 'active'}
                            onChange={() => handleToggleStatus(faq.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-sm btn-light me-2" onClick={() => handleEditClick(faq)}>
                          <i className="material-icons" style={{ fontSize: "16px", color: "var(--p-pink)" }}>edit</i>
                        </button>
                        <button className="btn btn-sm btn-light" onClick={() => handleDelete(faq.id)}>
                          <i className="material-icons" style={{ fontSize: "16px", color: "#ef4444" }}>delete</i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {faqs.length === 0 && !loading && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">No FAQs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TableCard>
      ) : (
        // Premium Frontend Accordion view
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Search bar */}
          <div style={{
            position: "relative",
            marginBottom: "24px"
          }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search frequently asked questions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "14px 16px 14px 46px",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                fontSize: "15px",
                background: "#ffffff"
              }}
            />
            <i className="material-icons" style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              fontSize: "20px"
            }}>search</i>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af"
                }}
              >
                <i className="material-icons" style={{ fontSize: "18px" }}>clear</i>
              </button>
            )}
          </div>

          {loading && faqs.length === 0 ? (
            <div className="text-center py-5 text-muted">Loading help topics...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {activeFaqs.map(faq => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      boxShadow: isExpanded ? "0 8px 24px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)",
                      border: isExpanded ? "1px solid rgba(249,115,22,0.15)" : "1px solid #f3f4f6",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    {/* Header/Question */}
                    <div 
                      onClick={() => toggleAccordion(faq.id)}
                      style={{
                        padding: "20px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none"
                      }}
                    >
                      <h5 style={{ 
                        margin: 0, 
                        fontSize: "16px", 
                        fontWeight: "600",
                        color: isExpanded ? "#f97316" : "#1f2937",
                        transition: "color 0.2s ease",
                        paddingRight: "16px",
                        lineHeight: "1.4"
                      }}>
                        {faq.question}
                      </h5>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: isExpanded ? "rgba(249,115,22,0.08)" : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isExpanded ? "#f97316" : "#4b5563",
                        transition: "all 0.3s ease"
                      }}>
                        <i className="material-icons" style={{ 
                          fontSize: "20px",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s ease"
                        }}>
                          expand_more
                        </i>
                      </div>
                    </div>

                    {/* Collapse Content/Answer */}
                    <div style={{
                      maxHeight: isExpanded ? "500px" : "0px",
                      opacity: isExpanded ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
                      borderTop: isExpanded ? "1px solid #f3f4f6" : "1px solid transparent"
                    }}>
                      <div style={{ 
                        padding: "20px 24px",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "#4b5563",
                        background: "#fafafa"
                      }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeFaqs.length === 0 && (
                <div style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px dashed #e5e7eb",
                  color: "#9ca3af"
                }}>
                  <i className="material-icons" style={{ fontSize: "40px", marginBottom: "8px" }}>help_outline</i>
                  <p style={{ margin: 0 }}>No matching FAQs found. Try searching for different keywords.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={currentFaq ? "Edit FAQ" : "Add FAQ"}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Question</label>
            <input 
              type="text" 
              className="form-control" 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Answer</label>
            <textarea 
              className="form-control" 
              rows="4" 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              required
            ></textarea>
          </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-light me-2" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default FAQs;
