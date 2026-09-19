const StressAssessment = require('../models/StressAssessment');

const getRecommendations = (level) => {
  if (level === 'High') {
    return [
      'Take a pause: try our guided 4-7-8 breathing exercise in the Meditation section.',
      'Prioritize urgent tasks only and break large assignments into smaller 20-minute chunks.',
      'Reach out to a trusted friend, counselor, or student mentor to share how you are feeling.',
      'Ensure you get at least 7-8 hours of uninterrupted sleep tonight.'
    ];
  } else if (level === 'Moderate') {
    return [
      'Schedule a 15-minute screen-free walk outdoors to refresh your cognitive focus.',
      'Maintain adequate hydration and take short stretch breaks every 45 minutes of studying.',
      'Write down your top 3 priorities in your private journal to clear mental clutter.'
    ];
  } else {
    return [
      'Great job maintaining balanced stress levels! Keep up your healthy routines.',
      'Continue regular physical activity and mindful relaxation practices.',
      'Reflect in your journal on the positive factors helping you feel calm and grounded today.'
    ];
  }
};

// @desc    Get all stress assessments for user
// @route   GET /api/stress
// @access  Private
const getAssessments = async (req, res) => {
  try {
    const assessments = await StressAssessment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(assessments);
  } catch (error) {
    console.error('Error in getAssessments:', error);
    res.status(500).json({ message: 'Server error retrieving stress assessments' });
  }
};

// @desc    Get latest stress assessment
// @route   GET /api/stress/latest
// @access  Private
const getLatestAssessment = async (req, res) => {
  try {
    const latest = await StressAssessment.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(latest || null);
  } catch (error) {
    console.error('Error in getLatestAssessment:', error);
    res.status(500).json({ message: 'Server error retrieving latest assessment' });
  }
};

// @desc    Submit new stress assessment
// @route   POST /api/stress
// @access  Private
const submitAssessment = async (req, res) => {
  try {
    const { answers, date } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Please provide answers for the assessment' });
    }

    // Calculate total score
    const totalScore = answers.reduce((sum, item) => sum + (Number(item.score) || 0), 0);

    let level = 'Low';
    if (totalScore >= 14) {
      level = 'High';
    } else if (totalScore >= 7) {
      level = 'Moderate';
    }

    const recommendations = getRecommendations(level);
    const assessmentDate = date || new Date().toISOString().split('T')[0];

    const assessment = await StressAssessment.create({
      userId: req.user._id,
      date: assessmentDate,
      answers,
      score: totalScore,
      level,
      recommendations
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Error in submitAssessment:', error);
    res.status(500).json({ message: error.message || 'Server error saving stress assessment' });
  }
};

module.exports = {
  getAssessments,
  getLatestAssessment,
  submitAssessment
};
