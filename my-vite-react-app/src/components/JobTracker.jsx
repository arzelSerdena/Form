import { useState, useEffect } from "react";
import "./JobTracker.css";
import logoImg from "../assets/logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
          <span className="jt-header-sub">Job Tracker</span>
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
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                          >
                            <path
                              d="M9.5 1.5L11.5 3.5L4 11H2V9L9.5 1.5Z"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => setDeleteConfirm(job._id)}
                          title="Delete"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                          >
                            <path
                              d="M2 3.5H11M4.5 3.5V2.5H8.5V3.5M5 6V10M8 6V10"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                            />
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
