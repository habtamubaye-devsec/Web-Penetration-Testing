const mongoose = require('mongoose');

const ScanModeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        estimatedTime: { type: String },
        scanType: {
            type: String,
            required: true,
            enum: ['full', 'fast', 'custom']
        },
        isActive: { type: Boolean, default: true },
        tools: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ScanningTool'
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model('ScanMode', ScanModeSchema);
