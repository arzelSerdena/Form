const mongoose = require("mongoose");

const formSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    age: {
      type: Number,
      min: [15, "Age must be at least 15"],
      max: [55, "Age must be at most 55"],
      default: null,
    },
    role: {
      type: String,
      enum: [
        "Student",
        "Full-Time Developer",
        "Full-Time Learner",
        "Freelancer",
        "Prefer not to say",
        "Other",
        "",
      ],
      default: "",
    },
    recommend: {
      type: String,
      enum: ["Definitely", "Maybe", "Not Sure", ""],
      default: "",
    },
    feature: {
      type: String,
      enum: [
        "Challenges",
        "Projects",
        "Community",
        "Open Source",
        "Roadmaps",
        "",
      ],
      default: "",
    },
    improvements: {
      type: [String],
      enum: [
        "front-end",
        "back-end",
        "data-viz",
        "challenges",
        "open-source",
        "videos",
        "meetups",
        "forum",
        "courses",
      ],
      default: [],
    },
    comments: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const FormModel = mongoose.model("Form", formSchema);

module.exports = FormModel;
