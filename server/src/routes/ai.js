const express = require('express');
const router = express.Router();
const {
  generateFloorPlan,
  estimateCost,
  chat,
  interiorDesign,
  vastuAnalysis,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// All AI routes require authentication
router.use(protect);

router.post('/generate-floorplan', aiLimiter, generateFloorPlan);
router.post('/estimate-cost', aiLimiter, estimateCost);
router.post('/chat', aiLimiter, chat);
router.post('/interior-design', aiLimiter, interiorDesign);
router.post('/vastu', aiLimiter, vastuAnalysis);

module.exports = router;
