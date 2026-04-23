const express = require("express");
const router = express.Router();
const FormModel = require("../Models/surveyForm");

router.post("/", async (req, res) => {
  const { name, email, age, role, recommend, feature, improvements, comments } =
    req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  try {
    const formEntry = new FormModel({
      name,
      email,
      age: age || null,
      role,
      recommend,
      feature,
      improvements,
      comments,
    });

    await formEntry.save();
    console.log("Saved to DB:", formEntry);

    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Submission error:", error.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
