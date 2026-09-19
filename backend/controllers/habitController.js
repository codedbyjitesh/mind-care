const Habit = require('../models/Habit');

// Helper to calculate current streak
const calculateStreak = (completionHistory) => {
  if (!completionHistory || completionHistory.length === 0) return 0;

  // Filter completed dates and sort descending
  const completedDates = completionHistory
    .filter((h) => h.completed)
    .map((h) => h.date)
    .sort()
    .reverse();

  if (completedDates.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  const todayStr = currentDate.toISOString().split('T')[0];

  // If today isn't completed yet, check yesterday to continue streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let checkDate = new Date();
  if (!completedDates.includes(todayStr)) {
    if (completedDates.includes(yesterdayStr)) {
      checkDate = yesterday;
    } else {
      return 0; // Streak broken
    }
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (completedDates.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// @desc    Get user's habits with today's status & statistics
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const today = new Date().toISOString().split('T')[0];

    const habitsWithStatus = habits.map((h) => {
      const todayEntry = h.completionHistory.find((c) => c.date === today);
      const isCompletedToday = !!(todayEntry && todayEntry.completed);
      const totalCompletedDays = h.completionHistory.filter((c) => c.completed).length;

      return {
        ...h.toObject(),
        isCompletedToday,
        totalCompletedDays
      };
    });

    const activeHabits = habitsWithStatus.filter((h) => h.active);
    const completedTodayCount = activeHabits.filter((h) => h.isCompletedToday).length;
    const overallCompletionRate = activeHabits.length > 0
      ? Math.round((completedTodayCount / activeHabits.length) * 100)
      : 0;

    res.json({
      habits: habitsWithStatus,
      statistics: {
        total: habits.length,
        active: activeHabits.length,
        completedToday: completedTodayCount,
        completionRate: overallCompletionRate
      }
    });
  } catch (error) {
    console.error('Error in getHabits:', error);
    res.status(500).json({ message: 'Server error retrieving habits' });
  }
};

// @desc    Create habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res) => {
  try {
    const { title, description, frequency, startDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a habit title' });
    }

    const newHabit = await Habit.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      frequency: frequency || 'Daily',
      startDate: startDate || new Date().toISOString().split('T')[0],
      active: true,
      completionHistory: [],
      streak: 0
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Error in createHabit:', error);
    res.status(500).json({ message: error.message || 'Server error creating habit' });
  }
};

// @desc    Toggle or mark habit completed for a date
// @route   POST /api/habits/:id/complete
// @access  Private
const completeHabit = async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    const existingIndex = habit.completionHistory.findIndex((c) => c.date === targetDate);
    if (existingIndex > -1) {
      // Toggle completion
      habit.completionHistory[existingIndex].completed = !habit.completionHistory[existingIndex].completed;
    } else {
      habit.completionHistory.push({ date: targetDate, completed: true });
    }

    // Recompute streak
    habit.streak = calculateStreak(habit.completionHistory);
    const updated = await habit.save();

    const isCompletedToday = !!(updated.completionHistory.find(
      (c) => c.date === targetDate && c.completed
    ));

    res.json({
      ...updated.toObject(),
      isCompletedToday
    });
  } catch (error) {
    console.error('Error in completeHabit:', error);
    res.status(500).json({ message: error.message || 'Server error toggling habit' });
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res) => {
  try {
    const { title, description, frequency, active } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    if (title) habit.title = title.trim();
    if (description !== undefined) habit.description = description.trim();
    if (frequency) habit.frequency = frequency;
    if (active !== undefined) habit.active = active;

    const updated = await habit.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateHabit:', error);
    res.status(500).json({ message: error.message || 'Server error updating habit' });
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }
    res.json({ message: 'Habit deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error in deleteHabit:', error);
    res.status(500).json({ message: 'Server error deleting habit' });
  }
};

module.exports = {
  getHabits,
  createHabit,
  completeHabit,
  updateHabit,
  deleteHabit
};
