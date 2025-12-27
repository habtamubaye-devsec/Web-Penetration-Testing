const router = require('express').Router()
const adminController = require('../controllers/adminController')
const { validateUser, authorizeUser } = require('../middlewares/validateUser')

router.get('/', validateUser, authorizeUser('admin'), adminController.getAllAdmins);
router.get('/:id', validateUser, authorizeUser('admin'), adminController.getAdminById);

module.exports = router