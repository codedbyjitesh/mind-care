const express = require('express');
const router = express.Router();
const {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal
} = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getJournals)
  .post(createJournal);

router.route('/:id')
  .get(getJournalById)
  .put(updateJournal)
  .delete(deleteJournal);

module.exports = router;
