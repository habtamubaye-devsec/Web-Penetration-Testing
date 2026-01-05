const axios = require('axios');
const crypto = require('crypto');
const validator = require('validator');

const ScanReport = require('../models/ScanReport');
const ScanningTool = require('../models/ScanningTool');
const ScanMode = require('../models/ScanMode');

const normalizeToolType = (value) => String(value || '').trim();

// Keep this list in sync with Laravel's ScanRequest validation rules.
const SCANNER_CUSTOM_OPTION_KEYS = ['network', 'firewall', 'ssl', 'http', 'waf', 'headers'];

const getScannerBaseUrl = () => {
  return String(process.env.SCANNER_BASE_URL || 'https://api.pentester.pro.et').replace(/\/$/, '');
};

const generateScanId = () => {
  return crypto.randomUUID();
};

exports.submitScan = async (req, res) => {
  try {
    const { url, scan_mode_id, custom_tools } = req.body || {};
    console.log('Received scan submission:', req.body);
    const normalizedUrl = String(url || '').trim();

    if (!normalizedUrl) {
      return res.status(400).json({ status: 'failed', message: 'URL is required' });
    }

    if (!validator.isURL(normalizedUrl, { require_protocol: true, protocols: ['http', 'https'] })) {
      return res.status(400).json({ status: 'failed', message: 'Please provide a valid URL (include http/https)' });
    }

    const mode = await ScanMode.findById(scan_mode_id);
    if (!mode) {
      return res.status(400).json({ status: 'failed', message: 'Invalid scan mode selected' });
    }

    const scanId = generateScanId();
    const payload = {
      scan_id: scanId,
      url: normalizedUrl,
      scan_type: mode.scanType,
      callback_url: process.env.SCANNER_CALLBACK_URL || undefined,
    };

    if (mode.scanType === 'custom') {
      if (!custom_tools || !Array.isArray(custom_tools)) {
        return res.status(400).json({ status: 'failed', message: 'Custom tools are required for custom scan' });
      }

      const tools = await ScanningTool.find({ _id: { $in: custom_tools }, isActive: true });

      // Build explicit true/false flags using the scanner API's supported keys.
      // The selected tool IDs determine which flags become true.
      const customOptions = SCANNER_CUSTOM_OPTION_KEYS.reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});

      tools.forEach((tool) => {
        const key = normalizeToolType(tool.type);
        if (!key) return;
        if (SCANNER_CUSTOM_OPTION_KEYS.includes(key)) {
          customOptions[key] = true;
        }
      });

      customOptions.intensity = req.body.intensity || 'medium';
      payload.custom_options = customOptions;
    }

    const report = await ScanReport.create({
      user: req.user._id,
      url: normalizedUrl,
      scanType: mode.scanType,
      scanId,
      status: 'pending',
    });

    console.log(payload);

    const scannerBase = getScannerBaseUrl();

    try {
      const response = await axios.post(`${scannerBase}/api/v1/scan`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20_000,
      });

      report.status = response.data.status || 'queued';
      report.submitResponse = response.data;
      await report.save();

      return res.status(200).json({
        status: 'success',
        message: 'Scan submitted successfully',
        data: {
          report,
          scanner: response.data,
        },
      });
    } catch (err) {
      report.status = 'failed';
      report.errorMessage = err?.message || 'Failed to submit scan';
      report.submitResponse = err?.response?.data;
      await report.save();

      return res.status(502).json({
        status: 'error',
        message: 'Failed to submit scan to scanner service',
        error: err?.message,
      });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

exports.getScanStatus = async (req, res) => {
  try {
    const scanId = String(req.params.scanId || '').trim();
    if (!scanId) {
      return res.status(400).json({ status: 'failed', message: 'scanId is required' });
    }

    const report = await ScanReport.findOne({ scanId });
    if (!report) {
      return res.status(404).json({ status: 'failed', message: 'Scan report not found' });
    }

    const scannerBase = getScannerBaseUrl();
    const response = await axios.get(`${scannerBase}/api/v1/scan/status/${encodeURIComponent(scanId)}`, {
      timeout: 20_000,
    });

    report.status = response.data.status;
    report.statusResponse = response.data;
    await report.save();

    return res.status(200).json({ status: 'success', data: response.data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch scan status', error: err.message });
  }
};

exports.getScanResult = async (req, res) => {
  try {
    const scanId = String(req.params.scanId || '').trim();
    if (!scanId) {
      return res.status(400).json({ status: 'failed', message: 'scanId is required' });
    }

    const report = await ScanReport.findOne({ scanId });
    if (!report) {
      return res.status(404).json({ status: 'failed', message: 'Scan report not found' });
    }

    const scannerBase = getScannerBaseUrl();
    const response = await axios.get(`${scannerBase}/api/v1/scan/result/${encodeURIComponent(scanId)}`, {
      timeout: 20_000,
    });

    report.resultResponse = response.data;
    report.status = response.data.status || 'completed';
    if (report.status === 'completed') {
      report.completedAt = new Date();
    }
    await report.save();

    return res.status(200).json({ status: 'success', data: response.data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch scan result', error: err.message });
  }
};

exports.cancelScan = async (req, res) => {
  try {
    const scanId = String(req.params.scanId || '').trim();
    if (!scanId) {
      return res.status(400).json({ status: 'failed', message: 'scanId is required' });
    }

    const report = await ScanReport.findOne({ scanId });
    if (!report) {
      return res.status(404).json({ status: 'failed', message: 'Scan report not found' });
    }

    const scannerBase = getScannerBaseUrl();
    const response = await axios.post(`${scannerBase}/api/v1/scan/cancel/${encodeURIComponent(scanId)}`, {}, {
      timeout: 20_000,
    });

    report.status = 'cancelled';
    await report.save();

    return res.status(200).json({ status: 'success', data: response.data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to cancel scan', error: err.message });
  }
};

exports.getMyScanReports = async (req, res) => {
  try {
    const reports = await ScanReport.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: { reports } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch scan reports', error: err.message });
  }
};

exports.getScanReportById = async (req, res) => {
  try {
    const scanId = String(req.params.scanId || '').trim();
    if (!scanId) {
      return res.status(400).json({ status: 'failed', message: 'scanId is required' });
    }

    const report = await ScanReport.findOne({ scanId, user: req.user._id });
    if (!report) {
      return res.status(404).json({ status: 'failed', message: 'Scan report not found' });
    }

    return res.status(200).json({ status: 'success', data: { report } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch scan report', error: err.message });
  }
};

exports.getAllScanReports = async (req, res) => {
  try {
    const reports = await ScanReport.find({}).populate('user', 'name email role').sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: { reports } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch scan reports', error: err.message });
  }
};

exports.getScanReportsByUser = async (req, res) => {
  try {
    const userId = String(req.params.userId || '').trim();

    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ status: 'failed', message: 'Invalid userId' });
    }

    const reports = await ScanReport.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: { reports } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch user scan reports', error: err.message });
  }
};
