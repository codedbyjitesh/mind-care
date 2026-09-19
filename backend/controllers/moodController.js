const MoodEntry = require('../models/MoodEntry');

const moodScoreMap = {
  'Very Happy': 5,
  'Happy': 4,
  'Neutral': 3,
  'Sad': 2,
  'Very Sad': 1
};

// @desc    Get mood history for authenticated user
// @route   GET /api/mood
// @access  Private
const getMoods = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    const moods = await MoodEntry.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit));

    res.json(moods);
  } catch (error) {
    console.error('Error in getMoods:', error);
    res.status(500).json({ message: 'Server error retrieving mood records' });
  }
};

// @desc    Get today's mood for authenticated user
// @route   GET /api/mood/today
// @access  Private
const getTodayMood = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const mood = await MoodEntry.findOne({ userId: req.user._id, date: today });
    res.json(mood || null);
  } catch (error) {
    console.error('Error in getTodayMood:', error);
    res.status(500).json({ message: 'Server error retrieving today mood' });
  }
};

// @desc    Add daily mood
// @route   POST /api/mood
// @access  Private
const createMood = async (req, res) => {
  try {
    const { mood, date, note, score } = req.body;
    const entryDate = date || new Date().toISOString().split('T')[0];

    if (!mood) {
      return res.status(400).json({ message: 'Please select a mood option' });
    }

    const calculatedScore = score || moodScoreMap[mood] || 3;

    // Check if an entry already exists for this date
    const existingMood = await MoodEntry.findOne({ userId: req.user._id, date: entryDate });
    if (existingMood) {
      return res.status(409).json({
        message: 'A mood entry already exists for this date. Please edit the existing entry.',
        existingId: existingMood._id
      });
    }

    const newMood = await MoodEntry.create({
      userId: req.user._id,
      date: entryDate,
      mood,
      score: calculatedScore,
      note: note || ''
    });

    res.status(201).json(newMood);
  } catch (error) {
    console.error('Error in createMood:', error);
    res.status(500).json({ message: error.message || 'Server error creating mood entry' });
  }
};

// @desc    Update mood entry
// @route   PUT /api/mood/:id
// @access  Private
const updateMood = async (req, res) => {
  try {
    const { mood, note, score, date } = req.body;
    const moodEntry = await MoodEntry.findOne({ _id: req.params.id, userId: req.user._id });

    if (!moodEntry) {
      return res.status(404).json({ message: 'Mood entry not found or unauthorized' });
    }

    if (mood) {
      moodEntry.mood = mood;
      moodEntry.score = score || moodScoreMap[mood] || moodEntry.score;
    }
    if (note !== undefined) moodEntry.note = note;
    if (date) moodEntry.date = date;

    const updated = await moodEntry.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateMood:', error);
    res.status(500).json({ message: error.message || 'Server error updating mood entry' });
  }
};

// @desc    Delete mood entry
// @route   DELETE /api/mood/:id
// @access  Private
const deleteMood = async (req, res) => {
  try {
    const moodEntry = await MoodEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!moodEntry) {
      return res.status(404).json({ message: 'Mood entry not found or unauthorized' });
    }
    res.json({ message: 'Mood entry removed successfully', id: req.params.id });
  } catch (error) {
    console.error('Error in deleteMood:', error);
    res.status(500).json({ message: 'Server error deleting mood entry' });
  }
};

module.exports = {
  getMoods,
  getTodayMood,
  createMood,
  updateMood,
  deleteMood
};
