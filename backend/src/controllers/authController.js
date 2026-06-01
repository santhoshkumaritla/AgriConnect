const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { ROLES } = require('../utils/constants');
const {
  signAccessToken,
  signRefreshToken,
  generateRandomToken,
} = require('../services/tokenService');
const { sendEmail } = require('../services/emailService');

const sanitizeUser = (user) => {
  const data = user.toObject();
  delete data.passwordHash;
  delete data.emailVerificationToken;
  delete data.resetPasswordToken;
  delete data.resetPasswordExpires;
  return data;
};

const createRefreshToken = async (user) => {
  const tokenId = generateRandomToken();
  const refreshToken = signRefreshToken(user, tokenId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt });
  return refreshToken;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (role && role === ROLES.ADMIN) {
      return res.status(403).json({ message: 'Admin registration is not allowed' });
    }
    if (role && !Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailVerificationToken = generateRandomToken();
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || ROLES.CONSUMER,
      emailVerificationToken,
    });

    await sendEmail({
      to: email,
      subject: 'Verify your AgriConnect AI account',
      html: `<p>Your verification token: <strong>${emailVerificationToken}</strong></p>`,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    return res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    return res.json({ user: sanitizeUser(user), accessToken, refreshToken });
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    const tokenRecord = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenRecord) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const payload = require('jsonwebtoken').verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const accessToken = signAccessToken(user);
    return res.json({ accessToken });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    return res.json({ message: 'Logged out' });
  } catch (error) {
    return next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    return res.json({ message: 'Email verified' });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If the email exists, a reset token has been sent' });
    }
    const resetToken = generateRandomToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Reset your AgriConnect AI password',
      html: `<p>Your reset token: <strong>${resetToken}</strong></p>`,
    });

    return res.json({ message: 'Password reset token sent' });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};
