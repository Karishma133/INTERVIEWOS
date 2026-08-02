const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

/** Builds a unique publicSlug the same way User.js's pre-save hook does,
 * for the rare case two OAuth signups share a name before _id exists. */
function randomSuffix() {
  return Math.random().toString(36).slice(2, 7);
}

/** Redirects the browser back to the frontend login page carrying either
 * a fresh JWT (success) or an error message — Login.js reads these from
 * the query string on mount. Keeps this file the single place that owns
 * the "how do we hand a token back to the SPA" decision. */
function sendResultToFrontend(res, { token, error }) {
  const url = new URL("/login", CLIENT_URL);
  if (token) url.searchParams.set("oauth_token", token);
  if (error) url.searchParams.set("oauth_error", error);
  res.redirect(url.toString());
}

// ------------------------------------------------------------------
// GitHub
// ------------------------------------------------------------------

// GET /api/auth/github
function githubAuthRedirect(req, res) {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.status(500).json({ message: "GitHub login isn't configured on this server yet." });
  }
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${SERVER_URL}/api/auth/github/callback`,
    scope: "read:user user:email",
    allow_signup: "true",
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

// GET /api/auth/github/callback
async function githubAuthCallback(req, res) {
  try {
    const { code } = req.query;
    if (!code) return sendResultToFrontend(res, { error: "GitHub login was cancelled." });

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${SERVER_URL}/api/auth/github/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return sendResultToFrontend(res, { error: "GitHub didn't return an access token." });
    }

    const ghHeaders = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "InterviewOS",
    };

    const profileRes = await fetch("https://api.github.com/user", { headers: ghHeaders });
    const profile = await profileRes.json();

    // GitHub only includes `email` on the profile if the user made it
    // public — otherwise we have to ask the emails endpoint separately.
    let email = profile.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", { headers: ghHeaders });
      const emails = await emailsRes.json();
      const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified) || emails[0] : null;
      email = primary?.email;
    }
    if (!email) {
      return sendResultToFrontend(res, { error: "Your GitHub account has no accessible email address." });
    }

    let user = await User.findOne({ $or: [{ githubId: String(profile.id) }, { email }] });
    if (user) {
      if (!user.githubId) user.githubId = String(profile.id); // link GitHub to an existing email/password account
      await user.save();
    } else {
      user = await User.create({
        name: profile.name || profile.login || `GitHub User ${randomSuffix()}`,
        email,
        githubId: String(profile.id),
        emailVerified: true, // GitHub already verified this address
      });
    }

    sendResultToFrontend(res, { token: generateToken(user._id) });
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    sendResultToFrontend(res, { error: "Something went wrong signing in with GitHub." });
  }
}

// ------------------------------------------------------------------
// Google
// ------------------------------------------------------------------

// GET /api/auth/google
function googleAuthRedirect(req, res) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "Google login isn't configured on this server yet." });
  }
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${SERVER_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

// GET /api/auth/google/callback
async function googleAuthCallback(req, res) {
  try {
    const { code } = req.query;
    if (!code) return sendResultToFrontend(res, { error: "Google login was cancelled." });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: `${SERVER_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return sendResultToFrontend(res, { error: "Google didn't return an access token." });
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    if (!profile.email) {
      return sendResultToFrontend(res, { error: "Your Google account has no accessible email address." });
    }

    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email }] });
    if (user) {
      if (!user.googleId) user.googleId = profile.sub; // link Google to an existing email/password account
      await user.save();
    } else {
      user = await User.create({
        name: profile.name || `Google User ${randomSuffix()}`,
        email: profile.email,
        googleId: profile.sub,
        emailVerified: !!profile.email_verified,
      });
    }

    sendResultToFrontend(res, { token: generateToken(user._id) });
  } catch (err) {
    console.error("Google OAuth error:", err);
    sendResultToFrontend(res, { error: "Something went wrong signing in with Google." });
  }
}

module.exports = { githubAuthRedirect, githubAuthCallback, googleAuthRedirect, googleAuthCallback };