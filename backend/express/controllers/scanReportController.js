const axios = require('axios');
const crypto = require('crypto');
const validator = require('validator');

const ScanReport = require('../models/ScanReport');

const getScannerBaseUrl = () => {
  return String(process.env.SCANNER_BASE_URL || 'http://192.168.216.2:8000').replace(/\/$/, '');
};

const generateScanId = () => {
  // Short, URL-safe scan id
  return `scan_${crypto.randomBytes(12).toString('hex')}`;
};

exports.submitScan = async (req, res) => {
  try {
    const { url, scan_type } = req.body || {};
    const scanType = String(scan_type || 'full').trim() || 'full';
    const normalizedUrl = String(url || '').trim();

    if (!normalizedUrl) {
      return res.status(400).json({ status: 'failed', message: 'URL is required' });
    }

    // Accept http(s) URLs only
    if (!validator.isURL(normalizedUrl, { require_protocol: true, protocols: ['http', 'https'] })) {
      return res.status(400).json({ status: 'failed', message: 'Please provide a valid URL (include http/https)' });
    }

    const scanId = generateScanId();
    const report = await ScanReport.create({
      user: req.user._id,
      url: normalizedUrl,
      scanType,
      scanId,
      status: 'pending',
    });

    const payload = {
      url: normalizedUrl,
      scan_type: scanType,
      scan_id: scanId,
      callback_url: process.env.SCANNER_CALLBACK_URL || undefined,
    };

    const scannerBase = getScannerBaseUrl();

    try {
      const response = await axios.post(`${scannerBase}/api/scan`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20_000,
      });

      report.status = 'in-progress';
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

    const report = await ScanReport.findOne({ scanId, user: req.user._id });
    if (!report) {
      return res.status(404).json({ status: 'failed', message: 'Scan report not found' });
    }

    const scannerBase = getScannerBaseUrl();
    const response = await axios.get(`${scannerBase}/api/scan/status/${encodeURIComponent(scanId)}`, {
      timeout: 20_000,
    });

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

    const report = await ScanReport.findOne({ scanId, user: req.user._id });
    if (!report) {
      return res.status(404).json({ status: 'failed', message: 'Scan report not found' });
    }

    const scannerBase = getScannerBaseUrl();
    const response = await axios.get(`${scannerBase}/api/scan/result/${encodeURIComponent(scanId)}`, {
      timeout: 20_000,
    });

    report.resultResponse = response.data;
    report.status = 'completed';
    report.completedAt = new Date();
    await report.save();

    return res.status(200).json({ status: 'success', data: response.data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch scan result', error: err.message });
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
