const passport = require("passport");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");

let GoogleStrategy;
let GitHubStrategy;

try {
  GoogleStrategy = require("passport-google-oauth20").Strategy;
} catch (_) {
  GoogleStrategy = null;
}

try {
  GitHubStrategy = require("passport-github2").Strategy;
} catch (_) {
  GitHubStrategy = null;
}

const ensureHashedPassword = async () => {
  const random = crypto.randomBytes(20).toString("hex");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(random, salt);
};

// --- Google OAuth ---
if (GoogleStrategy) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    `http://localhost:${process.env.PORT || 8000}/api/auth/google/callback`;

  if (!clientID || !clientSecret) {
    console.warn("Google OAuth client ID/secret not set in .env");
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL: googleCallbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile?.emails?.[0]?.value?.toLowerCase();
            if (!email) return done(null, false);

            const existingUser = await User.findOne({ email });
            if (existingUser) return done(null, existingUser);

            const password = await ensureHashedPassword();
            const newUser = await User.create({
              name: profile.displayName || "OAuth User",
              email,
              password,
              role: "client",
            });

            return done(null, newUser);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }
}

// --- GitHub OAuth ---
if (GitHubStrategy) {
  const clientID = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const githubCallbackUrl =
    process.env.GITHUB_CALLBACK_URL ||
    `http://localhost:${process.env.PORT || 8000}/api/auth/github/callback`;

  if (!clientID || !clientSecret) {
    console.warn("GitHub OAuth client ID/secret not set in .env");
  } else {
    passport.use(
      new GitHubStrategy(
        {
          clientID,
          clientSecret,
          callbackURL: githubCallbackUrl,
          scope: ["user:email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let email = profile?.emails?.[0]?.value?.toLowerCase();
            if (!email) {
              const username = profile?.username || "github";
              email = `${username}@users.noreply.github.com`;
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) return done(null, existingUser);

            const password = await ensureHashedPassword();
            const newUser = await User.create({
              name: profile.displayName || profile.username || "GitHub User",
              email,
              password,
              role: "client",
            });

            return done(null, newUser);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }
}

module.exports = passport;

