const mongoose = require('mongoose');

const wellnessResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a resource title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a resource description'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'Stress Management',
        'Meditation',
        'Sleep',
        'Study Balance',
        'Time Management',
        'Exercise',
        'Mindfulness',
        'General Wellness',
        'Support'
      ],
      required: true
    },
    url: {
      type: String,
      required: [true, 'Please provide a resource URL'],
      trim: true
    },
    icon: {
      type: String,
      default: '📚'
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

wellnessResourceSchema.index({ category: 1, active: 1 });

const WellnessResource = mongoose.model('WellnessResource', wellnessResourceSchema);

module.exports = WellnessResource;
