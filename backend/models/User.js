const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Not required — OAuth accounts (Google/GitHub) never set a password.
    // Local registration still enforces this at the controller level.
    password: { type: String },
    techStack: { type: [String], default: [] }, // e.g. ["MERN", "C#", ".NET"]

    // Set when the account was created/linked via a social provider.
    // sparse so multiple users without one don't collide on `null`.
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },

    // Rolling difficulty state used by the adaptive engine
    currentLevel: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    // Simple performance score used to decide level changes (0-100)
    performanceScore: { type: Number, default: 50 },

    // Gamification
    totalSolved: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: String, default: null }, // "YYYY-MM-DD", used for streak calc
    badges: { type: [String], default: [] },

    // Global Developer Elo Rating (chess-style competitive rating)
    eloRating: { type: Number, default: 1200 },

    // Questions the user has saved to revisit later
    bookmarkedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],

    // Shareable public profile URL slug, e.g. interviewos.dev/u/karishma-a1b2
    publicSlug: { type: String, unique: true, sparse: true },

    // Forgot Password
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // Email Verification
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.publicSlug) {
    const base = this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const suffix = this._id.toString().slice(-5);
    this.publicSlug = `${base || "user"}-${suffix}`;
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  if (!this.password) return Promise.resolve(false); // OAuth-only account, no local password to check
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);