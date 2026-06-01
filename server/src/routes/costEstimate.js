const express = require('express');
const router = express.Router();
const { getCostEstimate, generatePDFReport } = require('../controllers/costController');
const { protect } = require('../middleware/auth');

// Require auth for both
router.use(protect);

router.post('/', getCostEstimate);
router.post('/pdf', generatePDFReport);

module.exports = router;
