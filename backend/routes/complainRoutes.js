const express = require("express");
const upload = require("../middleware/multer");
const verifyJwt = require("../middleware/authMiddleware");
const {
  createComplaintController,
  getAllComplaintsController,
  getComplaintController,
  updateComplaintController,
  deleteComplaintController,
  deleteComplaintFileController,
} = require("../controllers/complainController");

const router = express.Router();

// Public routes (accessible to all users)
router.post("/create-complaint", upload.array("files", 10), createComplaintController);
router.get("/get-all-complaints", getAllComplaintsController);
router.get("/get-complaint/:id", getComplaintController);

// Admin-only routes
router.put("/update-complaint/:id", verifyJwt,  upload.array("files", 10), updateComplaintController);
router.delete("/delete-complaint/:id", verifyJwt,  deleteComplaintController);
router.delete("/delete-complaint-file/:id/:fileUrl", verifyJwt, deleteComplaintFileController);

module.exports = router;