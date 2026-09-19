const express = require('express');
const router = express.Router();
const {
  getSleepEntries,
  createSleepEntry,
  updateSleepEntry,
  deleteSleepEntry
} = require('../controllers/sleepController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSleepEntries)
  .post(createSleepEntry);

router.route('/:id')
  .put(updateSleepEntry)
  .delete(deleteSleepEntry);

module.exports = router;
