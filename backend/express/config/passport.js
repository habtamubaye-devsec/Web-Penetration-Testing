const passport = require("passport");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

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

// Serialize/deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// --- Google OAuth ---
if (!GoogleStrategy) {
  console.warn("passport-google-oauth20 is not installed");
} else if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("Google OAuth client ID/secret not set in .env");
} else {
  const port = process.env.PORT || 8000;
  const serverUrl = (process.env.SERVER_URL || `http://localhost:${port}`).replace(/\/$/, "");
  const googleCallbackUrl =
    (process.env.GOOGLE_CALLBACK_URL || `${serverUrl}/api/auth/google/callback`).replace(/\/$/, "");

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ email: profile.emails[0].value });
          if (existingUser) return done(null, existingUser);

          const randomPassword = crypto.randomBytes(20).toString("hex");
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(randomPassword, salt);

          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: hashedPassword,
            role: "client",
          });
          done(null, newUser);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// --- GitHub OAuth ---
if (!GitHubStrategy) {
  console.warn("passport-github2 is not installed");
} else if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.warn("GitHub OAuth client ID/secret not set in .env");
} else {
  const port = process.env.PORT || 8000;
  const serverUrl = (process.env.SERVER_URL || `http://localhost:${port}`).replace(/\/$/, "");
  const githubCallbackUrl =
    (process.env.GITHUB_CALLBACK_URL || `${serverUrl}/api/auth/github/callback`).replace(/\/$/, "");

  passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"], // 🔑 Required to fetch emails
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub may not return a public email
        let email = profile.emails?.[0]?.value;

        // Fallback: generate a fake email if none exists
        if (!email) {
          email = `${profile.username}@users.noreply.github.com`;
          console.warn("No public email for GitHub user, using fallback:", email);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return done(null, existingUser);

        // Create new user
        const randomPassword = crypto.randomBytes(20).toString("hex");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        const newUser = await User.create({
          name: profile.displayName || profile.username,
          email,
          isVerified: true, // OAuth trusted
          password: crypto.randomBytes(20).toString("hex"), // random password
        });

        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);
}
