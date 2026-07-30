const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    headline: String,
    summary: String,
    skills: { type: [String], default: [] },
    education: [{ degree: String, field: String, institution: String, startYear: Number, endYear: Number }],
    experience: [{ title: String, company: String, startDate: String, endDate: String, current: Boolean, description: String }],
    projects: [{ title: String, description: String, link: String, techUsed: [String] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
