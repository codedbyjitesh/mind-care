const MoodEntry = require('../models/MoodEntry');
const StressAssessment = require('../models/StressAssessment');
const SleepEntry = require('../models/SleepEntry');
const Habit = require('../models/Habit');
const Goal = require('../models/Goal');

// @desc    Get aggregated dashboard summary data & charts
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // 1. Today's Records
    const todayMood = await MoodEntry.findOne({ userId, date: today });
    const todayStress = await StressAssessment.findOne({ userId, date: today }).sort({ createdAt: -1 });
    const todaySleep = await SleepEntry.findOne({ userId, date: today });

    // 2. 7-Day & 30-Day Date Ranges
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

    // 3. Mood History & Average
    const recentMoods = await MoodEntry.find({ userId, date: { $gte: sevenDaysStr } }).sort({ date: 1 });
    const allMoods = await MoodEntry.find({ userId }).limit(30);
    const avgMood = allMoods.length > 0
      ? Number((allMoods.reduce((acc, curr) => acc + curr.score, 0) / allMoods.length).toFixed(1))
      : 0;

    // 4. Stress History & Average
    const recentStress = await StressAssessment.find({ userId, date: { $gte: sevenDaysStr } }).sort({ date: 1 });
    const allStress = await StressAssessment.find({ userId }).limit(30);
    const avgStress = allStress.length > 0
      ? Number((allStress.reduce((acc, curr) => acc + curr.score, 0) / allStress.length).toFixed(1))
      : 0;

    // 5. Sleep History & Average
    const recentSleep = await SleepEntry.find({ userId, date: { $gte: sevenDaysStr } }).sort({ date: 1 });
    const allSleep = await SleepEntry.find({ userId }).limit(30);
    const avgSleep = allSleep.length > 0
      ? Number((allSleep.reduce((acc, curr) => acc + curr.duration, 0) / allSleep.length).toFixed(1))
      : 0;

    // 6. Habit Completion Stats
    const habits = await Habit.find({ userId, active: true });
    let completedHabitsToday = 0;
    habits.forEach((h) => {
      const isDone = h.completionHistory.some((c) => c.date === today && c.completed);
      if (isDone) completedHabitsToday++;
    });
    const habitCompletionRate = habits.length > 0
      ? Math.round((completedHabitsToday / habits.length) * 100)
      : 0;

    // 7. Goal Progress Stats
    const activeGoals = await Goal.find({ userId, status: 'Active' });
    const avgGoalProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((acc, curr) => acc + curr.progress, 0) / activeGoals.length)
      : 0;

    // 8. Prepare Chart.js formatted trends for last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const moodChartData = dates.map((d) => {
      const match = recentMoods.find((m) => m.date === d);
      return match ? match.score : null;
    });

    const stressChartData = dates.map((d) => {
      const match = recentStress.find((s) => s.date === d);
      return match ? match.score : null;
    });

    const sleepChartData = dates.map((d) => {
      const match = recentSleep.find((s) => s.date === d);
      return match ? match.duration : null;
    });

    const habitProgressChartData = dates.map((d) => {
      if (habits.length === 0) return 0;
      let count = 0;
      habits.forEach((h) => {
        if (h.completionHistory.some((c) => c.date === d && c.completed)) {
          count++;
        }
      });
      return Math.round((count / habits.length) * 100);
    });

    res.json({
      today: {
        date: today,
        mood: todayMood,
        stress: todayStress,
        sleep: todaySleep
      },
      stats: {
        avgMood,
        avgStress,
        avgSleep,
        habitCompletionRate,
        avgGoalProgress,
        activeHabitsCount: habits.length,
        activeGoalsCount: activeGoals.length
      },
      charts: {
        labels: dates.map((d) => {
          const parts = d.split('-');
          return `${parts[1]}/${parts[2]}`; // MM/DD
        }),
        moodScores: moodChartData,
        stressScores: stressChartData,
        sleepDurations: sleepChartData,
        habitCompletionRates: habitProgressChartData
      }
    });
  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    res.status(500).json({ message: 'Server error retrieving analytics data' });
  }
};

// @desc    Get combined mood and stress history with filtering
// @route   GET /api/analytics/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period, page = 1, limit = 20 } = req.query;

    const query = { userId };
    if (period === 'weekly') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query.date = { $gte: lastWeek.toISOString().split('T')[0] };
    } else if (period === 'monthly') {
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      query.date = { $gte: lastMonth.toISOString().split('T')[0] };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [moods, totalMoods] = await Promise.all([
      MoodEntry.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      MoodEntry.countDocuments(query)
    ]);

    const [stress, totalStress] = await Promise.all([
      StressAssessment.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      StressAssessment.countDocuments(query)
    ]);

    res.json({
      moods,
      stress,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalMoods,
        totalStress
      }
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    res.status(500).json({ message: 'Server error retrieving wellness history' });
  }
};

module.exports = {
  getDashboardAnalytics,
  getHistory
};
