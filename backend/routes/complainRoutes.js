const express = require("express");
const {
  createComplaintController,
  getAllComplaintsController,
  getComplaintController,
  updateComplaintController,
  deleteComplaintController,
  deleteComplaintFileController,
  upvoteComplaint,
} = require("../controllers/complainController");
const verifyJwt = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const router = express.Router();

// Allow unauthenticated access for anonymous complaints
router.post(
  "/create-complaint",
  upload.array("files", 10), // Must come first to populate req.body
  (req, res, next) => {
    if (req.body.isAnonymous === "true" || req.body.isAnonymous === true) {
      return next(); // Allow anonymous submission
    }
    verifyJwt(req, res, next); // Require auth for non-anonymous
  },
  createComplaintController
);

router.get("/get-all-complaints", getAllComplaintsController);
router.get("/get-complaint/:id", getComplaintController);
router.put("/update-complaint/:id", verifyJwt, upload.array("files", 10), updateComplaintController);
router.delete("/delete-complaint/:id", verifyJwt, deleteComplaintController);
router.delete("/delete-file/:id/:fileUrl", verifyJwt, deleteComplaintFileController);
router.post("/upvote/:id", upvoteComplaint);

module.exports = router;