const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Create a signed token that identifies one user for a limited time.
function issueToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
}

async function register(req, res, next) {
  try {
    const email = req.body.email.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const user = await User.createWithPassword({ ...req.body, email });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token: issueToken(user)
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = req.body.email.toLowerCase();
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !(await user.verifyPassword(req.body.password))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token: issueToken(user)
    });
  } catch (error) {
    next(error);
  }
}

function profile(req, res) {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  });
}

module.exports = { register, login, profile };
