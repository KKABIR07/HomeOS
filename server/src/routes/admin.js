const express = require('express');
const router = express.Router();
const { getStats, getUsers, getUserDetail, updateUser, deleteUser, getAllProjects, getAllArchitects, verifyArchitect, toggleReviewVisibility } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/projects', getAllProjects);
router.get('/architects', getAllArchitects);
router.put('/architects/:id/verify', verifyArchitect);
router.put('/reviews/:id/visibility', toggleReviewVisibility);

module.exports = router;
