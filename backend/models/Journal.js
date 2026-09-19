const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a journal title'],
      trim: true,
      maxlength: 150
    },
    content: {
      type: String,
      required: [true, 'Please write some journal content']
    },
    mood: {
      type: String,
      enum: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad', ''],
      default: ''
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

journalSchema.index({ userId: 1, date: -1 });

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
