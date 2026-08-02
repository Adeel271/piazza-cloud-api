// Handle requests that do not match any endpoint.
function notFound(req, res) {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

// Keep unexpected errors in one place instead of repeating try/catch responses.
function errorHandler(error, req, res, next) {
  console.error(error);

  // MongoDB uses error code 11000 for duplicate unique values.
  if (error.code === 11000) {
    return res.status(409).json({
      error: 'A record with that value already exists.'
    });
  }

  res.status(error.status || 500).json({
    error: error.message || 'Unexpected server error.'
  });
}

module.exports = { notFound, errorHandler };
