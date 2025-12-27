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


exports.scanStatus = async(req,res)=>{
    const url = "scan_network_update_123";
    try {
        const response = await axios.get(`http://192.168.216.2:8000/api/scan/status/${url}`);
        res.status(200).json({
          status: 'success',
          data: response.data
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to fetch scan status',
          error: error.message
        });
      }
  }

exports.sendScanRequst = async(req,res)=>{
  const url = req.body.url;
  console.log("url: ",url);
  const payload = {
      url:url,
      scan_type: 'full',
      scan_id: 'scan_network_update_123',
      callback_url: 'https://your-callback-url.com/results'
    };
    console.log("url 2: ",url);
    try {
      const response = await axios.post('http://192.168.216.2:8000/api/scan', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log("url 3: ",url);
      res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to send scan request',
        error: error.message
      });
    }
}

exports.result = async(req,res)=>{
    const url = "scan_network_update_123";
    try {
        const response = await axios.get(`http://192.168.216.2:8000/api/scan/result/${url}`);
        res.status(200).json({
          status: 'success',
          data: response.data
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to fetch scan status',
          error: error.message
        });
      }
}
