const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    moodReminder: {
      type: Boolean,
      default: true
    },
    stressReminder: {
      type: Boolean,
      default: true
    },
    journalReminder: {
      type: Boolean,
      default: true
    },
    habitReminder: {
      type: Boolean,
      default: true
    },
    wellnessReminder: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String, // HH:MM
      default: '20:00'
    }
  },
  {
    timestamps: true
  }
);

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;
