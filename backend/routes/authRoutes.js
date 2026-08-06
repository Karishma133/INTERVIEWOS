const express = require("express");
const router = express.Router();
const {
  registerUser, loginUser, getMe, forgotPassword, resetPassword, verifyEmail, resendVerification,
  updateProfile, changePassword,
} = require("../controllers/authController");
const {
  githubAuthRedirect, githubAuthCallback, googleAuthRedirect, googleAuthCallback,
} = require("../controllers/socialAuthController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerification);

// Social login — redirect to provider, then provider redirects back here
router.get("/github", githubAuthRedirect);
router.get("/github/callback", githubAuthCallback);
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

module.exports = router;