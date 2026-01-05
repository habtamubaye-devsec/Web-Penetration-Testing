const router = require('express').Router();
const scanModeController = require('../controllers/scanModeController');
const { validateUser, authorizeUser } = require('../middlewares/validateUser');

// Public/Auth routes
router.get('/', validateUser, scanModeController.getScanModes);

// Admin routes
router.get('/all', validateUser, authorizeUser('admin'), scanModeController.getAllScanModes);
router.post('/', validateUser, authorizeUser('admin'), scanModeController.createScanMode);
router.put('/:id', validateUser, authorizeUser('admin'), scanModeController.updateScanMode);
router.delete('/:id', validateUser, authorizeUser('admin'), scanModeController.deleteScanMode);

module.exports = router;
