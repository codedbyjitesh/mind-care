const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getLatestAssessment,
  submitAssessment
} = require('../controllers/stressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAssessments)
  .post(submitAssessment);

router.get('/latest', getLatestAssessment);

module.exports = router;
