const router = require("express").Router();
const userController = require("../controllers/userController");
const uploadProfileImage = require("../middlewares/uploadProfileImage");
const { validateUser, authorizeUser } = require("../middlewares/validateUser");

router.get("/", validateUser, authorizeUser('admin'), userController.getAllUsers);
router.get("/:id", validateUser, authorizeUser('admin', 'client'), userController.getUserById);

router.patch(
  '/update/:id',
  validateUser,
  authorizeUser('admin', 'client'),
  uploadProfileImage,
  userController.updateUser
);
router.delete('/delete/:id', validateUser, authorizeUser('admin'), userController.deleteUser);

router.post("/status", validateUser, authorizeUser('admin'), userController.toggleUserStatus);

router.post(
  "/change-password",
  validateUser,
  authorizeUser('admin', 'client'),
  userController.changePassword
);

module.exports = router;