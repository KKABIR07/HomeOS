const ArchitectProfile = require('../models/ArchitectProfile');
const Review = require('../models/Review');
const User = require('../models/User');
const Message = require('../models/Message');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { sendHireNotification } = require('../services/emailService');
const { uploadPortfolioImage, deleteFromCloudinary, getPublicIdFromUrl } = require('../services/cloudinaryService');

/**
 * @desc    List architects with filters
 * @route   GET /api/architects
 * @access  Public
 */
const getArchitects = asyncHandler(async (req, res) => {
  const {
    specialization,
    minRating,
    maxRate,
    available,
    location,
    search,
    page = 1,
    limit = 12,
    sort = '-rating',
  } = req.query;

  const query = {};

  if (available === 'true') query.availability = true;
  if (minRating) query.rating = { $gte: parseFloat(minRating) };
  if (maxRate) query.hourlyRate = { $lte: parseFloat(maxRate) };
  if (specialization) query.specializations = { $in: [specialization] };
  if (location) {
    query.$or = [
      { 'location.city': { $regex: location, $options: 'i' } },
      { 'location.state': { $regex: location, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await ArchitectProfile.countDocuments(query);

  let profileQuery = ArchitectProfile.find(query)
    .populate('user', 'name avatar email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const profiles = await profileQuery;

  // If search, filter by user name after populate
  const filtered = search
    ? profiles.filter((p) =>
        p.user?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : profiles;

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    architects: filtered,
  });
});

/**
 * @desc    Get architect profile
 * @route   GET /api/architects/:id
 * @access  Public
 */
const getArchitect = asyncHandler(async (req, res, next) => {
  const profile = await ArchitectProfile.findOne({ user: req.params.id }).populate(
    'user',
    'name avatar email bio phone createdAt'
  );

  if (!profile) {
    return next(new AppError('Architect profile not found', 404));
  }

  const reviews = await Review.find({ architect: req.params.id, isHidden: false })
    .populate('reviewer', 'name avatar')
    .sort('-createdAt')
    .limit(10);

  res.status(200).json({
    success: true,
    profile,
    reviews,
  });
});

/**
 * @desc    Create or update architect profile
 * @route   POST /api/architects/profile
 * @access  Private (architect role)
 */
const upsertArchitectProfile = asyncHandler(async (req, res, next) => {
  const {
    bio,
    specializations,
    experience,
    certifications,
    hourlyRate,
    projectRate,
    availability,
    languages,
    location,
    website,
  } = req.body;

  const profileData = {
    user: req.user._id,
    bio,
    specializations: specializations || [],
    experience: experience ? Number(experience) : 0,
    certifications: certifications || [],
    hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
    projectRate: projectRate ? Number(projectRate) : undefined,
    availability: availability !== undefined ? Boolean(availability) : true,
    languages: languages || [],
    location: location || {},
    website,
  };

  const profile = await ArchitectProfile.findOneAndUpdate(
    { user: req.user._id },
    profileData,
    { new: true, upsert: true, runValidators: true }
  ).populate('user', 'name avatar email');

  res.status(200).json({
    success: true,
    profile,
  });
});

/**
 * @desc    Upload portfolio image
 * @route   POST /api/architects/portfolio
 * @access  Private (architect role)
 */
const addPortfolioItem = asyncHandler(async (req, res, next) => {
  const { title, description, year } = req.body;

  if (!title) {
    return next(new AppError('Portfolio item title is required', 400));
  }

  const profile = await ArchitectProfile.findOne({ user: req.user._id });
  if (!profile) {
    return next(new AppError('Architect profile not found. Please create your profile first.', 404));
  }

  let imageUrl = '';
  if (req.file) {
    const result = await uploadPortfolioImage(req.file.buffer);
    imageUrl = result.secure_url;
  }

  profile.portfolio.push({
    title: title.trim(),
    image: imageUrl,
    description: description?.trim(),
    year: year ? Number(year) : new Date().getFullYear(),
  });

  await profile.save();

  res.status(201).json({
    success: true,
    portfolio: profile.portfolio,
  });
});

/**
 * @desc    Delete portfolio item
 * @route   DELETE /api/architects/portfolio/:itemId
 * @access  Private (architect role)
 */
const deletePortfolioItem = asyncHandler(async (req, res, next) => {
  const profile = await ArchitectProfile.findOne({ user: req.user._id });
  if (!profile) return next(new AppError('Profile not found', 404));

  const item = profile.portfolio.id(req.params.itemId);
  if (!item) return next(new AppError('Portfolio item not found', 404));

  if (item.image) {
    const publicId = getPublicIdFromUrl(item.image);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  item.deleteOne();
  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Portfolio item removed',
    portfolio: profile.portfolio,
  });
});

/**
 * @desc    Submit review for architect
 * @route   POST /api/architects/:id/review
 * @access  Private
 */
const submitReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, projectId } = req.body;

  if (!rating || !comment) {
    return next(new AppError('Rating and comment are required', 400));
  }

  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot review yourself', 400));
  }

  const architectUser = await User.findById(req.params.id);
  if (!architectUser || architectUser.role !== 'architect') {
    return next(new AppError('Architect not found', 404));
  }

  const existingReview = await Review.findOne({
    architect: req.params.id,
    reviewer: req.user._id,
  });

  if (existingReview) {
    // Update existing review
    existingReview.rating = Number(rating);
    existingReview.comment = comment.trim();
    if (projectId) existingReview.project = projectId;
    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: 'Review updated',
      review: existingReview,
    });
  }

  const review = await Review.create({
    architect: req.params.id,
    reviewer: req.user._id,
    project: projectId || undefined,
    rating: Number(rating),
    comment: comment.trim(),
  });

  await review.populate('reviewer', 'name avatar');

  res.status(201).json({
    success: true,
    review,
  });
});

/**
 * @desc    Get reviews for architect
 * @route   GET /api/architects/:id/reviews
 * @access  Public
 */
const getReviews = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await Review.countDocuments({ architect: req.params.id, isHidden: false });

  const reviews = await Review.find({ architect: req.params.id, isHidden: false })
    .populate('reviewer', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  // Calculate rating distribution
  const ratingDist = await Review.aggregate([
    { $match: { architect: new (require('mongoose').Types.ObjectId)(req.params.id), isHidden: false } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    ratingDistribution: ratingDist,
    reviews,
  });
});

/**
 * @desc    Reply to a review (architect only)
 * @route   PUT /api/architects/reviews/:reviewId/reply
 * @access  Private (architect)
 */
const replyToReview = asyncHandler(async (req, res, next) => {
  const { reply } = req.body;
  if (!reply) return next(new AppError('Reply content is required', 400));

  const review = await Review.findById(req.params.reviewId);
  if (!review) return next(new AppError('Review not found', 404));

  if (review.architect.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the reviewed architect can reply', 403));
  }

  review.reply = reply.trim();
  review.repliedAt = new Date();
  await review.save();

  res.status(200).json({ success: true, review });
});

/**
 * @desc    Hire request — sends message + email notification
 * @route   POST /api/architects/:id/hire
 * @access  Private
 */
const hireArchitect = asyncHandler(async (req, res, next) => {
  const { projectId, message } = req.body;

  if (!message) {
    return next(new AppError('Please include a message with your hire request', 400));
  }

  const architect = await User.findById(req.params.id);
  if (!architect || architect.role !== 'architect') {
    return next(new AppError('Architect not found', 404));
  }

  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot hire yourself', 400));
  }

  // Create a message
  await Message.create({
    sender: req.user._id,
    recipient: req.params.id,
    project: projectId || undefined,
    content: message.trim(),
  });

  // Send email notification
  let project = null;
  if (projectId) {
    project = await require('../models/Project').findById(projectId).select('projectName location budget');
  }

  await sendHireNotification(architect, req.user, project || { projectName: 'General Inquiry' });

  // Add notification to architect
  await User.findByIdAndUpdate(req.params.id, {
    $push: {
      notifications: {
        $each: [{
          message: `${req.user.name} sent you a hire request`,
          type: 'hire_request',
          link: '/messages',
        }],
        $position: 0,
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Hire request sent successfully. The architect has been notified.',
  });
});

module.exports = {
  getArchitects,
  getArchitect,
  upsertArchitectProfile,
  addPortfolioItem,
  deletePortfolioItem,
  submitReview,
  getReviews,
  replyToReview,
  hireArchitect,
};
