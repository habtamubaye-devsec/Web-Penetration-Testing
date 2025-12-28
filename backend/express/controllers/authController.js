const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const validatePassword = require('../utils/validatePassword');
const sendEmail = require('../utils/sendEmail');

const createToken = (userId, role) => {
    return jwt.sign({ id: userId, userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please provide email and password',
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const passwordString = String(password);

        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please provide a valid email address',
            });
        }

        // Single collection supports both roles: role = 'admin' or 'client'
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                status: 'failed',
                message: 'Invalid credentials',
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                status: 'failed',
                message: 'Account is blocked',
            });
        }

        if (!user.password) {
            return res.status(401).json({
                status: 'failed',
                message: 'Invalid credentials',
            });
        }

        const isMatch = await bcrypt.compare(passwordString, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'failed',
                message: 'Invalid credentials',
            });
        }

        const role = user.role || 'client';
        const token = createToken(user._id, role);

        return res.status(200).json({
            status: 'success',
            message: 'Logged in successfully',
            data: {
                token,
            },
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 'failed',
            message: err.message,
        });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please provide name, email and password',
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) {
            return res.status(400).json({
                status: 'failed',
                message: 'User already exists',
            });
        }
        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please enter a valid email address',
            });
        } 

        const { isValid, message } = validatePassword(password);
        if (!isValid) {
            return res.status(400).json({
                status: 'failed',
                message,
            });
        }

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'client'
        });

        const user = await newUser.save();
        const token = createToken(user._id, user.role);

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user,
                token,
            },
        });
    } catch (err) {
        console.error(err);

        // Handle Mongo duplicate key errors (e.g., email already exists)
        if (err && (err.code === 11000 || err.code === 11001)) {
            return res.status(400).json({
                status: 'failed',
                message: 'User already exists',
            });
        }

        res.status(500).json({
            status: 'failed',
            message: err.message,
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'Valid email is required.' });
        }

        const user = await User.findOne({ email: normalizedEmail });

        // Avoid account enumeration: always respond with a generic success message.
        if (!user) {
            return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetToken = tokenHash;
        user.tokenExpire = new Date(Date.now() + 3600000); // 1 hour
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
        const resetUrl = `${clientUrl.replace(/\/$/, '')}/reset-password/${encodeURIComponent(rawToken)}`;

        const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
        console.log(user.email, resetUrl);

        try {
            const result = await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Click this link to set a new password: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
            });

            if (isDev && result?.mode === 'log') {
                return res.status(200).json({
                    message: 'Email sending is disabled (EMAIL_MODE=log). Use the resetUrl to continue.',
                    resetUrl,
                });
            }
        } catch (mailErr) {
            if (isDev) {
                return res.status(200).json({
                    message: `Email could not be sent from this server (${mailErr?.message || 'unknown error'}). Use resetUrl to continue in dev.`,
                    resetUrl,
                });
            }

            user.resetToken = undefined;
            user.tokenExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Failed to send reset email' });
        }

        return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const rawToken = String(req.params.token || '').trim();
        const password = String(req.body?.password || '');

        if (!rawToken) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const user = await User.findOne({
            resetToken: tokenHash,
            tokenExpire: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const { isValid, message } = validatePassword(password);
        if (!isValid) {
            return res.status(400).json({
                status: 'failed',
                message,
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetToken = undefined;
        user.tokenExpire = undefined;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.me = async (req, res) => {
    try {
        // Populated by requireAuth middleware
        if (!req.user) {
            return res.status(401).json({
                status: 'failed',
                message: 'Unauthorized',
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                user: req.user,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 'failed',
            message: 'An internal server error occurred',
        });
    }
};