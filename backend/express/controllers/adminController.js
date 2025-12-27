const Admin = require('../models/Admin');

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ role: 'admin'});
        if (!admins){
            res.status(400).json({
                status: 'failed',
                message: "there are no admins"
            })
        }

        res.status(200).json({
            status: 'success',
            message: 'All admins fetched successfully',
            admins
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'failed',
            message: "Internal Server Error" + err.message
        })
    }
}


exports.getAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findById(id).select('-password');
        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                message: 'Admin not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Admin fetched successfully',
            admin
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Error fetching admin' + err.message
        });
    }
}