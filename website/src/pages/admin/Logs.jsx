import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiInstance from "../../utils/apiInstance";
import { TableCard, Modal } from "../../components/common/PageTable";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [clientFilter, setClientFilter] = useState("Sub Admin");
  const [searchQuery, setSearchQuery] = useState("");

  // Data detail modal
  const [dataModal, setDataModal] = useState({ isOpen: false, log: null });

  // Fetch logs from API
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get(
        `/logs?page=${page}&limit=10&client=${encodeURIComponent(clientFilter)}&search=${encodeURIComponent(searchQuery)}`
      );

      if (res.data?.success) {
        const body = res.data.body || {};
        setLogs(body.list || []);
        setTotal(body.total || 0);
        setTotalPages(body.totalPages || 1);
      }
    } catch (err) {
      toast.error("Failed to fetch activity logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, clientFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Format date helper: "01/10/25 5:50 PM"
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12

      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ padding: "8px 4px" }}>
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Top Header Controls (Matching Screenshot 2) */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h4 className="fw-bold text-dark mb-0">LOGS</h4>

        <div className="d-flex align-items-center gap-3">
          {/* Client Filter Dropdown */}
          <select
            className="form-select border-0 shadow-sm"
            style={{ width: "160px", padding: "8px 14px", borderRadius: "10px", fontWeight: "600", fontSize: "14px" }}
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="Sub Admin">Sub Admin</option>
            <option value="Admin">Admin</option>
            <option value="All">All Clients</option>
          </select>

          {/* Search Input */}
          <div className="input-group shadow-sm" style={{ width: "240px", borderRadius: "10px", overflow: "hidden" }}>
            <span className="input-group-text bg-white border-0">
              <i className="material-icons text-muted" style={{ fontSize: "18px" }}>search</i>
            </span>
            <input
              type="text"
              className="form-control border-0 ps-0"
              placeholder="Search by message"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>
      </div>

      {/* Logs Table (Matching Screenshot 2) */}
      <TableCard>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 border-0 fw-bold text-muted" style={{ fontSize: "12px" }}>ID</th>
                <th className="px-4 py-3 border-0 fw-bold text-muted" style={{ fontSize: "12px" }}>Client</th>
                <th className="px-4 py-3 border-0 fw-bold text-muted" style={{ fontSize: "12px" }}>Module</th>
                <th className="px-4 py-3 border-0 fw-bold text-muted" style={{ fontSize: "12px" }}>Message</th>
                <th className="px-4 py-3 border-0 fw-bold text-muted text-center" style={{ fontSize: "12px" }}>Data</th>
                <th className="px-4 py-3 border-0 fw-bold text-muted" style={{ fontSize: "12px" }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="material-icons d-block mb-2" style={{ fontSize: "36px" }}>history</i>
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 fw-bold text-muted" style={{ fontSize: "13px" }}>
                      #{log.id}
                    </td>
                    <td className="px-4 py-3 text-dark fw-semibold" style={{ fontSize: "14px" }}>
                      {log.client}
                    </td>
                    <td className="px-4 py-3 fw-semibold" style={{ color: "#3b82f6", fontSize: "13px" }}>
                      {log.module}
                    </td>
                    <td className="px-4 py-3 text-dark" style={{ fontSize: "14px" }}>
                      {log.message}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="btn btn-link p-1 text-primary"
                        style={{ borderRadius: "50%", background: "#eff6ff", width: "28px", height: "28px", display: "inline-flex", alignItems: "center", justifyCenter: "center" }}
                        onClick={() => setDataModal({ isOpen: true, log })}
                        title="View Detailed Payload"
                      >
                        <i className="material-icons" style={{ fontSize: "18px", color: "#3b82f6" }}>info</i>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted" style={{ fontSize: "13px" }}>
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top" style={{ fontSize: "13px" }}>
          <span className="text-muted">
            Showing {logs.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, total)} of {total} entries
          </span>
          <div className="d-flex gap-1 align-items-center">
            <button
              className="btn btn-sm btn-light p-1 px-2"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              &laquo;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                className={`btn btn-sm ${page === pNum ? "btn-primary" : "btn-light"}`}
                style={{
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  padding: 0,
                  fontWeight: "600",
                  background: page === pNum ? "#3b82f6" : "#f1f5f9",
                  border: "none",
                  color: page === pNum ? "#fff" : "#475569"
                }}
                onClick={() => setPage(pNum)}
              >
                {pNum}
              </button>
            ))}
            <button
              className="btn btn-sm btn-light p-1 px-2"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              &raquo;
            </button>
          </div>
        </div>
      </TableCard>

      {/* Data Detail Modal */}
      <Modal
        isOpen={dataModal.isOpen}
        onClose={() => setDataModal({ isOpen: false, log: null })}
        title="Activity Log Payload"
      >
        <div>
          {dataModal.log && (
            <div>
              <div className="mb-3">
                <strong>Action Message:</strong>
                <p className="text-muted mb-0">{dataModal.log.message}</p>
              </div>
              <div className="mb-3">
                <strong>Data Payload:</strong>
                <pre
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "12px",
                    borderRadius: "10px",
                    maxHeight: "300px",
                    overflow: "auto",
                    fontSize: "13px"
                  }}
                >
                  {typeof dataModal.log.data === "object"
                    ? JSON.stringify(dataModal.log.data, null, 2)
                    : dataModal.log.data || "No detailed payload recorded."}
                </pre>
              </div>
            </div>
          )}
          <div className="d-flex justify-content-end mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDataModal({ isOpen: false, log: null })}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Logs;
