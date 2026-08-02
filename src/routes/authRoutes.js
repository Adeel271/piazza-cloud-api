const router = require('express').Router();
const { body } = require('express-validator');

const { register, login, profile } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

// Public registration route with server-side validation.
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8, max: 72 })
  ],
  validate,
  register
);

// Public login route. A successful response contains a JWT.
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  login
);

// This route demonstrates that the JWT middleware protects resources.
router.get('/profile', authenticate, profile);

module.exports = router;
