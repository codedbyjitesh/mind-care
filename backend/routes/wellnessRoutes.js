const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getTips,
  getResources,
  getMeditationResources
} = require('../controllers/wellnessController');

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'mindcare_super_secret_jwt_key_2026_bsc_it'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Proceed unauthenticated
    }
  }
  next();
};

router.get('/tips', optionalProtect, getTips);
router.get('/resources', getResources);
router.get('/meditation', getMeditationResources);

module.exports = router;
