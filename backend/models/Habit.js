const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a habit title'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly'],
      default: 'Daily'
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    active: {
      type: Boolean,
      default: true
    },
    completionHistory: [
      {
        date: { type: String, required: true }, // YYYY-MM-DD
        completed: { type: Boolean, default: true }
      }
    ],
    streak: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
