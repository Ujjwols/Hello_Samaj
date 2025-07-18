
const ApiError = require("./ApiError");
const asyncHandler = require("./asyncHandler");
const nodemailer = require("nodemailer");

const sendEmail = asyncHandler(async ({ to, subject, text, html }) => {
  try {
    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || subject,
      html: html || text || subject,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Nodemailer Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new ApiError(500, `Email sending failed: ${error.message}`);
  }
});

module.exports = sendEmail;
