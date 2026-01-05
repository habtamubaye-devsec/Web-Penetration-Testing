const ScanningTool = require('../models/ScanningTool');

exports.getScanningTools = async (req, res) => {
    try {
        const tools = await ScanningTool.find({ isActive: true });
        res.status(200).json({ status: 'success', data: tools });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getAllScanningTools = async (req, res) => {
    try {
        const tools = await ScanningTool.find();
        res.status(200).json({ status: 'success', data: tools });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.createScanningTool = async (req, res) => {
    try {
        const tool = await ScanningTool.create(req.body);
        res.status(201).json({ status: 'success', data: tool });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

exports.updateScanningTool = async (req, res) => {
    try {
        const tool = await ScanningTool.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!tool) {
            return res.status(404).json({ status: 'error', message: 'Scanning tool not found' });
        }
        res.status(200).json({ status: 'success', data: tool });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

exports.deleteScanningTool = async (req, res) => {
    try {
        const tool = await ScanningTool.findByIdAndDelete(req.params.id);
        if (!tool) {
            return res.status(404).json({ status: 'error', message: 'Scanning tool not found' });
        }
        res.status(200).json({ status: 'success', message: 'Scanning tool deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
