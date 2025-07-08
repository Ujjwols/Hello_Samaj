const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const rateLimit = require('express-rate-limit');


const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 submissions per IP
  message: 'Too many feedback submissions from this IP, please try again later.'
});

router.post('/submit-feedback', feedbackLimiter, feedbackController.submitFeedback);
router.get('/all-feedback',  feedbackController.getAllFeedback);

module.exports = router;