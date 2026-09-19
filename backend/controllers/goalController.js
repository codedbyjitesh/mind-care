const Goal = require('../models/Goal');

// @desc    Get user's wellness goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const activeGoals = goals.filter((g) => g.status === 'Active');
    const completedGoals = goals.filter((g) => g.status === 'Completed');

    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((acc, curr) => acc + curr.progress, 0) / activeGoals.length)
      : 0;

    res.json({
      goals,
      stats: {
        total: goals.length,
        active: activeGoals.length,
        completed: completedGoals.length,
        avgProgress
      }
    });
  } catch (error) {
    console.error('Error in getGoals:', error);
    res.status(500).json({ message: 'Server error retrieving wellness goals' });
  }
};

// @desc    Create wellness goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { title, description, startDate, targetDate, progress } = req.body;

    if (!title || !targetDate) {
      return res.status(400).json({ message: 'Goal title and target date are required' });
    }

    const newGoal = await Goal.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetDate,
      progress: progress !== undefined ? Math.min(100, Math.max(0, Number(progress))) : 0,
      status: Number(progress) === 100 ? 'Completed' : 'Active'
    });

    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error in createGoal:', error);
    res.status(500).json({ message: error.message || 'Server error creating goal' });
  }
};

// @desc    Update goal (title, progress, status, etc.)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const { title, description, startDate, targetDate, progress, status } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    if (title) goal.title = title.trim();
    if (description !== undefined) goal.description = description.trim();
    if (startDate) goal.startDate = startDate;
    if (targetDate) goal.targetDate = targetDate;
    if (progress !== undefined) {
      goal.progress = Math.min(100, Math.max(0, Number(progress)));
      if (goal.progress === 100 && (!status || status === 'Active')) {
        goal.status = 'Completed';
      }
    }
    if (status) goal.status = status;

    const updated = await goal.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateGoal:', error);
    res.status(500).json({ message: error.message || 'Server error updating goal' });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }
    res.json({ message: 'Goal deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error in deleteGoal:', error);
    res.status(500).json({ message: 'Server error deleting goal' });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};
