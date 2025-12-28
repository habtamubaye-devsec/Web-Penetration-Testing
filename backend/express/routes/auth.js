const router = require('express').Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { validateUser } = require('../middlewares/validateUser');


// ========================
// GOOGLE AUTH
// ========================
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"]}));

router.get(
  "/google/callback",
  passport.authenticate("google", {failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign( 
      { id: req.user._id, userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
    // Put token in URL hash so it isn't sent back to the server via requests.
    res.redirect(`${clientUrl}/oauth/callback#token=${encodeURIComponent(token)}`);
  }
);

// ========================
// GITHUB AUTH
// ========================
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:8080"}/login?oauthError=1&provider=github`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
    res.redirect(`${clientUrl}/oauth/callback#token=${encodeURIComponent(token)}`);
  }
);

// Current user
router.get('/me', validateUser, authController.me);

// ========================
// LOCAL AUTH
// ========================
router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;