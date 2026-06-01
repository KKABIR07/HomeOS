const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

// Memory storage — files go to Cloudinary, not disk
const storage = multer.memoryStorage();

/**
 * File filter — only allow images
 */
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpeg, jpg, png, gif, webp) are allowed', 400), false);
  }
};

/**
 * File filter — allow PDFs and images
 */
const documentFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype =
    allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files and PDFs are allowed', 400), false);
  }
};

/**
 * Avatar upload — single image, 5MB max
 */
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
}).single('avatar');

/**
 * Portfolio image upload — single image, 10MB max
 */
const uploadPortfolioImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFilter,
}).single('image');

/**
 * Multiple attachments — up to 5 files, 10MB each
 */
const uploadAttachments = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
}).array('attachments', 5);

/**
 * Multer error handler wrapper
 */
const handleMulterError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File too large. Maximum size allowed.', 400));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new AppError('Too many files uploaded at once.', 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);
    next();
  });
};

module.exports = {
  uploadAvatar: handleMulterError(uploadAvatar),
  uploadPortfolioImage: handleMulterError(uploadPortfolioImage),
  uploadAttachments: handleMulterError(uploadAttachments),
};
