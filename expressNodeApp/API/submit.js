const express = require("express");
const router = express.Router();
const Job = require("../Models/jobApplication");

// GET all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch jobs." });
  }
});

// POST create a new job
router.post("/", async (req, res) => {
  const {
    company,
    jobTitle,
    status,
    dateApplied,
    jobUrl,
    notes,
    interviewDate,
  } = req.body;

  if (!company || !jobTitle) {
    return res
      .status(400)
      .json({ message: "Company and job title are required." });
  }

  try {
    const job = new Job({
      company,
      jobTitle,
      status,
      dateApplied,
      jobUrl,
      notes,
      interviewDate,
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error("Create error:", error.message);
    res.status(500).json({ message: "Failed to create job." });
  }
});

// PATCH update a job (status, notes, any field)
router.patch("/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.status(200).json(job);
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: "Failed to update job." });
  }
});

// DELETE a job
router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.status(200).json({ message: "Job deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Failed to delete job." });
  }
});

module.exports = router;
