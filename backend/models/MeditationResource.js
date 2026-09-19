const mongoose = require('mongoose');

const meditationResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a meditation guide title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Breathing', 'Mindfulness', 'Stress Release', 'Sleep Meditation', 'Focus & Study', 'Body Scan'],
      default: 'Breathing'
    },
    duration: {
      type: Number, // duration in minutes
      required: true,
      default: 5
    },
    url: {
      type: String,
      required: true,
      trim: true
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

const MeditationResource = mongoose.model('MeditationResource', meditationResourceSchema);

module.exports = MeditationResource;
