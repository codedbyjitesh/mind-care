const express = require('express');
const router = express.Router();
const {
  getMoods,
  getTodayMood,
  createMood,
  updateMood,
  deleteMood
} = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getMoods)
  .post(createMood);

router.get('/today', getTodayMood);

router.route('/:id')
  .put(updateMood)
  .delete(deleteMood);

module.exports = router;
