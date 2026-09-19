const Journal = require('../models/Journal');

// @desc    Get user's private journals with search and date filters
// @route   GET /api/journals
// @access  Private (Student ownership strictly enforced)
const getJournals = async (req, res) => {
  try {
    const { search, date, startDate, endDate, limit = 50 } = req.query;
    // Strict isolation: only query journals belonging to req.user._id
    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const journals = await Journal.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit));

    res.json(journals);
  } catch (error) {
    console.error('Error in getJournals:', error);
    res.status(500).json({ message: 'Server error retrieving private journals' });
  }
};

// @desc    Get single journal entry
// @route   GET /api/journals/:id
// @access  Private
const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found or unauthorized' });
    }
    res.json(journal);
  } catch (error) {
    console.error('Error in getJournalById:', error);
    res.status(500).json({ message: 'Server error retrieving journal entry' });
  }
};

// @desc    Create private journal entry
// @route   POST /api/journals
// @access  Private
const createJournal = async (req, res) => {
  try {
    const { title, content, mood, date, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const entryDate = date || new Date().toISOString().split('T')[0];

    const journal = await Journal.create({
      userId: req.user._id,
      title: title.trim(),
      content: content.trim(),
      mood: mood || '',
      date: entryDate,
      tags: Array.isArray(tags) ? tags : []
    });

    res.status(201).json(journal);
  } catch (error) {
    console.error('Error in createJournal:', error);
    res.status(500).json({ message: error.message || 'Server error creating journal entry' });
  }
};

// @desc    Update private journal entry
// @route   PUT /api/journals/:id
// @access  Private
const updateJournal = async (req, res) => {
  try {
    const { title, content, mood, date, tags } = req.body;
    const journal = await Journal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found or unauthorized' });
    }

    if (title) journal.title = title.trim();
    if (content) journal.content = content.trim();
    if (mood !== undefined) journal.mood = mood;
    if (date) journal.date = date;
    if (tags !== undefined && Array.isArray(tags)) journal.tags = tags;

    const updated = await journal.save();
    res.json(updated);
  } catch (error) {
    console.error('Error in updateJournal:', error);
    res.status(500).json({ message: error.message || 'Server error updating journal entry' });
  }
};

// @desc    Delete private journal entry
// @route   DELETE /api/journals/:id
// @access  Private
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found or unauthorized' });
    }
    res.json({ message: 'Journal entry deleted permanently', id: req.params.id });
  } catch (error) {
    console.error('Error in deleteJournal:', error);
    res.status(500).json({ message: 'Server error deleting journal entry' });
  }
};

module.exports = {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal
};
