const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadUserAvatar,
  getNotifications,
  markNotificationRead,
  deleteAccount,
  getDashboardStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// All user routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', uploadAvatar, uploadUserAvatar);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.delete('/account', deleteAccount);
router.get('/stats', getDashboardStats);

module.exports = router;
