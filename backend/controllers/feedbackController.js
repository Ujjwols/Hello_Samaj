const Feedback = require('../models/feedbackModel');
const sendEmail = require('../utils/sendEmail');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler'); // Assuming you have this utility

// Submit feedback
const submitFeedback = asyncHandler(async (req, res, next) => {
  const { type, subject, message, email, anonymous, ward } = req.body;

  // Validate input
  if (!type || !subject || !message) {
    throw new ApiError(400, 'Type, subject, and message are required');
  }

  // Validate email if not anonymous
  if (!anonymous && !email) {
    throw new ApiError(400, 'Email is required for non-anonymous feedback');
  }
  if (!anonymous && email && !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, 'Invalid email address');
  }

  // Save to database
  const feedback = await Feedback.create({
    type,
    subject: subject.substring(0, 100),
    message: message.substring(0, 2000),
    email: anonymous ? null : email,
    anonymous,
    ward: ward || null, // Optional ward field
    status: 'new',
  });

  // Send notification email to admin
  await sendEmail({
    to: process.env.FEEDBACK_RECEIVER_EMAIL,
    subject: `[Feedback] ${subject}`,
    text: `Type: ${type}\nSubject: ${subject}\nMessage: ${message}\n${!anonymous && email ? `From: ${email}` : 'Submitted anonymously'}${ward ? `\nWard: ${ward}` : ''}`,
    html: `
      <h2>New Feedback Submission</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <p>${!anonymous && email ? `<strong>From:</strong> ${email}` : 'Submitted anonymously'}</p>
      ${ward ? `<p><strong>Ward:</strong> ${ward}</p>` : ''}
    `,
  });

  // Send confirmation email to user (if not anonymous)
  if (!anonymous && email) {
    await sendEmail({
      to: email,
      subject: 'Thank You for Your Feedback - Hello Samaj',
      text: `Dear User,\n\nThank you for submitting your ${type} with the subject "${subject}". We have received your feedback and will review it soon.\n\nBest regards,\nHello Samaj Team`,
      html: `
        <h2>Thank You for Your Feedback</h2>
        <p>Dear User,</p>
        <p>Thank you for submitting your <strong>${type}</strong> with the subject "<strong>${subject}</strong>".</p>
        <p>We have received your feedback and our team will review it soon.</p>
        <p>Best regards,<br>Hello Samaj Team</p>
      `,
    });
  }

  res.status(201).json({
    success: true,
    data: feedback,
  });
});

// Get all feedback (with access control)
const getAllFeedback = asyncHandler(async (req, res, next) => {
  if (!req.user || !['super_admin', 'ward_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'Only super admins and ward admins can access feedback');
  }

  let query = {};
  if (req.user.role === 'ward_admin' && req.user.assignedWards) {
    query = { ward: { $in: req.user.assignedWards } };
  }

  const feedback = await Feedback.find(query).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: feedback,
  });
});

// Get feedback by ID
const getFeedbackById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid feedback ID');
  }

  if (!req.user || !['super_admin', 'ward_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'Only super admins and ward admins can access feedback');
  }

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  // Ward admin access control
  if (req.user.role === 'ward_admin' && req.user.assignedWards) {
    if (feedback.ward && !req.user.assignedWards.includes(feedback.ward)) {
      throw new ApiError(403, 'You are not authorized to view this feedback');
    }
  }

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

// Mark feedback as reviewed
const markFeedbackReviewed = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid feedback ID');
  }

  if (!req.user || !['super_admin', 'ward_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'Only super admins and ward admins can update feedback');
  }

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw new ApiError(404, 'Feedback not found');
  }

  // Ward admin access control
  if (req.user.role === 'ward_admin' && req.user.assignedWards) {
    if (feedback.ward && !req.user.assignedWards.includes(feedback.ward)) {
      throw new ApiError(403, 'You are not authorized to update this feedback');
    }
  }

  feedback.status = 'reviewed';
  await feedback.save();

  res.status(200).json({
    success: true,
    data: feedback,
    message: 'Feedback marked as reviewed',
  });
});

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  markFeedbackReviewed,
};