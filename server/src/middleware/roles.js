const AppError = require('./errorHandler').AppError;

/**
 * Authorize by role(s)
 * Usage: authorize('admin', 'architect')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this route. Required: ${roles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check if user is verified architect
 */
const requireVerifiedArchitect = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (req.user.role !== 'architect' && req.user.role !== 'admin') {
      return next(new AppError('Only architects can access this route', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check subscription tier
 */
const requirePlan = (...plans) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const userPlan = req.user.subscription?.plan || 'free';

    if (!plans.includes(userPlan)) {
      return next(
        new AppError(
          `This feature requires one of the following plans: ${plans.join(', ')}. Your current plan is '${userPlan}'.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorize, requireVerifiedArchitect, requirePlan };
