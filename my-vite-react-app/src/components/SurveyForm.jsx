import "./SurveyForm.css";
import React, { useState } from "react";
import logoImg from "../assets/logo.png";

const STEPS = ["About You", "Your Experience", "Feedback"];

const ROLES = [
  "Select your role",
  "Student",
  "Full-Time Developer",
  "Full-Time Learner",
  "Freelancer",
  "Prefer not to say",
  "Other",
];

const FEATURES = [
  "Select a feature",
  "Challenges",
  "Projects",
  "Community",
  "Open Source",
  "Roadmaps",
];

const IMPROVEMENTS = [
  { id: "front-end", label: "Front-end Projects" },
  { id: "back-end", label: "Back-end Projects" },
  { id: "data-viz", label: "Data Visualization" },
  { id: "challenges", label: "Challenges" },
  { id: "open-source", label: "Open Source Community" },
  { id: "videos", label: "Video Tutorials" },
  { id: "meetups", label: "City Meetups" },
  { id: "forum", label: "Forum" },
  { id: "courses", label: "Additional Courses" },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  age: "",
  role: "",
  recommend: "",
  feature: "",
  improvements: [],
  comments: "",
};

export default function SurveyForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const toggleImprovement = (id) => {
    setForm((f) => ({
      ...f,
      improvements: f.improvements.includes(id)
        ? f.improvements.filter((x) => x !== id)
        : [...f.improvements, id],
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        newErrors.email = "Enter a valid email";
    }
    if (step === 1) {
      if (!form.recommend) newErrors.recommend = "Please select an option";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);
  const handleSubmit = () => {
    if (validateStep()) setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setStep(0);
    setForm(EMPTY_FORM);
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  if (submitted) {
    return (
      <div className="page">
        <div className="card success-card">
          <div className="check-ring">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M7 16.5L13 22.5L25 10"
                stroke="url(#ck)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="ck" x1="7" y1="16" x2="25" y2="16">
                  <stop stopColor="#1A4ED7" />
                  <stop offset="1" stopColor="#2DD4BF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="success-title">Thanks, {form.name.split(" ")[0]}!</h2>
          <p className="success-sub">
            Your feedback helps shape the future of DevDash. We read every
            response.
          </p>
          <button className="btn-primary" onClick={reset}>
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dots" />

      <header className="header">
        <div className="logo-wrap">
          <img src={logoImg} className="logo-icon" alt="DevDash" />
          <span className="brand">DevDash</span>
        </div>
        <p className="tagline">Community Feedback Survey</p>
      </header>

      <div className="card">
        <div className="step-header">
          <div className="step-label">
            Step {step + 1} of {STEPS.length}
          </div>
          <div className="step-title">{STEPS[step]}</div>
        </div>

        <div className="steps-indicator">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`}
            />
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="field">
              <label className="label" htmlFor="name">
                Full Name
              </label>
              <input
                className={`input ${errors.name ? "error" : ""}`}
                id="name"
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
              {errors.name && <div className="error-msg">⚠ {errors.name}</div>}
            </div>

            <div className="field">
              <label className="label" htmlFor="email">
                Email Address
              </label>
              <input
                className={`input ${errors.email ? "error" : ""}`}
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              {errors.email && (
                <div className="error-msg">⚠ {errors.email}</div>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor="age">
                Age <span>(optional · 15–55)</span>
              </label>
              <input
                className="input"
                id="age"
                type="number"
                placeholder="Enter your age"
                min={15}
                max={55}
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="role">
                Current Role
              </label>
              <select
                className="input"
                id="role"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r === "Select your role" ? "" : r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="field">
              <div className="legend">
                Would you recommend DevDash to a friend?
              </div>
              <div className="radio-group">
                {["Definitely", "Maybe", "Not Sure"].map((opt) => (
                  <label
                    key={opt}
                    className={`radio-item ${form.recommend === opt ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="recommend"
                      value={opt}
                      checked={form.recommend === opt}
                      onChange={() => update("recommend", opt)}
                    />
                    <span className="custom-radio">
                      <span className="custom-radio-dot" />
                    </span>
                    {opt}
                  </label>
                ))}
              </div>
              {errors.recommend && (
                <div className="error-msg" style={{ marginTop: "0.5rem" }}>
                  ⚠ {errors.recommend}
                </div>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor="feature">
                Favorite Feature
              </label>
              <select
                className="input"
                id="feature"
                value={form.feature}
                onChange={(e) => update("feature", e.target.value)}
              >
                {FEATURES.map((f) => (
                  <option key={f} value={f === "Select a feature" ? "" : f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="field">
              <div className="legend">
                What should we improve? <span>(select all that apply)</span>
              </div>
              <div className="check-grid">
                {IMPROVEMENTS.map(({ id, label }) => (
                  <label
                    key={id}
                    className={`check-item ${form.improvements.includes(id) ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      value={id}
                      checked={form.improvements.includes(id)}
                      onChange={() => toggleImprovement(id)}
                    />
                    <span className="custom-check">
                      {form.improvements.includes(id) && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.8 7L9 1"
                            stroke="#0A192F"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="comments">
                Comments or Suggestions <span>(optional)</span>
              </label>
              <textarea
                className="input"
                id="comments"
                placeholder="Share your thoughts with the DevDash team…"
                value={form.comments}
                onChange={(e) => update("comments", e.target.value)}
              />
            </div>
          </>
        )}

        <div className="actions">
          {step > 0 && (
            <button className="btn-back" onClick={back}>
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={next}>
              Continue →
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit}>
              Submit Feedback ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
