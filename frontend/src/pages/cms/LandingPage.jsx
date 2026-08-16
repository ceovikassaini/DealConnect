import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import apiInstance from "../../utils/apiInstance";
import { TableCard } from "../../components/common/PageTable";

const LandingPage = () => {
  const [formData, setFormData] = useState({
    main_titile: "",
    main_subtitile: "",
    appstore_link: "",
    playstore_link: "",
    app_screen: "",
    offer_title_1: "",
    offer_subtitle_1: "",
    offer_title_2: "",
    offer_subtitle_2: "",
    offer_title_3: "",
    offer_subtitle_3: "",
    contact_no: "",
    contact_email: "",
    contact_location: "",
    work_title_1: "",
    work_subtitle_1: "",
    work_title_2: "",
    work_subtitle_2: "",
    work_title_3: "",
    work_subtitle_3: ""
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch the current landing page settings
  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        setFetching(true);
        const res = await apiInstance.get("/landingpage");
        if (res.data && res.data.body) {
          setFormData({
            main_titile: res.data.body.main_titile || "",
            main_subtitile: res.data.body.main_subtitile || "",
            appstore_link: res.data.body.appstore_link || "",
            playstore_link: res.data.body.playstore_link || "",
            app_screen: res.data.body.app_screen || "",
            offer_title_1: res.data.body.offer_title_1 || "",
            offer_subtitle_1: res.data.body.offer_subtitle_1 || "",
            offer_title_2: res.data.body.offer_title_2 || "",
            offer_subtitle_2: res.data.body.offer_subtitle_2 || "",
            offer_title_3: res.data.body.offer_title_3 || "",
            offer_subtitle_3: res.data.body.offer_subtitle_3 || "",
            contact_no: res.data.body.contact_no || "",
            contact_email: res.data.body.contact_email || "",
            contact_location: res.data.body.contact_location || "",
            work_title_1: res.data.body.work_title_1 || "",
            work_subtitle_1: res.data.body.work_subtitle_1 || "",
            work_title_2: res.data.body.work_title_2 || "",
            work_subtitle_2: res.data.body.work_subtitle_2 || "",
            work_title_3: res.data.body.work_title_3 || "",
            work_subtitle_3: res.data.body.work_subtitle_3 || ""
          });
        }
      } catch (err) {
        console.error("Error fetching landing page data:", err);
        toast.error("Failed to load landing page data.");
      } finally {
        setFetching(false);
      }
    };
    fetchLandingPage();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiInstance.put("/landingpage", formData);
      toast.success("Landing page settings updated successfully!");
    } catch (err) {
      console.error("Error updating landing page data:", err);
      toast.error("Failed to update landing page settings.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border" style={{ width: "3rem", height: "3rem", color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <div style={{ marginBottom: "20px" }}>
        <h5 style={{ margin: 0, fontWeight: "700", color: "#111827" }}>Landing Page Settings</h5>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
          Edit the text fields displayed on your public landing page.
        </p>
      </div>

      <TableCard>
        <form onSubmit={handleSubmit} style={{ padding: "28px", position: "relative" }}>
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100
              }}
            >
              <div
                className="spinner-border"
                role="status"
                style={{ width: "50px", height: "50px", color: "var(--primary)" }}
              />
            </div>
          )}

          {/* SECTION 1: HERO / BANNER DETAILS */}
          <div style={{ marginBottom: "32px" }}>
            <h6 style={{ fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
              Hero / Main Banner Section
            </h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Hero Title</label>
                <input
                  type="text"
                  name="main_titile"
                  value={formData.main_titile}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Hero Subtitle</label>
                <input
                  type="text"
                  name="main_subtitile"
                  value={formData.main_subtitile}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>App Store Link</label>
                <input
                  type="text"
                  name="appstore_link"
                  value={formData.appstore_link}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Play Store Link</label>
                <input
                  type="text"
                  name="playstore_link"
                  value={formData.playstore_link}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>App Screen Image (URL or Name)</label>
                <input
                  type="text"
                  name="app_screen"
                  value={formData.app_screen}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: OFFERS / KEY HIGHLIGHTS */}
          <div style={{ marginBottom: "32px" }}>
            <h6 style={{ fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
              Key Offers / Highlights (What We Offer)
            </h6>
            <div className="row">
              {/* Offer 1 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Offer 1</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="offer_title_1"
                      value={formData.offer_title_1}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Subtitle / Desc</label>
                    <textarea
                      name="offer_subtitle_1"
                      value={formData.offer_subtitle_1}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Offer 2 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Offer 2</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="offer_title_2"
                      value={formData.offer_title_2}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Subtitle / Desc</label>
                    <textarea
                      name="offer_subtitle_2"
                      value={formData.offer_subtitle_2}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Offer 3 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Offer 3</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="offer_title_3"
                      value={formData.offer_title_3}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Subtitle / Desc</label>
                    <textarea
                      name="offer_subtitle_3"
                      value={formData.offer_subtitle_3}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: HOW IT WORKS */}
          <div style={{ marginBottom: "32px" }}>
            <h6 style={{ fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
              How It Works Steps
            </h6>
            <div className="row">
              {/* Step 1 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Step 1</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="work_title_1"
                      value={formData.work_title_1}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Subtitle / Desc</label>
                    <textarea
                      name="work_subtitle_1"
                      value={formData.work_subtitle_1}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Step 2</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="work_title_2"
                      value={formData.work_title_2}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Subtitle / Desc</label>
                    <textarea
                      name="work_subtitle_2"
                      value={formData.work_subtitle_2}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="col-md-4 mb-4">
                <div style={{ border: "1px solid #f3f4f6", padding: "14px", borderRadius: "8px", background: "#f9fafb" }}>
                  <label className="form-label" style={{ fontWeight: "700", fontSize: "12px", textTransform: "uppercase", color: "#4b5563" }}>Step 3</label>
                  <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Title</label>
                    <input
                      type="text"
                      name="work_title_3"
                      value={formData.work_title_3}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: "600", fontSize: "12px" }}>Subtitle / Desc</label>
                    <textarea
                      name="work_subtitle_3"
                      value={formData.work_subtitle_3}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: CONTACT INFORMATION */}
          <div style={{ marginBottom: "36px" }}>
            <h6 style={{ fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
              Contact Information
            </h6>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Contact No</label>
                <input
                  type="text"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px" }}>Contact Location / Address</label>
                <input
                  type="text"
                  name="contact_location"
                  value={formData.contact_location}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn bg-info" style={{ color: "white", padding: "10px 24px", fontWeight: "600" }}>
              Update Settings
            </button>
          </div>
        </form>
      </TableCard>
    </>
  );
};

export default LandingPage;
