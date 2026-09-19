const express = require('express');
const router = express.Router();
const {
  getHabits,
  createHabit,
  completeHabit,
  updateHabit,
  deleteHabit
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.post('/:id/complete', completeHabit);

router.route('/:id')
  .put(updateHabit)
  .delete(deleteHabit);

module.exports = router;
