const nodemailer = require('nodemailer');

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Base email template wrapper
 */
const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HouseOS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: #94a3b8; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px 32px; }
    .body p { color: #374151; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: #4f46e5; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .code { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 24px; font-family: monospace; font-size: 18px; font-weight: 700; color: #1f2937; letter-spacing: 4px; text-align: center; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HouseOS</h1>
      <p>AI-Powered Architecture Builder</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} HouseOS. All rights reserved.</p>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'HouseOS'} <${process.env.FROM_EMAIL || 'noreply@houseos.com'}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failures shouldn't break the API flow
    return null;
  }
};

/**
 * Send email verification
 */
const sendVerificationEmail = async (user, verificationUrl) => {
  const content = `
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Welcome to HouseOS! We're excited to have you on board.</p>
    <p>Please verify your email address to activate your account and start building your dream home.</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    </div>
    <p style="color: #9ca3af; font-size: 13px;">This link expires in 24 hours. If you can't click the button, copy and paste this URL into your browser:</p>
    <p style="color: #4f46e5; font-size: 13px; word-break: break-all;">${verificationUrl}</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Verify your HouseOS account',
    html: emailTemplate(content),
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const content = `
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>You requested to reset your password. Click the button below to create a new password.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="color: #ef4444; font-size: 13px;"><strong>This link expires in 1 hour.</strong></p>
    <p style="color: #9ca3af; font-size: 13px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <p style="color: #4f46e5; font-size: 13px; word-break: break-all;">Or copy this URL: ${resetUrl}</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Reset your HouseOS password',
    html: emailTemplate(content),
  });
};

/**
 * Send welcome email after verification
 */
const sendWelcomeEmail = async (user) => {
  const content = `
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Your email has been verified! Your HouseOS account is now fully activated.</p>
    <p>Here's what you can do now:</p>
    <ul>
      <li>Create your first house project</li>
      <li>Use AI to generate floor plans</li>
      <li>Get instant cost estimates</li>
      <li>Connect with professional architects</li>
    </ul>
    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to Dashboard</a>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to HouseOS!',
    html: emailTemplate(content),
  });
};

/**
 * Send hire request notification to architect
 */
const sendHireNotification = async (architect, requester, project) => {
  const content = `
    <p>Hi <strong>${architect.name}</strong>,</p>
    <p><strong>${requester.name}</strong> has sent you a hire request for their project.</p>
    <p><strong>Project:</strong> ${project.projectName}</p>
    <p><strong>Location:</strong> ${project.location || 'Not specified'}</p>
    <p><strong>Budget:</strong> ${project.budget ? `₹${project.budget.toLocaleString('en-IN')}` : 'Not specified'}</p>
    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/messages" class="btn">View Request</a>
    </div>
  `;

  return sendEmail({
    to: architect.email,
    subject: `New hire request from ${requester.name} — HouseOS`,
    html: emailTemplate(content),
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendHireNotification,
};
