const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Remove password from output
  const userResponse = user.toObject ? user.toObject() : { ...user };
  delete userResponse.password;
  delete userResponse.emailVerificationToken;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpires;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: userResponse,
  });
};

module.exports = { generateToken, sendTokenResponse };
