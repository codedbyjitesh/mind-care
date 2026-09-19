const mongoose = require('mongoose');

const sleepEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    sleepTime: {
      type: String, // HH:MM (e.g. 23:00)
      required: true
    },
    wakeTime: {
      type: String, // HH:MM (e.g. 07:00)
      required: true
    },
    duration: {
      type: Number, // in hours, e.g. 8.0
      required: true
    },
    quality: {
      type: String,
      enum: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
      default: 'Good'
    },
    note: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

sleepEntrySchema.index({ userId: 1, date: -1 });

const SleepEntry = mongoose.model('SleepEntry', sleepEntrySchema);

module.exports = SleepEntry;
