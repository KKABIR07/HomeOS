const cloudinary = require('../config/cloudinary');
const { AppError } = require('../middleware/errorHandler');

/**
 * Upload a buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'houseos',
        transformation: options.transformation || [],
        resource_type: options.resource_type || 'auto',
        allowed_formats: options.allowed_formats || ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        ...options,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new AppError('Image upload failed. Please try again.', 500));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by public_id
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return null;
  }
};

/**
 * Extract public_id from a Cloudinary URL
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  const parts = url.split('/');
  const uploadIndex = parts.findIndex((p) => p === 'upload');
  if (uploadIndex === -1) return null;
  const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
  return pathAfterUpload.replace(/\.[^/.]+$/, '');
};

/**
 * Upload avatar with optimization
 */
const uploadAvatar = async (buffer) => {
  return uploadToCloudinary(buffer, {
    folder: 'houseos/avatars',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload project thumbnail
 */
const uploadThumbnail = async (buffer) => {
  return uploadToCloudinary(buffer, {
    folder: 'houseos/thumbnails',
    transformation: [
      { width: 800, height: 600, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload portfolio image
 */
const uploadPortfolioImage = async (buffer) => {
  return uploadToCloudinary(buffer, {
    folder: 'houseos/portfolio',
    transformation: [
      { width: 1200, height: 900, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload attachment (document or image)
 */
const uploadAttachment = async (buffer, resourceType = 'auto') => {
  return uploadToCloudinary(buffer, {
    folder: 'houseos/attachments',
    resource_type: resourceType,
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  uploadAvatar,
  uploadThumbnail,
  uploadPortfolioImage,
  uploadAttachment,
};
