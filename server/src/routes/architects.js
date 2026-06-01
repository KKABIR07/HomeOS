const express = require('express');
const router = express.Router();
const {
  getArchitects,
  getArchitect,
  upsertArchitectProfile,
  addPortfolioItem,
  deletePortfolioItem,
  submitReview,
  getReviews,
  replyToReview,
  hireArchitect,
} = require('../controllers/architectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { uploadPortfolioImage } = require('../middleware/upload');

// Public routes
router.get('/', getArchitects);
router.get('/:id', getArchitect);
router.get('/:id/reviews', getReviews);

// Protected routes
router.use(protect);

// Architect profile management
router.post('/profile', authorize('architect', 'admin'), upsertArchitectProfile);
router.post('/portfolio', authorize('architect', 'admin'), uploadPortfolioImage, addPortfolioItem);
router.delete('/portfolio/:itemId', authorize('architect', 'admin'), deletePortfolioItem);

// Reviews
router.post('/:id/review', submitReview);
router.put('/reviews/:reviewId/reply', authorize('architect', 'admin'), replyToReview);

// Hire
router.post('/:id/hire', hireArchitect);

module.exports = router;
