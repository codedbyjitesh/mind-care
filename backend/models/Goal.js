const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    startDate: {
      type: String,
      required: true
    },
    targetDate: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
