const router = require('express').Router();
const scanReportController = require('../controllers/scanReportController');
const { validateUser, authorizeUser } = require('../middlewares/validateUser');

// Submit a new scan
router.post('/', validateUser, authorizeUser('admin', 'client'), scanReportController.submitScan);

// List scan reports for current user
router.get('/', validateUser, authorizeUser('admin', 'client'), scanReportController.getMyScanReports);

// Admin: list all scan reports
router.get('/admin/all', validateUser, authorizeUser('admin'), scanReportController.getAllScanReports);

// Admin: list scan reports by user id
router.get('/admin/user/:userId', validateUser, authorizeUser('admin'), scanReportController.getScanReportsByUser);

// Proxy scanner status/result (also stored on the ScanReport)
router.get('/status/:scanId', validateUser, authorizeUser('admin', 'client'), scanReportController.getScanStatus);
router.get('/result/:scanId', validateUser, authorizeUser('admin', 'client'), scanReportController.getScanResult);

// Get one scan report document
router.get('/:scanId', validateUser, authorizeUser('admin', 'client'), scanReportController.getScanReportById);

module.exports = router;
