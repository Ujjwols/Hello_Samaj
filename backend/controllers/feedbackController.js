const Feedback = require('../models/feedbackModel');
const sendEmail = require('../utils/sendEmail');
const ApiError = require('../utils/ApiError');

exports.submitFeedback = async (req, res, next) => {
  try {
    const { type, subject, message, email, anonymous } = req.body;

    // Validate input
    if (!type || !subject || !message) {
      return next(new ApiError(400, 'Type, subject, and message are required'));
    }

    // Validate email if not anonymous
    if (!anonymous && !email) {
      return next(new ApiError(400, 'Email is required for non-anonymous feedback'));
    }
    if (!anonymous && email && !/^\S+@\S+\.\S+$/.test(email)) {
      return next(new ApiError(400, 'Invalid email address'));
    }

    // Save to database
    const feedback = await Feedback.create({
      type,
      subject: subject.substring(0, 100),
      message: message.substring(0, 2000),
      email: anonymous ? null : email,
      anonymous
    });

    // Send notification email to admin
    await sendEmail({
      to: process.env.FEEDBACK_RECEIVER_EMAIL, // hellosamaj@gmail.com
      subject: `[Feedback] ${subject}`,
      text: `Type: ${type}\nSubject: ${subject}\nMessage: ${message}\n${!anonymous && email ? `From: ${email}` : 'Submitted anonymously'}`,
      html: `
        <h2>New Feedback Submission</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>${!anonymous && email ? `<strong>From:</strong> ${email}` : 'Submitted anonymously'}</p>
      `
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
        `
      });
    }

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(new ApiError(500, `Failed to submit feedback: ${error.message}`));
  }
};

// New function for admin dashboard
exports.getAllFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(new ApiError(500, `Failed to fetch feedback: ${error.message}`));
  }
};