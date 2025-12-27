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
router.post('/admin-login', authController.adminLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// router.get('/reset-password/:token', (req, res) => {
//     const { token } = req.params;
//     console.log('Reset password route hit with token:', token);
//     res.send(`
//         <html>
//             <body>
//                 <h1>Reset Password</h1>
//                 <form action="/api/auth/reset-password/${encodeURIComponent(token)}" method="POST">
//                     <input type="password" name="password" placeholder="Enter new password" required />
//                     <button type="submit">Reset Password</button>
//                 </form>
//             </body>
//         </html>
//     `);

    // Option 2: Redirect to frontend (if applicable)
    // res.redirect(`http://your-frontend-url/reset-password/${token}`);

    // Option 3: Respond with a JSON message (for API-only backend)
    // res.status(200).json({ message: 'Reset password link is valid', token });
// });

module.exports = router;