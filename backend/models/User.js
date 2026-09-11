const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailNotifications: {
      moodReminder: { type: Boolean, default: true },
      journalReminder: { type: Boolean, default: true },
      meditationReminder: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash email verification token
userSchema.methods.getVerificationToken = function () {
  // Generate random bytes token
  const unhashedToken = crypto.randomBytes(32).toString('hex');

  // Store hashed version in DB
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex');

  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return unhashedToken;
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate random bytes token
  const unhashedToken = crypto.randomBytes(32).toString('hex');

  // Store hashed version in DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex');

  // Token expires in 30 minutes
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;

  return unhashedToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
