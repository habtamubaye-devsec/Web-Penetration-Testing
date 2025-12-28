const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const upload = require('../middlewares/multer');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "client", isActive: "true" }).select('-password');
        if (users.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No users found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Users fetched successfully',
            users
       });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' + err.message });
    }
}

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
        res.status(200).json({
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
}


exports.updateUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if a file is uploaded
        if (req.file) {
            // Upload the file to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'profile_images',
            });

            // Add the Cloudinary URL to the request body
            req.body.image = result.secure_url;
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user: ' + err.message,
        });
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
        res.status(200).json({
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
}



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
