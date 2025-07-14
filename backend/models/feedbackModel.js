const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['feedback', 'suggestion', 'bug', 'improvement'],
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  email: {
    type: String,
    trim: true,
    default: null,
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  ward: {
    type: String,
    trim: true,
    default: null, // Optional, as not all feedback may be ward-specific
  },
  status: {
    type: String,
    enum: ['new', 'reviewed'],
    default: 'new',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);