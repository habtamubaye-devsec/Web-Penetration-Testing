const mongoose = require('mongoose');

const ScanningToolSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        type: { type: String, required: true }, // e.g., 'ssl', 'http', 'waf', 'network', 'nse'
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ScanningTool', ScanningToolSchema);
