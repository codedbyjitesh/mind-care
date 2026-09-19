const SleepEntry = require('../models/SleepEntry');

// Helper to calculate duration in hours between HH:MM strings
const calculateDurationHours = (sleepTime, wakeTime) => {
  if (!sleepTime || !wakeTime) return 0;
  const [sHours, sMinutes] = sleepTime.split(':').map(Number);
  const [wHours, wMinutes] = wakeTime.split(':').map(Number);

  let sleepMinutes = sHours * 60 + sMinutes;
  let wakeMinutes = wHours * 60 + wMinutes;

  if (wakeMinutes < sleepMinutes) {
    wakeMinutes += 24 * 60; // crossed midnight
  }

  const diffMinutes = wakeMinutes - sleepMinutes;
  return Number((diffMinutes / 60).toFixed(1));
};

// @desc    Get sleep records and weekly summary
// @route   GET /api/sleep
// @access  Private
const getSleepEntries = async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const entries = await SleepEntry.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit));

    // Calculate weekly stats
    const totalDuration = entries.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const avgDuration = entries.length > 0 ? Number((totalDuration / entries.length).toFixed(1)) : 0;

    res.json({
      entries,
      summary: {
        totalRecords: entries.length,
        avgDuration,
        targetDuration: 8.0
      }
    });
  } catch (error) {
    console.error('Error in getSleepEntries:', error);
    res.status(500).json({ message: 'Server error retrieving sleep records' });
  }
};

// @desc    Add sleep record
// @route   POST /api/sleep
// @access  Private
const createSleepEntry = async (req, res) => {
  try {
    const { date, sleepTime, wakeTime, duration, quality, note } = req.body;

    const entryDate = date || new Date().toISOString().split('T')[0];

    // Compute duration if not manually specified
    let computedDuration = duration;
    if (!computedDuration && sleepTime && wakeTime) {
      computedDuration = calculateDurationHours(sleepTime, wakeTime);
    }

    if (!computedDuration) {
      computedDuration = 7.0; // fallback default
    }

    const newEntry = await SleepEntry.create({
      userId: req.user._id,
      date: entryDate,
      sleepTime: sleepTime || '23:00',
      wakeTime: wakeTime || '07:00',
      duration: computedDuration,
      quality: quality || 'Good',
      note: note || ''
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error in createSleepEntry:', error);
    res.status(500).json({ message: error.message || 'Server error saving sleep record' });
  }
};

// @desc    Update sleep record
// @route   PUT /api/sleep/:id
// @access  Private
const updateSleepEntry = async (req, res) => {
  try {
    const { date, sleepTime, wakeTime, duration, quality, note } = req.body;
    const entry = await SleepEntry.findOne({ _id: req.params.id, userId: req.user._id });

    if (!entry) {
      return res.status(404).json({ message: 'Sleep record not found or unauthorized' });
    }

    if (date) entry.date = date;
    if (sleepTime) entry.sleepTime = sleepTime;
    if (wakeTime) entry.wakeTime = wakeTime;
    if (quality) entry.quality = quality;
    if (note !== undefined) entry.note = note;

    if (duration !== undefined) {
      entry.duration = duration;
    } else if (sleepTime && wakeTime) {
      entry.duration = calculateDurationHours(entry.sleepTime, entry.wakeTime);
    }

    const updated = await entry.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateSleepEntry:', error);
    res.status(500).json({ message: error.message || 'Server error updating sleep record' });
  }
};

// @desc    Delete sleep record
// @route   DELETE /api/sleep/:id
// @access  Private
const deleteSleepEntry = async (req, res) => {
  try {
    const entry = await SleepEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Sleep record not found or unauthorized' });
    }
    res.json({ message: 'Sleep record deleted', id: req.params.id });
  } catch (error) {
    console.error('Error in deleteSleepEntry:', error);
    res.status(500).json({ message: 'Server error deleting sleep record' });
  }
};

module.exports = {
  getSleepEntries,
  createSleepEntry,
  updateSleepEntry,
  deleteSleepEntry
};
