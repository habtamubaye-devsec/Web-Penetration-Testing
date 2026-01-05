const router = require('express').Router();
const scanningToolController = require('../controllers/scanningToolController');
const { validateUser, authorizeUser } = require('../middlewares/validateUser');

// Public/Auth routes
router.get('/', validateUser, scanningToolController.getScanningTools);

// Admin routes
router.get('/all', validateUser, authorizeUser('admin'), scanningToolController.getAllScanningTools);
router.post('/', validateUser, authorizeUser('admin'), scanningToolController.createScanningTool);
router.put('/:id', validateUser, authorizeUser('admin'), scanningToolController.updateScanningTool);
router.delete('/:id', validateUser, authorizeUser('admin'), scanningToolController.deleteScanningTool);

module.exports = router;
