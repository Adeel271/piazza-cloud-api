const mongoose = require('mongoose');

// Open one reusable Mongoose connection for the whole application.
async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured in the environment.');
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected successfully: ${mongoose.connection.host}`);
}

module.exports = connectDatabase;
