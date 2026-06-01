/** Normalize origin URLs for comparison (no trailing slash). */
const normalizeOrigin = (url) => (url ? url.trim().replace(/\/$/, '') : '');

const parseAllowedOrigins = () => {
  const raw = process.env.CLIENT_ORIGIN || '';
  const fromEnv = raw
    .split(/[,\s]+/)
    .map(normalizeOrigin)
    .filter(Boolean);

  const extras = [process.env.NETLIFY_URL, process.env.FRONTEND_URL]
    .map(normalizeOrigin)
    .filter(Boolean);

  return [...new Set([...fromEnv, ...extras])];
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    // Server-to-server, Postman, health checks
    if (!origin) {
      return callback(null, true);
    }

    const requestOrigin = normalizeOrigin(origin);

    // No CLIENT_ORIGIN set — allow all (dev only; set CLIENT_ORIGIN in production)
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(requestOrigin)) {
      return callback(null, requestOrigin);
    }

    console.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

const logCorsConfig = () => {
  if (allowedOrigins.length === 0) {
    console.warn('CLIENT_ORIGIN is empty — CORS allows all origins. Set CLIENT_ORIGIN on Render.');
  } else {
    console.log('CORS allowed origins:', allowedOrigins.join(', '));
  }
};

module.exports = { corsOptions, allowedOrigins, logCorsConfig, normalizeOrigin };
