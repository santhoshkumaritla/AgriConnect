const { normalizeOrigin, isOriginAllowed } = require('../utils/corsConfig');

/** Set CORS headers on every response (including errors). */
const applyCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (!origin) return;

  const normalized = normalizeOrigin(origin);
  if (!isOriginAllowed(normalized)) return;

  res.setHeader('Access-Control-Allow-Origin', normalized);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
};

const corsMiddleware = (req, res, next) => {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  next();
};

module.exports = { corsMiddleware, applyCorsHeaders };
