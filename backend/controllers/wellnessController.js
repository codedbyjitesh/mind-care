const WellnessTip = require('../models/WellnessTip');
const WellnessResource = require('../models/WellnessResource');
const MeditationResource = require('../models/MeditationResource');
const StressAssessment = require('../models/StressAssessment');
const MoodEntry = require('../models/MoodEntry');
const SleepEntry = require('../models/SleepEntry');

// @desc    Get personalized wellness tips based on user's recent data
// @route   GET /api/wellness/tips
// @access  Private
const getTips = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    let stressLevel = null;
    let recentMoodScore = null;
    let recentSleepDuration = null;
    const detectedConditions = [];

    if (userId) {
      // Check latest stress assessment
      const latestStress = await StressAssessment.findOne({ userId }).sort({ createdAt: -1 });
      if (latestStress) {
        stressLevel = latestStress.level;
        if (stressLevel === 'High') {
          detectedConditions.push('stress_high');
        }
      }

      // Check latest mood entry
      const latestMood = await MoodEntry.findOne({ userId }).sort({ date: -1, createdAt: -1 });
      if (latestMood) {
        recentMoodScore = latestMood.score;
        if (latestMood.score <= 2) {
          detectedConditions.push('mood_low');
        }
      }

      // Check latest sleep entry
      const latestSleep = await SleepEntry.findOne({ userId }).sort({ date: -1, createdAt: -1 });
      if (latestSleep) {
        recentSleepDuration = latestSleep.duration;
        if (latestSleep.duration < 6.5) {
          detectedConditions.push('sleep_low');
        }
      }
    }

    // Fetch active tips
    const allTips = await WellnessTip.find({ active: true });

    // Separate personalized priority tips and general tips
    const personalizedTips = [];
    const generalTips = [];

    allTips.forEach((tip) => {
      if (detectedConditions.includes(tip.condition)) {
        personalizedTips.push(tip);
      } else {
        generalTips.push(tip);
      }
    });

    res.json({
      personalized: personalizedTips,
      general: generalTips,
      conditionsDetected: detectedConditions,
      context: {
        stressLevel,
        recentMoodScore,
        recentSleepDuration
      }
    });
  } catch (error) {
    console.error('Error in getTips:', error);
    res.status(500).json({ message: 'Server error retrieving wellness tips' });
  }
};

// @desc    Get wellness resource library (with search & category filter)
// @route   GET /api/wellness/resources
// @access  Public / Private
const getResources = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { active: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await WellnessResource.find(query).sort({ category: 1, title: 1 });
    res.json(resources);
  } catch (error) {
    console.error('Error in getResources:', error);
    res.status(500).json({ message: 'Server error retrieving wellness resources' });
  }
};

// @desc    Get meditation and breathing exercise guides
// @route   GET /api/wellness/meditation
// @access  Public / Private
const getMeditationResources = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { active: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    const meditationGuides = await MeditationResource.find(query).sort({ duration: 1 });
    res.json(meditationGuides);
  } catch (error) {
    console.error('Error in getMeditationResources:', error);
    res.status(500).json({ message: 'Server error retrieving meditation guides' });
  }
};

module.exports = {
  getTips,
  getResources,
  getMeditationResources
};
