const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD format for straightforward daily matching
      required: true
    },
    mood: {
      type: String,
      enum: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'],
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
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

// Prevent duplicate entries for the same user and date
moodEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);

module.exports = MoodEntry;
