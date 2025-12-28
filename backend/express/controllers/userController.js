const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const validatePassword = require('../utils/validatePassword');

exports.getAllUsers = async (req, res) => {
    try {
        // Admin view: list all users except admins (include active + blocked)
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .sort({ createdAt: -1 });

        // Return empty list instead of 404 to keep UI simple.
        return res.status(200).json({
            status: 'success',
            message: 'Users fetched successfully',
            users
        });
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching users' + err.message });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'User fetched successfully',
            user
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Error fetching user' + err.message
        });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;

    try {
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }

        // Only allow specific profile fields to be updated from the request body
        const updates = {};

        if (typeof req.body?.name === 'string') {
            const name = req.body.name.trim();
            if (name) updates.name = name;
        }

        if (typeof req.body?.email === 'string') {
            const normalizedEmail = req.body.email.trim().toLowerCase();
            if (!validator.isEmail(normalizedEmail)) {
                return res.status(400).json({ status: 'fail', message: 'Please provide a valid email address' });
            }

            // Ensure email uniqueness (excluding this user)
            const emailOwner = await User.findOne({ email: normalizedEmail });
            if (emailOwner && String(emailOwner._id) !== String(existingUser._id)) {
                return res.status(400).json({ status: 'fail', message: 'Email is already in use' });
            }

            updates.email = normalizedEmail;
        }

        // If a profile image is uploaded, replace existing image in Cloudinary + DB
        if (req.file) {
            if (existingUser.imagePublicId) {
                try {
                    await cloudinary.uploader.destroy(existingUser.imagePublicId);
                } catch (destroyErr) {
                    console.error('Failed to delete old Cloudinary image:', destroyErr?.message || destroyErr);
                }
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'Ai-enhanced web penetration testing/profile image',
            });

            // Force values from Cloudinary (do not trust client body for these fields)
            updates.image = result.secure_url;
            updates.imagePublicId = result.public_id;
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        return res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            user,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 'error',
            message: 'Error updating user: ' + err.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        // Only allow changing password for the currently authenticated user.
        if (!req.user?._id) {
            return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body || {};

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'currentPassword, newPassword and confirmPassword are required',
            });
        }

        if (String(newPassword) !== String(confirmPassword)) {
            return res.status(400).json({ status: 'fail', message: 'New password and confirm password do not match' });
        }

        if (String(currentPassword) === String(newPassword)) {
            return res.status(400).json({ status: 'fail', message: 'New password must be different from current password' });
        }

        const { isValid, message } = validatePassword(String(newPassword));
        if (!isValid) {
            return res.status(400).json({ status: 'fail', message });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        if (!user.password) {
            return res.status(400).json({ status: 'fail', message: 'Password change is not available for this account' });
        }

        const isMatch = await bcrypt.compare(String(currentPassword), String(user.password));
        if (!isMatch) {
            return res.status(400).json({ status: 'fail', message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(String(newPassword), salt);
        await user.save();

        return res.status(200).json({ status: 'success', message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Failed to update password', error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid user ID'
            });
        }
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
            user
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Error deleting user' + err.message
        });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId, status } = req.body || {};

        if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid userId' });
        }

        const normalizedStatus = String(status || '').trim().toLowerCase();
        if (!['active', 'blocked'].includes(normalizedStatus)) {
            return res.status(400).json({ status: 'fail', message: 'Status must be active or blocked' });
        }

        const isActive = normalizedStatus === 'active';

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { isActive } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'User status updated successfully',
            user,
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Failed to update user status', error: err.message });
    }
};


