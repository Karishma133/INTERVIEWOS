/**
 * dailyReminder.js
 * -----------------------------------------------------------------------
 * "Daily Practice Reminder" — a scheduled job (using node-cron, a free
 * open-source npm package, not a paid service) that runs once a day and
 * emails any user who hasn't solved a problem yet today, encouraging
 * them to keep their streak alive.
 *
 * If SMTP isn't configured, this silently no-ops (the mailer utility
 * already logs a fallback message) — the in-app dashboard banner
 * (frontend) still works regardless, so the feature is useful even
 * without email set up.
 * -----------------------------------------------------------------------
 */
const cron = require("node-cron");
const User = require("../models/User");
const { sendEmail, isEmailConfigured } = require("./mailer");

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function runDailyReminderSweep() {
  if (!isEmailConfigured()) {
    console.log("[daily-reminder] SMTP not configured — skipping email sweep (dashboard banner still works).");
    return;
  }

  const today = todayStr();
  const usersToRemind = await User.find({
    lastSolvedDate: { $ne: null, $ne: today },
  }).select("name email currentStreak");

  console.log(`[daily-reminder] Sending reminders to ${usersToRemind.length} user(s).`);

  for (const user of usersToRemind) {
    const streakMessage = user.currentStreak > 0
      ? `You're on a ${user.currentStreak}-day streak — don't break it!`
      : "Jump back in and start a new streak today.";

    await sendEmail({
      to: user.email,
      subject: "🔥 Keep your InterviewOS streak alive",
      html: `<p>Hi ${user.name},</p><p>You haven't practiced on InterviewOS today. ${streakMessage}</p><p>Even one problem keeps your momentum going.</p>`,
    });
  }
}

function startDailyReminderJob() {
  cron.schedule("0 18 * * *", () => {
    runDailyReminderSweep().catch((err) => console.error("[daily-reminder] sweep failed:", err.message));
  });
  console.log("[daily-reminder] Scheduled job registered (runs daily at 18:00 server time).");
}

module.exports = { startDailyReminderJob, runDailyReminderSweep };
