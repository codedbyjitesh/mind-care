const cron = require('node-cron');
const User = require('../models/User');
const { sendWellnessReminderEmail } = require('../services/emailService');

// Track if scheduler is already running (prevents duplicate jobs on restart)
let schedulerStarted = false;

const startScheduler = () => {
  if (schedulerStarted) {
    console.log('[Scheduler] Already running. Skipping duplicate start.');
    return;
  }
  schedulerStarted = true;

  // ── Daily Mood Reminder: 9:00 AM every day ─────────────────────────────────
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Running daily mood reminder...');
    try {
      const users = await User.find({
        emailVerified: true,
        'emailNotifications.moodReminder': true
      }).select('email name');

      let sent = 0;
      for (const user of users) {
        await sendWellnessReminderEmail(user.email, user.name, 'mood');
        sent++;
      }
      console.log(`[Scheduler] Mood reminders sent to ${sent} student(s).`);
    } catch (err) {
      console.error('[Scheduler] Mood reminder error:', err.message);
    }
  });

  // ── Daily Journal Reminder: 8:00 PM every day ──────────────────────────────
  cron.schedule('0 20 * * *', async () => {
    console.log('[Scheduler] Running daily journal reminder...');
    try {
      const users = await User.find({
        emailVerified: true,
        'emailNotifications.journalReminder': true
      }).select('email name');

      let sent = 0;
      for (const user of users) {
        await sendWellnessReminderEmail(user.email, user.name, 'journal');
        sent++;
      }
      console.log(`[Scheduler] Journal reminders sent to ${sent} student(s).`);
    } catch (err) {
      console.error('[Scheduler] Journal reminder error:', err.message);
    }
  });

  // ── Meditation Reminder: 1:00 PM every day ─────────────────────────────────
  cron.schedule('0 13 * * *', async () => {
    console.log('[Scheduler] Running daily meditation reminder...');
    try {
      const users = await User.find({
        emailVerified: true,
        'emailNotifications.meditationReminder': true
      }).select('email name');

      let sent = 0;
      for (const user of users) {
        await sendWellnessReminderEmail(user.email, user.name, 'meditation');
        sent++;
      }
      console.log(`[Scheduler] Meditation reminders sent to ${sent} student(s).`);
    } catch (err) {
      console.error('[Scheduler] Meditation reminder error:', err.message);
    }
  });

  // ── Cleanup Expired Tokens: Every night at 2:00 AM ─────────────────────────
  cron.schedule('0 2 * * *', async () => {
    console.log('[Scheduler] Cleaning up expired tokens...');
    try {
      const result = await User.updateMany(
        {
          $or: [
            { emailVerificationExpires: { $lt: new Date() } },
            { passwordResetExpires: { $lt: new Date() } }
          ]
        },
        {
          $unset: {
            emailVerificationToken: '',
            emailVerificationExpires: '',
            passwordResetToken: '',
            passwordResetExpires: ''
          }
        }
      );
      console.log(`[Scheduler] Cleaned up expired tokens for ${result.modifiedCount} user(s).`);
    } catch (err) {
      console.error('[Scheduler] Token cleanup error:', err.message);
    }
  });

  console.log('[Scheduler] ✅ Wellness reminders scheduled (9AM mood, 1PM meditation, 8PM journal, 2AM cleanup).');
};

module.exports = { startScheduler };
