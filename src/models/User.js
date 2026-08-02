const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// This schema describes the documents stored in the users collection.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    // select:false stops the password hash appearing in normal database queries.
    passwordHash: {
      type: String,
      required: true,
      select: false
    }
  },
  { timestamps: true }
);

// Compare a login password with the stored bcrypt hash.
userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Keep password hashing inside the model so controllers stay easy to read.
userSchema.statics.createWithPassword = async function createWithPassword({
  name,
  email,
  password
}) {
  const passwordHash = await bcrypt.hash(password, 12);
  return this.create({ name, email, passwordHash });
};

module.exports = mongoose.model('User', userSchema);
