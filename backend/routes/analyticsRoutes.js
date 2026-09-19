const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getHistory } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/history', getHistory);

module.exports = router;
