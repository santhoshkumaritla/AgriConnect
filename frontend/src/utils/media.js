const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const UPLOAD_BASE = API_BASE.replace(/\/api\/?$/, '');

export const imageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${UPLOAD_BASE}${path}`;
};
