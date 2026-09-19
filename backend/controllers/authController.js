const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
} = require('../services/emailService');

// ─── PHASE 3: Register (with email verification) ──────────────────────────────
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'A student account with this email already exists' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password, role: 'student' });

    // Generate verification token and save
    const unhashedToken = user.getVerificationToken();
    await user.save();

    // Send verification email (falls back to console log if SMTP not configured)
    const origin = req.get('origin');
    await sendVerificationEmail(user.email, user.name, unhashedToken, origin);

    res.status(201).json({
      message: 'Account created! Please check your email inbox to verify your account before logging in.',
      emailVerificationSent: true,
      email: user.email
    });
  } catch (error) {
    console.error('[Register Controller Error]:', error);
    res.status(500).json({ message: error.message || 'Error creating account' });
  }
};

// ─── Login (checks emailVerified) ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block login if email not verified
    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        emailNotVerified: true,
        email: user.email
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      emailNotifications: user.emailNotifications,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('[Login Controller Error]:', error);
    res.status(500).json({ message: error.message || 'Error logging in' });
  }
};

// ─── PHASE 3: Verify Email ─────────────────────────────────────────────────────
// @route   GET /api/auth/verify-email?token=TOKEN
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is missing' });
    }

    // Hash incoming token to match stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Your verification link is invalid or has expired. Please request a new verification email.',
        tokenExpired: true
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'This email address has already been verified. Please login.' });
    }

    // Mark as verified and clear token
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    const origin = req.get('origin');
    await sendWelcomeEmail(user.email, user.name, origin);

    res.json({ message: 'Email verified successfully! Your Mind Care account is now active.', verified: true });
  } catch (error) {
    console.error('[Verify Email Error]:', error);
    res.status(500).json({ message: error.message || 'Email verification failed' });
  }
};

// ─── PHASE 4: Resend Verification Email ───────────────────────────────────────
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Generic response if not found
    if (!user) {
      return res.json({ message: 'If this email is registered and unverified, a new verification link has been sent.' });
    }

    // Explicit notification if account is already verified
    if (user.emailVerified) {
      return res.json({
        message: 'This student account has already been verified! You can log in directly.',
        alreadyVerified: true
      });
    }

    // Rate limiting: 60-second cooldown between resends
    const ONE_MINUTE = 60 * 1000;
    if (user.emailVerificationExpires && (user.emailVerificationExpires - Date.now()) > (24 * 60 * 60 * 1000 - ONE_MINUTE)) {
      return res.status(429).json({ message: 'A verification email was recently sent. Please wait a minute before requesting another.' });
    }

    const unhashedToken = user.getVerificationToken();
    await user.save();

    const origin = req.get('origin');
    await sendVerificationEmail(user.email, user.name, unhashedToken, origin);

    res.json({
      message: 'A new verification link has been sent to your email. Please check your inbox and spam folder.',
      sent: true
    });
  } catch (error) {
    console.error('[Resend Verification Error]:', error);
    res.status(500).json({ message: 'We could not send the email right now. Please try again later.' });
  }
};

// ─── PHASE 5: Forgot Password ──────────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return generic response to prevent account enumeration
    const genericResponse = {
      message: 'If this email is registered, a password reset link has been sent to your inbox. Please check your spam folder as well.',
      sent: true
    };

    if (!user) {
      return res.json(genericResponse);
    }

    const unhashedToken = user.getResetPasswordToken();
    await user.save();

    const origin = req.get('origin');
    await sendPasswordResetEmail(user.email, user.name, unhashedToken, origin);

    res.json(genericResponse);
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    res.status(500).json({ message: 'We could not send the reset email right now. Please try again later.' });
  }
};

// ─── PHASE 6: Reset Password ───────────────────────────────────────────────────
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Token, new password and confirm password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Your password reset link is invalid or has expired. Please request a new one.',
        tokenExpired: true
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    res.status(500).json({ message: error.message || 'Error resetting password' });
  }
};

// ─── Get current user profile ─────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
};

// ─── Update user profile ──────────────────────────────────────────────────────
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    if (req.body.email) user.email = req.body.email.toLowerCase();
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      emailNotifications: updatedUser.emailNotifications,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};

// ─── PHASE 7: Change Password ─────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error changing password' });
  }
};

// ─── Email Notification Settings ─────────────────────────────────────────────
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('emailNotifications');
    res.json({ emailNotifications: user.emailNotifications });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching settings' });
  }
};

// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { emailNotifications } = req.body;
    const user = await User.findById(req.user._id);
    if (emailNotifications) {
      user.emailNotifications = { ...user.emailNotifications, ...emailNotifications };
    }
    await user.save();
    res.json({ message: 'Settings updated successfully', emailNotifications: user.emailNotifications });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating settings' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateUserProfile,
  changePassword,
  getSettings,
  updateSettings
};
