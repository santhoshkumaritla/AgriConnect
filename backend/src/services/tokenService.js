const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' }
  );

const signRefreshToken = (user, tokenId) =>
  jwt.sign(
    { sub: user._id.toString(), tid: tokenId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_TTL || '7d' }
  );

const generateRandomToken = () => crypto.randomBytes(24).toString('hex');

module.exports = { signAccessToken, signRefreshToken, generateRandomToken };
