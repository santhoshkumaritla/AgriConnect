/** Normalize origin URLs for comparison (no trailing slash). */
const normalizeOrigin = (url) => (url ? url.trim().replace(/\/$/, '') : '');

const isNetlifyApp = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'netlify.app' || hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
};

const parseAllowedOrigins = () => {
  const raw = process.env.CLIENT_ORIGIN || '';
  const fromEnv = raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  const extras = [process.env.NETLIFY_URL, process.env.FRONTEND_URL]
    .map(normalizeOrigin)
    .filter(Boolean);

  return [...new Set([...fromEnv, ...extras])];
};

const allowedOrigins = parseAllowedOrigins();

const isOriginAllowed = (requestOrigin) => {
  if (!requestOrigin) return true;
  if (allowedOrigins.length === 0) return true;
  if (allowedOrigins.includes(requestOrigin)) return true;
  // Allow any Netlify site unless explicitly disabled
  if (process.env.DISALLOW_NETLIFY !== 'true' && isNetlifyApp(requestOrigin)) {
    return true;
  }
  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const requestOrigin = normalizeOrigin(origin);

    if (isOriginAllowed(requestOrigin)) {
      return callback(null, requestOrigin);
    }

    console.warn(
      `CORS blocked origin: ${origin}. Set CLIENT_ORIGIN on Render. Allowed list: ${allowedOrigins.join(', ')}`
    );
    // Never pass Error — that causes 500 on preflight with no CORS headers
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

const logCorsConfig = () => {
  console.log('CORS allowed origins:', allowedOrigins.join(', '));
  console.log('CORS also allows: *.netlify.app (set DISALLOW_NETLIFY=true to disable)');
};

module.exports = { corsOptions, allowedOrigins, logCorsConfig, normalizeOrigin, isNetlifyApp };
