/**
 * validateEnv.js
 * -----------------------------------------------------------------------
 * Validates required environment variables on startup and fails fast
 * with a clear, actionable error message — instead of the app starting
 * in a broken state and failing mysteriously on the first request.
 * -----------------------------------------------------------------------
 */

const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];

const INSECURE_DEFAULTS = [
  "change_this_to_a_long_random_string",
  "replace_this_with_a_long_random_secret_key",
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error("\n❌ Missing required environment variable(s):", missing.join(", "));
    console.error("   Copy .env.example to .env and fill these in before starting the server.\n");
    process.exit(1);
  }

  if (INSECURE_DEFAULTS.includes(process.env.JWT_SECRET)) {
    if (process.env.NODE_ENV === "production") {
      console.error("\n❌ JWT_SECRET is still set to the example placeholder value.");
      console.error("   Generate a real secret before deploying to production, e.g.:");
      console.error('   node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n');
      process.exit(1);
    } else {
      console.warn("\n⚠️  JWT_SECRET is a placeholder value — fine for local dev, but change it before deploying.\n");
    }
  }

  if (process.env.NODE_ENV === "production" && (!process.env.CLIENT_URL || process.env.CLIENT_URL === "*")) {
    console.warn("\n⚠️  CLIENT_URL is not set in production — CORS will allow all origins. Set it to your deployed frontend URL.\n");
  }
}

module.exports = { validateEnv };
