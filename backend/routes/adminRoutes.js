const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  toggleUserStatus,
  createTip,
  updateTip,
  deleteTip,
  createResource,
  updateResource,
  deleteResource,
  createMeditation,
  updateMeditation,
  deleteMeditation
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protect all admin routes with authentication and admin role authorization
router.use(protect, admin);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);

// Tips Management
router.post('/tips', createTip);
router.route('/tips/:id')
  .put(updateTip)
  .delete(deleteTip);

// Resources Management
router.post('/resources', createResource);
router.route('/resources/:id')
  .put(updateResource)
  .delete(deleteResource);

// Meditation Guides Management
router.post('/meditation', createMeditation);
router.route('/meditation/:id')
  .put(updateMeditation)
  .delete(deleteMeditation);

module.exports = router;
