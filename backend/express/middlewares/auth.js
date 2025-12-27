const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

module.exports = async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || typeof header !== "string" || !header.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const token = header.slice(7).trim();
    if (!token) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ status: "failed", message: "JWT secret is not configured" });
    }

    const payload = jwt.verify(token, secret);

    const model = payload?.role === "admin" ? Admin : User;
    const user = await model.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({ status: "failed", message: "Unauthorized" });
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({ status: "failed", message: "Unauthorized" });
  }
};
