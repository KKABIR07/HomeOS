const User = require('../models/User');
const Project = require('../models/Project');
const FloorPlan = require('../models/FloorPlan');
const ArchitectProfile = require('../models/ArchitectProfile');
const Review = require('../models/Review');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get platform stats
 * @route   GET /api/admin/stats
 * @access  Private (admin)
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    architects,
    homeowners,
    totalProjects,
    activeProjects,
    completedProjects,
    totalFloorPlans,
    totalReviews,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'architect', isActive: true }),
    User.countDocuments({ role: 'homeowner', isActive: true }),
    Project.countDocuments(),
    Project.countDocuments({ status: 'active' }),
    Project.countDocuments({ status: 'completed' }),
    FloorPlan.countDocuments(),
    Review.countDocuments({ isHidden: false }),
    User.find({ isActive: true }).sort('-createdAt').limit(5).select('name email role createdAt avatar'),
  ]);

  // Monthly signups (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySignups = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Projects by style
  const projectsByStyle = await Project.aggregate([
    { $group: { _id: '$houseStyle', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      users: { total: totalUsers, architects, homeowners, builders: totalUsers - architects - homeowners },
      projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
      floorPlans: totalFloorPlans,
      reviews: totalReviews,
    },
    charts: {
      monthlySignups,
      projectsByStyle,
    },
    recentUsers,
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getUsers = asyncHandler(async (req, res) => {
  const {
    role,
    isActive,
    search,
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires');

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    users,
  });
});

/**
 * @desc    Update user (admin)
 * @route   PUT /api/admin/users/:id
 * @access  Private (admin)
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const { role, isActive, isEmailVerified, subscriptionPlan } = req.body;

  const updateData = {};
  if (role) {
    const allowedRoles = ['homeowner', 'architect', 'builder', 'admin'];
    if (!allowedRoles.includes(role)) {
      return next(new AppError(`Invalid role: ${role}`, 400));
    }
    updateData.role = role;
  }
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);
  if (isEmailVerified !== undefined) updateData.isEmailVerified = Boolean(isEmailVerified);
  if (subscriptionPlan) {
    const allowedPlans = ['free', 'pro', 'enterprise'];
    if (!allowedPlans.includes(subscriptionPlan)) return next(new AppError('Invalid plan', 400));
    updateData['subscription.plan'] = subscriptionPlan;
  }

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Delete user (admin — hard delete)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (admin)
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (req.user._id.toString() === req.params.id) {
    return next(new AppError('You cannot delete your own admin account', 400));
  }

  // Soft delete
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
  });
});

/**
 * @desc    Get all projects (admin)
 * @route   GET /api/admin/projects
 * @access  Private (admin)
 */
const getAllProjects = asyncHandler(async (req, res) => {
  const { status, houseStyle, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  const query = {};
  if (status) query.status = status;
  if (houseStyle) query.houseStyle = houseStyle;
  if (search) {
    query.$or = [
      { projectName: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Project.countDocuments(query);

  const projects = await Project.find(query)
    .populate('owner', 'name email avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    projects,
  });
});

/**
 * @desc    Get all architect profiles (admin)
 * @route   GET /api/admin/architects
 * @access  Private (admin)
 */
const getAllArchitects = asyncHandler(async (req, res) => {
  const { isVerified, page = 1, limit = 20 } = req.query;

  const query = {};
  if (isVerified !== undefined) query.isVerified = isVerified === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await ArchitectProfile.countDocuments(query);

  const architects = await ArchitectProfile.find(query)
    .populate('user', 'name email avatar role isActive createdAt')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    architects,
  });
});

/**
 * @desc    Verify architect profile
 * @route   PUT /api/admin/architects/:id/verify
 * @access  Private (admin)
 */
const verifyArchitect = asyncHandler(async (req, res, next) => {
  const { verified = true } = req.body;

  const profile = await ArchitectProfile.findOneAndUpdate(
    { user: req.params.id },
    { isVerified: Boolean(verified), verifiedAt: Boolean(verified) ? new Date() : undefined },
    { new: true }
  ).populate('user', 'name email');

  if (!profile) {
    return next(new AppError('Architect profile not found', 404));
  }

  // Notify architect
  await User.findByIdAndUpdate(req.params.id, {
    $push: {
      notifications: {
        $each: [{
          message: verified
            ? 'Congratulations! Your architect profile has been verified.'
            : 'Your architect verification status has been updated.',
          type: 'verification',
          link: '/profile',
        }],
        $position: 0,
      },
    },
  });

  res.status(200).json({
    success: true,
    message: `Architect profile ${verified ? 'verified' : 'unverified'} successfully`,
    profile,
  });
});

/**
 * @desc    Hide/unhide a review
 * @route   PUT /api/admin/reviews/:id/toggle
 * @access  Private (admin)
 */
const toggleReviewVisibility = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    [{ $set: { isHidden: { $not: '$isHidden' } } }],
    { new: true }
  );

  if (!review) return next(new AppError('Review not found', 404));

  res.status(200).json({
    success: true,
    isHidden: review.isHidden,
    message: `Review ${review.isHidden ? 'hidden' : 'unhidden'}`,
  });
});

/**
 * @desc    Get single user full detail + their projects
 * @route   GET /api/admin/users/:id
 * @access  Private (admin)
 */
const getUserDetail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires');
  if (!user) return next(new AppError('User not found', 404));

  const [projects, projectCount] = await Promise.all([
    Project.find({ owner: req.params.id })
      .select('projectName houseStyle status createdAt plotArea floors location builtArea budget currency')
      .sort('-createdAt')
      .limit(20),
    Project.countDocuments({ owner: req.params.id }),
  ]);

  res.status(200).json({ success: true, user, projects, projectCount });
});

module.exports = {
  getStats,
  getUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  getAllProjects,
  getAllArchitects,
  verifyArchitect,
  toggleReviewVisibility,
};
