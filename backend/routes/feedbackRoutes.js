const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const rateLimit = require('express-rate-limit');
const verifyJWT = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/verifyAdmin');

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 submissions per IP
  message: 'Too many feedback submissions from this IP, please try again later.',
});

router.post('/submit-feedback', feedbackLimiter, feedbackController.submitFeedback);
router.get('/all-feedback', verifyJWT, verifyAdmin, feedbackController.getAllFeedback);
router.get('/feedback/:id', verifyJWT, verifyAdmin, feedbackController.getFeedbackById);
router.patch('/feedback/:id/review', verifyJWT, verifyAdmin, feedbackController.markFeedbackReviewed);

module.exports = router;