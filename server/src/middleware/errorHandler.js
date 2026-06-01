class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const transformError = (err) => {
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return new AppError(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      400
    );
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') return new AppError('Invalid token. Please log in again.', 401);
  if (err.name === 'TokenExpiredError') return new AppError('Token expired. Please log in again.', 401);
  return err;
};

const globalErrorHandler = (err, req, res, next) => {
  // Always transform known error types so statusCode is correct
  const error = transformError(err);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Always log server-side errors
  if (error.statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
      message: error.message,
      name: err.name,
      code: err.code,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      // include original error details in dev for debugging
      ...(error.statusCode >= 500 && { originalError: err.message, stack: err.stack }),
    });
  }

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
    });
  }

  console.error('UNHANDLED ERROR:', err);
  res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = { AppError, asyncHandler, globalErrorHandler, notFound };
