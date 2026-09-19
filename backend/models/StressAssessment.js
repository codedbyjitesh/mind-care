const mongoose = require('mongoose');

const stressAssessmentSchema = new mongoose.Schema(
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
    answers: [
      {
        question: { type: String, required: true },
        score: { type: Number, required: true, min: 0, max: 4 } // 0: Never, 1: Rarely, 2: Sometimes, 3: Often, 4: Very Often
      }
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },
    level: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      required: true
    },
    recommendations: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

stressAssessmentSchema.index({ userId: 1, date: -1 });

const StressAssessment = mongoose.model('StressAssessment', stressAssessmentSchema);

module.exports = StressAssessment;
