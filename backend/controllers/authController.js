const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail, isEmailConfigured } = require("../utils/mailer");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/** Creates a fresh verification token on the user doc and emails it
 * (or returns a dev-mode link if SMTP isn't configured). */
async function sendVerificationEmail(user) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const verifyLink = `${clientUrl}/verify-email/${rawToken}`;

  const emailResult = await sendEmail({
    to: user.email,
    subject: "Verify your InterviewOS email",
    html: `<p>Hi ${user.name},</p><p>Please verify your email address to activate your account:</p><p><a href="${verifyLink}">${verifyLink}</a></p><p>This link expires in 24 hours.</p>`,
  });

  return emailResult.sent ? null : verifyLink; // returns dev-mode link if email wasn't actually sent
}

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, techStack } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = await User.create({ name, email, password, techStack });
    const devVerificationLink = await sendVerificationEmail(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      techStack: user.techStack,
      currentLevel: user.currentLevel,
      performanceScore: user.performanceScore,
      totalSolved: user.totalSolved,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastSolvedDate: user.lastSolvedDate,
      badges: user.badges,
      publicSlug: user.publicSlug,
      emailVerified: user.emailVerified,
      eloRating: user.eloRating,
      hasPassword: true,
      devVerificationLink, // present only when SMTP isn't configured, for dev/testing convenience
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      techStack: user.techStack,
      currentLevel: user.currentLevel,
      performanceScore: user.performanceScore,
      totalSolved: user.totalSolved,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastSolvedDate: user.lastSolvedDate,
      badges: user.badges,
      publicSlug: user.publicSlug,
      emailVerified: user.emailVerified,
      eloRating: user.eloRating,
      hasPassword: !!user.password,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  // authMiddleware already strips `password` off req.user, so we can't
  // read it there — a tiny separate query just checks whether one exists.
  const passwordCheck = await User.findById(req.user._id).select("password");
  const user = req.user.toObject();
  user.hasPassword = !!passwordCheck?.password;
  res.json(user);
};

// POST /api/auth/forgot-password  { email }
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond with success (don't reveal whether the email exists —
    // standard security practice to prevent account enumeration).
    if (!user) {
      return res.json({ message: "If an account exists with that email, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetLink = `${clientUrl}/reset-password/${rawToken}`;

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Reset your InterviewOS password",
      html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    });

    const response = { message: "If an account exists with that email, a reset link has been sent." };
    // Dev-mode fallback: if no SMTP is configured, return the link directly
    // so the feature is still fully usable without setting up email.
    if (!emailResult.sent) {
      response.devResetLink = resetLink;
      response.note = "Email is not configured on this server — using dev-mode fallback link above instead.";
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password/:token  { password }
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired. Please request a new one." });
    }

    user.password = password; // pre-save hook hashes it
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in with your new password.", token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile  { name, techStack }
const updateProfile = async (req, res) => {
  try {
    const { name, techStack } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const user = await User.findById(req.user._id);
    user.name = name.trim();
    if (Array.isArray(techStack)) user.techStack = techStack;
    await user.save();
    const clean = user.toObject();
    delete clean.password;
    res.json(clean);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/change-password  { currentPassword, newPassword }
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(req.user._id);

    // OAuth-only accounts (no password set yet) can set one without
    // proving a "current" password, since there isn't one to prove.
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const matches = await user.matchPassword(currentPassword);
      if (!matches) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }

    user.password = newPassword; // pre-save hook hashes it
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser, loginUser, getMe, forgotPassword, resetPassword, verifyEmail, resendVerification,
  isEmailConfigured, updateProfile, changePassword,
};

// GET /api/auth/verify-email/:token
async function verifyEmail(req, res) {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired. Please request a new one." });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/auth/resend-verification  (requires auth)
async function resendVerification(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (user.emailVerified) {
      return res.json({ message: "Your email is already verified." });
    }
    const devVerificationLink = await sendVerificationEmail(user);
    res.json({
      message: "Verification email sent.",
      devVerificationLink,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}