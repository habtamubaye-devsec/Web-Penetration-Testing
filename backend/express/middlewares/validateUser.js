const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeRoles = (roles) => {
  if (!roles) return [];
  if (typeof roles === 'string') return [roles];
  if (Array.isArray(roles)) return roles;
  return [];
};

const validateUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string' || !header.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ status: 'failed', message: 'Unauthorized' });
    }

    const token = header.slice(7).trim();
    if (!token) {
      return res.status(401).json({ status: 'failed', message: 'Unauthorized' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ status: 'failed', message: 'JWT secret is not configured' });
    }

    // Requirement: JWT contains userId and role
    const payload = jwt.verify(token, secret);
    const role = payload?.role;
    const userId = payload?.userId || payload?.id;

    if (!role || !userId) {
      return res.status(401).json({ status: 'failed', message: 'Unauthorized' });
    }

    // Single collection supports both roles (admin/client)
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ status: 'failed', message: 'Unauthorized' });
    }

    req.user = user;
    req.auth = payload;

    return next();
  } catch {
    return res.status(401).json({ status: 'failed', message: 'Unauthorized' });
  }
};

const authorizeUser = (...allowedRoles) => {
  const allowed = normalizeRoles(allowedRoles.flat()).filter(Boolean);

  return (req, res, next) => {
    const role = req?.auth?.role;
    if (!role) {
      return res.status(401).json({ status: 'failed', message: 'Unauthorized' });
    }

    if (allowed.length > 0 && !allowed.includes(role)) {
      return res.status(403).json({ status: 'failed', message: 'Access denied: insufficient permissions' });
    }

    return next();
  };
};

module.exports = {
  validateUser,
  authorizeUser,
};
