const express = require("express");
const router = express.Router();
const {
  registerUserController,
  sendOTPVerificationLogin,
  verifyUserOTPLogin,
  sendAdminOTPVerificationLogin,
  verifyAdminUserOTPLogin,
  logoutUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  refreshTokenController,
} = require("../controllers/userController");
const  verifyJWT  = require("../middleware/authMiddleware");
const  upload  = require("../middleware/multer");

router.route("/register").post(
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "additionalFile", maxCount: 1 },
  ]),
  registerUserController
);

router.route("/send-otp").post(sendOTPVerificationLogin);
router.route("/verify-otp").post(verifyUserOTPLogin);
router.route("/admin/send-otp").post(sendAdminOTPVerificationLogin);
router.route("/admin/verify-otp").post(verifyAdminUserOTPLogin);
router.route("/logout").post(verifyJWT, logoutUserController);
router.route("/refresh-token").post(refreshTokenController);
router.route("/get-all-users").get(verifyJWT, getAllUsersController);
router.route("/get-user/:id").get(verifyJWT, getUserByIdController);
router.route("/upadte-user/:id").patch(
  verifyJWT,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "additionalFile", maxCount: 1 },
  ]),
  updateUserController
);

module.exports = router;