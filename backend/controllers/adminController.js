const User = require('../models/User');
const WellnessTip = require('../models/WellnessTip');
const WellnessResource = require('../models/WellnessResource');
const MeditationResource = require('../models/MeditationResource');
const StressAssessment = require('../models/StressAssessment');
const MoodEntry = require('../models/MoodEntry');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private / Admin
const getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalTips, totalResources, totalMeditation, totalAssessments, totalMoodEntries] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        WellnessTip.countDocuments(),
        WellnessResource.countDocuments(),
        MeditationResource.countDocuments(),
        StressAssessment.countDocuments(),
        MoodEntry.countDocuments()
      ]);

    res.json({
      totalStudents,
      totalTips,
      totalResources,
      totalMeditation,
      totalAssessments,
      totalMoodEntries
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ message: 'Server error retrieving admin statistics' });
  }
};

// @desc    Get student users list (excluding passwords and private data)
// @route   GET /api/admin/users
// @access  Private / Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @desc    Toggle student account active status
// @route   PUT /api/admin/users/:id/status
// @access  Private / Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin' && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate your own admin account' });
    }

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    res.json({ message: `User status updated to ${user.isActive ? 'Active' : 'Inactive'}`, user });
  } catch (error) {
    console.error('Error in toggleUserStatus:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

// --- Wellness Tips CRUD ---

// @desc    Create new wellness tip
// @route   POST /api/admin/tips
// @access  Private / Admin
const createTip = async (req, res) => {
  try {
    const { title, description, category, condition, active } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const tip = await WellnessTip.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Mindfulness',
      condition: condition || 'general',
      active: active !== undefined ? active : true
    });

    res.status(201).json(tip);
  } catch (error) {
    console.error('Error in createTip:', error);
    res.status(500).json({ message: error.message || 'Server error creating wellness tip' });
  }
};

// @desc    Update wellness tip
// @route   PUT /api/admin/tips/:id
// @access  Private / Admin
const updateTip = async (req, res) => {
  try {
    const tip = await WellnessTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ message: 'Wellness tip not found' });
    }

    const { title, description, category, condition, active } = req.body;
    if (title) tip.title = title.trim();
    if (description) tip.description = description.trim();
    if (category) tip.category = category;
    if (condition) tip.condition = condition;
    if (active !== undefined) tip.active = active;

    const updated = await tip.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateTip:', error);
    res.status(500).json({ message: error.message || 'Server error updating tip' });
  }
};

// @desc    Delete wellness tip
// @route   DELETE /api/admin/tips/:id
// @access  Private / Admin
const deleteTip = async (req, res) => {
  try {
    const tip = await WellnessTip.findByIdAndDelete(req.params.id);
    if (!tip) {
      return res.status(404).json({ message: 'Wellness tip not found' });
    }
    res.json({ message: 'Wellness tip deleted', id: req.params.id });
  } catch (error) {
    console.error('Error in deleteTip:', error);
    res.status(500).json({ message: 'Server error deleting tip' });
  }
};

// --- Wellness Resources CRUD ---

// @desc    Create new wellness resource
// @route   POST /api/admin/resources
// @access  Private / Admin
const createResource = async (req, res) => {
  try {
    const { title, description, category, url, icon, active } = req.body;
    if (!title || !description || !category || !url) {
      return res.status(400).json({ message: 'All required resource fields must be provided' });
    }

    const resource = await WellnessResource.create({
      title: title.trim(),
      description: description.trim(),
      category,
      url: url.trim(),
      icon: icon || '📚',
      active: active !== undefined ? active : true
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error in createResource:', error);
    res.status(500).json({ message: error.message || 'Server error creating resource' });
  }
};

// @desc    Update wellness resource
// @route   PUT /api/admin/resources/:id
// @access  Private / Admin
const updateResource = async (req, res) => {
  try {
    const resource = await WellnessResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const { title, description, category, url, icon, active } = req.body;
    if (title) resource.title = title.trim();
    if (description) resource.description = description.trim();
    if (category) resource.category = category;
    if (url) resource.url = url.trim();
    if (icon) resource.icon = icon;
    if (active !== undefined) resource.active = active;

    const updated = await resource.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateResource:', error);
    res.status(500).json({ message: error.message || 'Server error updating resource' });
  }
};

// @desc    Delete wellness resource
// @route   DELETE /api/admin/resources/:id
// @access  Private / Admin
const deleteResource = async (req, res) => {
  try {
    const resource = await WellnessResource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted', id: req.params.id });
  } catch (error) {
    console.error('Error in deleteResource:', error);
    res.status(500).json({ message: 'Server error deleting resource' });
  }
};

// --- Meditation Resources CRUD ---

// @desc    Create meditation resource
// @route   POST /api/admin/meditation
// @access  Private / Admin
const createMeditation = async (req, res) => {
  try {
    const { title, description, category, duration, url, active } = req.body;
    if (!title || !description || !url) {
      return res.status(400).json({ message: 'Title, description and link URL are required' });
    }

    const guide = await MeditationResource.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Breathing',
      duration: duration || 5,
      url: url.trim(),
      active: active !== undefined ? active : true
    });

    res.status(201).json(guide);
  } catch (error) {
    console.error('Error in createMeditation:', error);
    res.status(500).json({ message: error.message || 'Server error creating meditation guide' });
  }
};

// @desc    Update meditation resource
// @route   PUT /api/admin/meditation/:id
// @access  Private / Admin
const updateMeditation = async (req, res) => {
  try {
    const guide = await MeditationResource.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Meditation guide not found' });
    }

    const { title, description, category, duration, url, active } = req.body;
    if (title) guide.title = title.trim();
    if (description) guide.description = description.trim();
    if (category) guide.category = category;
    if (duration !== undefined) guide.duration = duration;
    if (url) guide.url = url.trim();
    if (active !== undefined) guide.active = active;

    const updated = await guide.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateMeditation:', error);
    res.status(500).json({ message: error.message || 'Server error updating meditation guide' });
  }
};

// @desc    Delete meditation resource
// @route   DELETE /api/admin/meditation/:id
// @access  Private / Admin
const deleteMeditation = async (req, res) => {
  try {
    const guide = await MeditationResource.findByIdAndDelete(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Meditation guide not found' });
    }
    res.json({ message: 'Meditation guide deleted', id: req.params.id });
  } catch (error) {
    console.error('Error in deleteMeditation:', error);
    res.status(500).json({ message: 'Server error deleting meditation guide' });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  createTip,
  updateTip,
  deleteTip,
  createResource,
  updateResource,
  deleteResource,
  createMeditation,
  updateMeditation,
  deleteMeditation
};
