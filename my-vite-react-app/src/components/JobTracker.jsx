import { useState, useEffect } from "react";
import "./JobTracker.css";
import logoImg from "../assets/logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log("API URL:", API);

const STATUSES = ["Saved", "Applied", "Interviewing", "Offer", "Rejected"];

const STATUS_META = {
  Saved: {
    color: "#64748b",
    bg: "rgba(100,116,139,0.12)",
    border: "rgba(100,116,139,0.3)",
  },
  Applied: {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.3)",
  },
  Interviewing: {
    color: "#2dd4bf",
    bg: "rgba(45,212,191,0.12)",
    border: "rgba(45,212,191,0.3)",
  },
  Offer: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.3)",
  },
  Rejected: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.3)",
  },
};

const EMPTY_FORM = {
  company: "",
  jobTitle: "",
  status: "Saved",
  dateApplied: "",
  jobUrl: "",
  notes: "",
  interviewDate: "",
};

function isGhosted(job) {
  if (job.status !== "Applied") return false;
  if (!job.dateApplied) return false;
  const diff = (Date.now() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24);
  return diff > 30;
}

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <span className="stat-value" style={{ color: accent }}>
        {value}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function StatusBadge({ status, ghosted }) {
  if (ghosted) {
    return <span className="badge badge-ghosted">Ghosted?</span>;
  }
  const m = STATUS_META[status] || STATUS_META.Saved;
  return (
    <span
      className="badge"
      style={{
        color: m.color,
        background: m.bg,
        border: `1px solid ${m.border}`,
      }}
    >
      {status}
    </span>
  );
}

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/submit`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFormErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.company.trim()) errs.company = "Company is required";
    if (!form.jobTitle.trim()) errs.jobTitle = "Job title is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAdd = () => {
    setEditJob(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (job) => {
    setEditJob(job);
    setForm({
      company: job.company,
      jobTitle: job.jobTitle,
      status: job.status,
      dateApplied: job.dateApplied ? job.dateApplied.slice(0, 10) : "",
      jobUrl: job.jobUrl || "",
      notes: job.notes || "",
      interviewDate: job.interviewDate ? job.interviewDate.slice(0, 10) : "",
    });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditJob(null);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        dateApplied: form.dateApplied || null,
        interviewDate: form.interviewDate || null,
      };
      const url = editJob ? `${API}/submit/${editJob._id}` : `${API}/submit`;
      const method = editJob ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchJobs();
      closeForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j._id === id ? { ...j, status: newStatus } : j)),
    );
    try {
      await fetch(`${API}/submit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchJobs();
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/submit/${id}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered =
    filter === "All" ? jobs : jobs.filter((j) => j.status === filter);

  const stats = {
    total: jobs.length,
    applied: jobs.filter((j) => j.status === "Applied").length,
    interviewing: jobs.filter((j) => j.status === "Interviewing").length,
    offers: jobs.filter((j) => j.status === "Offer").length,
    rejected: jobs.filter((j) => j.status === "Rejected").length,
  };

  return (
    <div className="jt-page">
      <div className="jt-bg-glow" />
      <div className="jt-dots" />

      {/* ── Header ── */}
      <header className="jt-header">
        <div className="jt-header-left">
          <div className="jt-logo-wrap">
            <img src={logoImg} className="jt-logo-icon" alt="DevDash" />
            <span className="jt-brand">DevDash</span>
          </div>
          <span className="jt-header-sep">·</span>
          <span className="jt-header-sub">Job Application Tracker</span>
        </div>
        <button className="jt-btn-add" onClick={openAdd}>
          <span>+</span> Add Application
        </button>
      </header>

      {/* ── Stats ── */}
      <section className="jt-stats">
        <StatCard label="Total" value={stats.total} accent="#fff" />
        <StatCard label="Applied" value={stats.applied} accent="#3b82f6" />
        <StatCard
          label="Interviewing"
          value={stats.interviewing}
          accent="#2dd4bf"
        />
        <StatCard label="Offers" value={stats.offers} accent="#22c55e" />
        <StatCard label="Rejected" value={stats.rejected} accent="#f87171" />
      </section>

      {/* ── Filter Bar ── */}
      <div className="jt-filters">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            className={`jt-filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
            style={
              filter === s && s !== "All"
                ? {
                    color: STATUS_META[s]?.color,
                    borderColor: STATUS_META[s]?.border,
                    background: STATUS_META[s]?.bg,
                  }
                : {}
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="jt-table-wrap">
        {loading ? (
          <div className="jt-empty">Loading applications…</div>
        ) : filtered.length === 0 ? (
          <div className="jt-empty">
            {filter === "All"
              ? "No applications yet. Add your first one!"
              : `No jobs with status "${filter}".`}
          </div>
        ) : (
          <table className="jt-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Interview</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => {
                const ghosted = isGhosted(job);
                return (
                  <tr key={job._id} className={ghosted ? "row-ghosted" : ""}>
                    <td>
                      <div className="cell-company">
                        {job.jobUrl ? (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="company-link"
                          >
                            {job.company}
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                              style={{ marginLeft: 4 }}
                            >
                              <path
                                d="M2 8L8 2M8 2H4M8 2V6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </a>
                        ) : (
                          <span>{job.company}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="cell-role">{job.jobTitle}</span>
                    </td>
                    <td>
                      <div className="cell-status">
                        <StatusBadge status={job.status} ghosted={ghosted} />
                        <select
                          className="status-select"
                          value={job.status}
                          onChange={(e) =>
                            handleStatusChange(job._id, e.target.value)
                          }
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="cell-date">
                      {job.dateApplied
                        ? new Date(job.dateApplied).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "—"}
                    </td>
                    <td className="cell-date">
                      {job.interviewDate
                        ? new Date(job.interviewDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "—"}
                    </td>
                    <td>
                      <span className="cell-notes" title={job.notes}>
                        {job.notes
                          ? job.notes.length > 40
                            ? job.notes.slice(0, 40) + "…"
                            : job.notes
                          : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openEdit(job)}
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-pencil"
                            viewBox="0 0 16 16"
                          >
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                          </svg>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => setDeleteConfirm(job._id)}
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-trash"
                            viewBox="0 0 16 16"
                          >
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div
          className="jt-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeForm()}
        >
          <div className="jt-modal">
            <div className="jt-modal-header">
              <h2 className="jt-modal-title">
                {editJob ? "Edit Application" : "New Application"}
              </h2>
              <button className="jt-modal-close" onClick={closeForm}>
                ✕
              </button>
            </div>

            <div className="jt-modal-grid">
              <div className="jt-field">
                <label className="jt-label">
                  Company <span>*</span>
                </label>
                <input
                  className={`jt-input ${formErrors.company ? "error" : ""}`}
                  placeholder="e.g. TechCorp"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                />
                {formErrors.company && (
                  <div className="jt-error-msg">⚠ {formErrors.company}</div>
                )}
              </div>

              <div className="jt-field">
                <label className="jt-label">
                  Job Title <span>*</span>
                </label>
                <input
                  className={`jt-input ${formErrors.jobTitle ? "error" : ""}`}
                  placeholder="e.g. Junior Frontend Developer"
                  value={form.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                />
                {formErrors.jobTitle && (
                  <div className="jt-error-msg">⚠ {formErrors.jobTitle}</div>
                )}
              </div>

              <div className="jt-field">
                <label className="jt-label">Status</label>
                <select
                  className="jt-input"
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="jt-field">
                <label className="jt-label">Date Applied</label>
                <input
                  className="jt-input"
                  type="date"
                  value={form.dateApplied}
                  onChange={(e) => updateField("dateApplied", e.target.value)}
                />
              </div>

              <div className="jt-field jt-field-full">
                <label className="jt-label">Job Posting URL</label>
                <input
                  className="jt-input"
                  placeholder="https://..."
                  value={form.jobUrl}
                  onChange={(e) => updateField("jobUrl", e.target.value)}
                />
              </div>

              <div className="jt-field">
                <label className="jt-label">
                  Interview Date <span className="optional">(optional)</span>
                </label>
                <input
                  className="jt-input"
                  type="date"
                  value={form.interviewDate}
                  onChange={(e) => updateField("interviewDate", e.target.value)}
                />
              </div>

              <div className="jt-field jt-field-full">
                <label className="jt-label">Notes</label>
                <textarea
                  className="jt-input jt-textarea"
                  placeholder="e.g. Reached out to recruiter on LinkedIn…"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </div>
            </div>

            <div className="jt-modal-actions">
              <button className="jt-btn-cancel" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="jt-btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : editJob
                    ? "Save Changes"
                    : "Add Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div
          className="jt-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setDeleteConfirm(null)
          }
        >
          <div className="jt-modal jt-modal-sm">
            <div className="jt-modal-header">
              <h2 className="jt-modal-title">Delete Application?</h2>
              <button
                className="jt-modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ✕
              </button>
            </div>
            <p className="jt-delete-msg">
              This can't be undone. The entry will be permanently removed.
            </p>
            <div className="jt-modal-actions">
              <button
                className="jt-btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="jt-btn-delete"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
