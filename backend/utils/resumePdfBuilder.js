/**
 * resumePdfBuilder.js
 * -----------------------------------------------------------------------
 * Generates a clean, single-column, ATS-friendly PDF resume using pdfkit
 * (free, open-source, runs entirely on our own server — no external AI
 * API call). This is template/layout-driven, not LLM-generated text:
 * the student supplies their own content (skills, education, experience,
 * projects) and we handle professional formatting + auto-add a DSA
 * achievements section pulled from their real InterviewOS stats.
 * -----------------------------------------------------------------------
 */
const PDFDocument = require("pdfkit");

const COLORS = { heading: "#111827", accent: "#4f46e5", text: "#374151", muted: "#6b7280" };

function sectionHeading(doc, text) {
  doc.moveDown(0.6);
  doc.fontSize(12).fillColor(COLORS.accent).font("Helvetica-Bold").text(text.toUpperCase(), { characterSpacing: 0.5 });
  const y = doc.y + 2;
  doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).strokeColor(COLORS.accent).lineWidth(1).stroke();
  doc.moveDown(0.4);
}

function bullet(doc, text) {
  doc.fontSize(10).fillColor(COLORS.text).font("Helvetica").text(`•  ${text}`, { indent: 4, lineGap: 2 });
}

function buildResumePdf(res, profile, skillforgeStats) {
  const doc = new PDFDocument({ margin: 45, size: "A4" });
  doc.pipe(res);

  doc.fontSize(22).fillColor(COLORS.heading).font("Helvetica-Bold").text(profile.name || "Your Name");
  const contactLine = [profile.email, profile.phone, profile.location, profile.linkedin]
    .filter(Boolean)
    .join("   |   ");
  doc.fontSize(9.5).fillColor(COLORS.muted).font("Helvetica").text(contactLine);

  if (profile.headline) {
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor(COLORS.text).font("Helvetica-Oblique").text(profile.headline);
  }

  if (profile.summary) {
    sectionHeading(doc, "Summary");
    doc.fontSize(10).fillColor(COLORS.text).font("Helvetica").text(profile.summary, { lineGap: 2 });
  }

  if (profile.skills?.length) {
    sectionHeading(doc, "Technical Skills");
    doc.fontSize(10).fillColor(COLORS.text).font("Helvetica").text(profile.skills.join("   •   "), { lineGap: 2 });
  }

  if (profile.experience?.length) {
    sectionHeading(doc, "Experience");
    profile.experience.forEach((exp) => {
      doc.fontSize(10.5).fillColor(COLORS.heading).font("Helvetica-Bold")
        .text(`${exp.title || ""} — ${exp.company || ""}`, { continued: false });
      doc.fontSize(9).fillColor(COLORS.muted).font("Helvetica-Oblique")
        .text(`${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}`);
      if (exp.description) {
        exp.description.split("\n").filter(Boolean).forEach((line) => bullet(doc, line.replace(/^[-•]\s*/, "")));
      }
      doc.moveDown(0.3);
    });
  }

  if (profile.projects?.length) {
    sectionHeading(doc, "Projects");
    profile.projects.forEach((proj) => {
      doc.fontSize(10.5).fillColor(COLORS.heading).font("Helvetica-Bold").text(proj.title || "");
      if (proj.techUsed?.length) {
        doc.fontSize(9).fillColor(COLORS.muted).font("Helvetica-Oblique").text(proj.techUsed.join(", "));
      }
      if (proj.description) bullet(doc, proj.description);
      if (proj.link) doc.fontSize(9).fillColor(COLORS.accent).text(proj.link);
      doc.moveDown(0.3);
    });
  }

  if (profile.education?.length) {
    sectionHeading(doc, "Education");
    profile.education.forEach((edu) => {
      doc.fontSize(10.5).fillColor(COLORS.heading).font("Helvetica-Bold").text(`${edu.degree || ""}${edu.field ? ", " + edu.field : ""}`);
      doc.fontSize(9.5).fillColor(COLORS.text).font("Helvetica").text(edu.institution || "");
      doc.fontSize(9).fillColor(COLORS.muted).font("Helvetica-Oblique").text(`${edu.startYear || ""} - ${edu.endYear || ""}`);
      doc.moveDown(0.3);
    });
  }

  if (skillforgeStats && skillforgeStats.totalSolved > 0) {
    sectionHeading(doc, "Coding & Problem Solving");
    bullet(doc, `Solved ${skillforgeStats.totalSolved}+ Data Structures & Algorithms problems on InterviewOS (current level: ${skillforgeStats.currentLevel}).`);
    if (skillforgeStats.longestStreak >= 3) {
      bullet(doc, `Maintained a ${skillforgeStats.longestStreak}-day consistent practice streak.`);
    }
    if (skillforgeStats.badges?.length) {
      bullet(doc, `Earned ${skillforgeStats.badges.length} skill-verification badges through consistent practice and performance milestones.`);
    }
  }

  doc.end();
}

module.exports = { buildResumePdf };
