const mongoose = require('mongoose');

const wellnessTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a tip title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide tip details'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Stress Relief', 'Sleep Hygiene', 'Mood Boost', 'Mindfulness', 'Physical Health', 'Study Life Balance'],
      default: 'Mindfulness'
    },
    condition: {
      type: String,
      enum: ['general', 'stress_high', 'mood_low', 'sleep_low'],
      default: 'general'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const WellnessTip = mongoose.model('WellnessTip', wellnessTipSchema);

module.exports = WellnessTip;
