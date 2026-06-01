const express = require('express');
const router = express.Router();
const { getFloorPlans, getFloorPlan, saveFloorPlan, updateFloorPlan, deleteFloorPlan, duplicateFloorPlan } = require('../controllers/floorplanController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getFloorPlans).post(saveFloorPlan);
router.route('/:id').get(getFloorPlan).put(updateFloorPlan).delete(deleteFloorPlan);
router.post('/:id/duplicate', duplicateFloorPlan);

module.exports = router;
