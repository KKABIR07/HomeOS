const express = require('express');
const router = express.Router();
const { getProjects, createProject, getProject, updateProject, deleteProject, toggleArchive, shareProject, getSharedProject, addCollaborator } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.get('/shared/:token', getSharedProject);

router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);
router.post('/:id/archive', toggleArchive);
router.post('/:id/share', shareProject);
router.post('/:id/collaborators', addCollaborator);

module.exports = router;
