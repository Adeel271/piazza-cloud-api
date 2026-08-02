// Load values from the private .env file before the application starts.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// Add common security-related HTTP headers.
app.use(helmet());

// Allow tools such as Postman and a future front end to call the API.
app.use(cors());

// Read JSON request bodies and apply a sensible size limit.
app.use(express.json({ limit: '100kb' }));

// Print a short line in the terminal for each request during development.
app.use(morgan('dev'));

// A simple public endpoint used by Docker and Kubernetes health checks.
app.get('/health', (req, res) => {
  res.json({
    service: 'Piazza Cloud API',
    status: 'ok',
    time: new Date().toISOString()
  });
});

// Group related endpoints under clear REST-style paths.
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// These must remain last so that valid routes run before error handling.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
