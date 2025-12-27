/**
 * validateUser.js
 *
 * Exports TWO middlewares:
 *  1) validateUser  -> checks login (valid Bearer JWT) and loads the user
 *  2) authorizeUser -> checks role (admin/client) AFTER validateUser ran
 *
 * Usage examples:
 *   const { validateUser, authorizeUser } = require('../middlewares/validateUser');
 *
 *   router.get('/admin-only', validateUser, authorizeUser('admin'), handler)
 *   router.get('/client-or-admin', validateUser, authorizeUser('client','admin'), handler)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

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

    const model = role === 'admin' ? Admin : User;
    const user = await model.findById(userId).select('-password');
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
