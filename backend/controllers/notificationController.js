const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');

// @desc    Get student notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Server error retrieving notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ message: 'Server error marking notification as read' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Server error marking all read' });
  }
};

// @desc    Get notification reminder settings
// @route   GET /api/notifications/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await NotificationSettings.create({
        userId: req.user._id,
        moodReminder: true,
        stressReminder: true,
        journalReminder: true,
        habitReminder: true,
        wellnessReminder: true,
        reminderTime: '20:00'
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error in getSettings:', error);
    res.status(500).json({ message: 'Server error retrieving notification settings' });
  }
};

// @desc    Update notification reminder settings
// @route   PUT /api/notifications/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { moodReminder, stressReminder, journalReminder, habitReminder, wellnessReminder, reminderTime } = req.body;

    let settings = await NotificationSettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = new NotificationSettings({ userId: req.user._id });
    }

    if (moodReminder !== undefined) settings.moodReminder = moodReminder;
    if (stressReminder !== undefined) settings.stressReminder = stressReminder;
    if (journalReminder !== undefined) settings.journalReminder = journalReminder;
    if (habitReminder !== undefined) settings.habitReminder = habitReminder;
    if (wellnessReminder !== undefined) settings.wellnessReminder = wellnessReminder;
    if (reminderTime) settings.reminderTime = reminderTime;

    const updated = await settings.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ message: 'Server error updating notification settings' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getSettings,
  updateSettings
};
