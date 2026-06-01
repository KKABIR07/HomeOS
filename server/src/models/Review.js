const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    architect: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Architect reference is required'],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer reference is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    reply: {
      type: String,
      maxlength: [500, 'Reply cannot exceed 500 characters'],
    },
    repliedAt: {
      type: Date,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from same reviewer for same architect
reviewSchema.index({ architect: 1, reviewer: 1 }, { unique: true });

// Post save — update architect profile rating
reviewSchema.post('save', async function () {
  const ArchitectProfile = mongoose.model('ArchitectProfile');
  const Review = mongoose.model('Review');

  const stats = await Review.aggregate([
    { $match: { architect: this.architect, isHidden: false } },
    {
      $group: {
        _id: '$architect',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await ArchitectProfile.findOneAndUpdate(
      { user: this.architect },
      {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      }
    );
  }
});

module.exports = mongoose.model('Review', reviewSchema);
