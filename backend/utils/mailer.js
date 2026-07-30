const nodemailer = require("nodemailer");

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

/**
 * Sends an email if SMTP is configured. If not, logs it and returns
 * { sent: false } — callers should handle this gracefully (e.g. the
 * forgot-password flow returns the reset link directly in the API
 * response as a dev-mode fallback so the feature still works without
 * requiring the student to set up email).
 */
async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`[email disabled - no SMTP configured] Would send to ${to}: ${subject}`);
    return { sent: false, reason: "SMTP not configured" };
  }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error("Email send failed:", err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendEmail, isEmailConfigured: () => !!transporter };
