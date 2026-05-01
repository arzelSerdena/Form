const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Saved", "Applied", "Interviewing", "Offer", "Rejected"],
      default: "Saved",
    },
    dateApplied: {
      type: Date,
      default: null,
    },
    jobUrl: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    interviewDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("JobApplication", jobSchema);
