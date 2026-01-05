const ScanMode = require('../models/ScanMode');

exports.getScanModes = async (req, res) => {
    try {
        const modes = await ScanMode.find({ isActive: true }).populate('tools');
        res.status(200).json({ status: 'success', data: modes });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getAllScanModes = async (req, res) => {
    try {
        const modes = await ScanMode.find().populate('tools');
        res.status(200).json({ status: 'success', data: modes });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.createScanMode = async (req, res) => {
    try {
        const mode = await ScanMode.create(req.body);
        res.status(201).json({ status: 'success', data: mode });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

exports.updateScanMode = async (req, res) => {
    try {
        const mode = await ScanMode.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!mode) {
            return res.status(404).json({ status: 'error', message: 'Scan mode not found' });
        }
        res.status(200).json({ status: 'success', data: mode });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

exports.deleteScanMode = async (req, res) => {
    try {
        const mode = await ScanMode.findByIdAndDelete(req.params.id);
        if (!mode) {
            return res.status(404).json({ status: 'error', message: 'Scan mode not found' });
        }
        res.status(200).json({ status: 'success', message: 'Scan mode deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
