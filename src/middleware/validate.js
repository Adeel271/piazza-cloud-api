const { validationResult } = require('express-validator');

// Return all validation problems in one clear response.
function validate(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed.',
      details: result.array()
    });
  }

  next();
}

module.exports = validate;
