const Resume = require("../models/Resume");
const User = require("../models/User");
const { buildResumePdf } = require("../utils/resumePdfBuilder");
const { generateSummary, suggestProjectBullets } = require("../utils/resumeContentSuggester");

// GET /api/resume
const getResume = async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id });
  res.json(resume || null);
};

// PUT /api/resume  — save/update draft
const saveResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { ...req.body, user: req.user._id },
      { new: true, upsert: true }
    );
    res.json(resume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/resume/suggest-summary  { headline, skills, yearsExperience, projectCount }
const suggestSummary = async (req, res) => {
  const summary = generateSummary(req.body);
  res.json({ summary });
};

// POST /api/resume/suggest-bullets  { techUsed: [] }
const suggestBullets = async (req, res) => {
  const bullets = suggestProjectBullets(req.body.techUsed || []);
  res.json({ bullets });
};

// GET /api/resume/download — streams the generated PDF
const downloadResume = async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id });
  if (!resume) return res.status(404).json({ message: "No resume draft found. Save your resume details first." });

  const user = await User.findById(req.user._id).select("totalSolved currentLevel longestStreak badges");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${(resume.name || "resume").replace(/\s+/g, "_")}_InterviewOS.pdf"`);

  buildResumePdf(res, resume.toObject(), user.toObject());
};

module.exports = { getResume, saveResume, suggestSummary, suggestBullets, downloadResume };
