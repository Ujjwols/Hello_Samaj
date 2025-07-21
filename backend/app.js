const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

dotenv.config();

const app = express();

// Define allowed origins with fallback
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  process.env.USER_CORS_ORIGIN || 'http://localhost:5173',
].filter(Boolean);

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Request origin:', origin); // Log origin for debugging
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.error(`CORS error: Origin ${origin} not allowed`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS','PUT'],
  })
);

// Log response headers for debugging
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('Response headers:', res.getHeaders());
  });
  next();
});

// Parse JSON bodies
app.use(express.json({ limit: '16kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve static files
app.use(express.static('public'));

// Parse cookies
app.use(cookieParser());

// Routers
const userRouter = require('./routes/userRoutes');
const complainRouter = require('./routes/complainRoutes');
const feedbackRouter = require('./routes/feedbackRoutes');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/complaints', complainRouter);
app.use('/api/v1/feedbacks', feedbackRouter);



// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error('Error in request:', err);
  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

module.exports = app;