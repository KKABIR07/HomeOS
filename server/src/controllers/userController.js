const User = require('../models/User');
const Project = require('../models/Project');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { uploadAvatar, deleteFromCloudinary, getPublicIdFromUrl } = require('../services/cloudinaryService');

/**
 * @desc    Get own profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Update profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, bio, address } = req.body;

  // Fields not allowed to update via this route
  const disallowed = ['password', 'email', 'role', 'isEmailVerified', 'googleId'];
  for (const field of disallowed) {
    if (req.body[field] !== undefined) {
      return next(new AppError(`You cannot update '${field}' via this route`, 400));
    }
  }

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (phone) updateData.phone = phone.trim();
  if (bio !== undefined) updateData.bio = bio.trim();
  if (address) updateData.address = address;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Upload avatar
 * @route   POST /api/users/avatar
 * @access  Private
 */
const uploadUserAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file', 400));
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar from Cloudinary
  if (user.avatar) {
    const publicId = getPublicIdFromUrl(user.avatar);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  const result = await uploadAvatar(req.file.buffer);

  user.avatar = result.secure_url;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    avatar: result.secure_url,
    user,
  });
});

/**
 * @desc    Get notifications
 * @route   GET /api/users/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = user.notifications.length;
  const unread = user.notifications.filter((n) => !n.read).length;
  const notifications = user.notifications.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    total,
    unread,
    page,
    pages: Math.ceil(total / limit),
    notifications,
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/users/notifications/:id/read
 * @access  Private
 */
const markNotificationRead = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (req.params.id === 'all') {
    user.notifications.forEach((n) => { n.read = true; });
  } else {
    const notification = user.notifications.id(req.params.id);
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }
    notification.read = true;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Notification(s) marked as read',
  });
});

/**
 * @desc    Delete account
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Require password confirmation if not Google auth
  if (user.password) {
    if (!password) {
      return next(new AppError('Please provide your password to delete your account', 400));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError('Incorrect password', 401));
    }
  }

  // Soft delete: deactivate instead of hard delete
  user.isActive = false;
  user.email = `deleted_${user._id}_${user.email}`;
  await user.save({ validateBeforeSave: false });

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully.',
  });
});

/**
 * @desc    Get user's dashboard stats
 * @route   GET /api/users/stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalProjects, activeProjects, completedProjects] = await Promise.all([
    Project.countDocuments({ owner: userId }),
    Project.countDocuments({ owner: userId, status: 'active' }),
    Project.countDocuments({ owner: userId, status: 'completed' }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalProjects,
      activeProjects,
      completedProjects,
      draftProjects: totalProjects - activeProjects - completedProjects,
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadUserAvatar,
  getNotifications,
  markNotificationRead,
  deleteAccount,
  getDashboardStats,
};
