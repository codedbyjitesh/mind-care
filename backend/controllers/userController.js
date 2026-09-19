const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error retrieving user profile' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name !== undefined) user.name = req.body.name.trim();
    if (req.body.bio !== undefined) user.bio = req.body.bio.trim();
    if (req.body.studentId !== undefined) user.studentId = req.body.studentId.trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone.trim();
    if (req.body.emailNotifications) {
      user.emailNotifications = {
        ...user.emailNotifications,
        ...req.body.emailNotifications
      };
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      studentId: updatedUser.studentId,
      phone: updatedUser.phone,
      emailNotifications: updatedUser.emailNotifications,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Server error updating user profile' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
