const express = require("express");
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
  deleteUserController,
  getCurrentUser,
} = require("../controllers/userController");
const verifyJWT = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const upload = require("../middleware/multer");
const ApiResponse = require("../utils/ApiResponse");

const router = express.Router();

// Public routes
router.post(
  "/register",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "additionalFile", maxCount: 1 },
  ]),
  registerUserController
);
router.post("/send-otp", sendOTPVerificationLogin);
router.post("/verify-otp", verifyUserOTPLogin);
router.post("/admin/send-otp", sendAdminOTPVerificationLogin);
router.post("/admin/verify-otp",verifyAdminUserOTPLogin);

// Protected routes
router.post("/logout", verifyJWT, logoutUserController);

router.get("/check-auth", verifyJWT, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "No authenticated user found",
      statusCode: 401,
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User is authenticated"));
});

// Admin-only routes (super_admin only for user management)
router.get("/get-all-users", verifyJWT, verifyAdmin, getAllUsersController);
router.delete("/delete-user/:id", verifyJWT, verifyAdmin, deleteUserController);

// Authenticated user routes
router.get("/get-user/:id", verifyJWT, getUserByIdController);
router.patch(
  "/update-user/:id",
  verifyJWT,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "additionalFile", maxCount: 1 },
  ]),
  updateUserController
);

router.get("/current-user", verifyJWT, getCurrentUser);

module.exports = router;