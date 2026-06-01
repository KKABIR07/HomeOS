/**
 * Validates an email address
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password (min 8 chars, at least one letter and one number)
 */
const isValidPassword = (password) => {
  return password && password.length >= 8;
};

/**
 * Validates a phone number (basic)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Sanitizes a string (trims and removes dangerous chars)
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validates MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Validates plot dimensions
 */
const isValidDimension = (value) => {
  return typeof value === 'number' && value > 0 && value < 10000;
};

/**
 * Validates budget
 */
const isValidBudget = (value) => {
  return typeof value === 'number' && value >= 0;
};

/**
 * Validates house style enum
 */
const isValidHouseStyle = (style) => {
  const styles = ['modern', 'luxury', 'contemporary', 'traditional', 'minimalist'];
  return styles.includes(style);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  sanitizeString,
  isValidObjectId,
  isValidDimension,
  isValidBudget,
  isValidHouseStyle,
};
