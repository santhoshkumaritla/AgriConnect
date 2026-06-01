/** Role URL prefixes and path helpers — every route lives under /{role-prefix}/... */

export const ROLE_PREFIX = {
  consumer: 'consumer',
  farmer: 'farmer',
  expert: 'expert',
  delivery: 'delivery-partner',
  equipment_owner: 'equipment-owner',
  admin: 'admin',
};

export const PREFIX_TO_ROLE = Object.fromEntries(
  Object.entries(ROLE_PREFIX).map(([role, prefix]) => [prefix, role])
);

export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/unauthorized',
];

/** Legacy paths → segment(s) to redirect under current role */
export const LEGACY_REDIRECTS = {
  '/dashboard': 'dashboard',
  '/marketplace': 'marketplace',
  '/cart': 'cart',
  '/wishlist': 'wishlist',
  '/orders': 'orders',
  '/chat': 'chat',
  '/profile': 'profile',
  '/notifications': 'notifications',
  '/payment': 'payment',
  '/equipment': 'equipment',
  '/consultations': 'consultations',
  '/forum': 'forum',
  '/ai': 'ai',
  '/education': 'education',
  '/analytics': 'analytics',
  '/delivery-tracking': 'deliveries',
  '/farmer/products': 'products',
  '/farmer/farm': 'farm',
};

export const normalizeRole = (role) => {
  const r = String(role || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
  if (r === 'equipmentowner') return 'equipment_owner';
  if (r === 'delivery_partner' || r === 'deliverypartner') return 'delivery';
  return r;
};

export const rolePath = (role, ...parts) => {
  const prefix = ROLE_PREFIX[normalizeRole(role)];
  if (!prefix) return '/login';
  const segments = parts.filter((p) => p != null && p !== '');
  return '/' + [prefix, ...segments].join('/');
};

export const getDashboardPath = (role) => rolePath(role, 'dashboard');

/** Path segments allowed under each role's URL prefix */
export const ROLE_SEGMENTS = {
  consumer: [
    'dashboard',
    'marketplace',
    'cart',
    'wishlist',
    'orders',
    'chat',
    'payment',
    'profile',
    'notifications',
    'farmers',
  ],
  farmer: [
    'dashboard',
    'marketplace',
    'products',
    'farm',
    'equipment',
    'consultations',
    'orders',
    'chat',
    'ai',
    'profile',
    'notifications',
    'farmers',
  ],
  expert: ['dashboard', 'consultations', 'education', 'chat', 'profile', 'notifications'],
  delivery: ['dashboard', 'deliveries', 'orders', 'chat', 'profile', 'notifications'],
  equipment_owner: ['dashboard', 'equipment', 'profile', 'notifications'],
  admin: ['dashboard', 'analytics', 'forum', 'profile', 'notifications'],
};

/** Nav menu: segment keys only */
export const ROLE_NAV_SEGMENTS = {
  consumer: ['marketplace', 'cart', 'wishlist', 'orders', 'chat'],
  farmer: [
    'marketplace',
    'products',
    'farm',
    'equipment',
    'consultations',
    'orders',
    'chat',
    'ai',
  ],
  expert: ['consultations', 'education', 'chat'],
  delivery: ['deliveries', 'orders', 'chat'],
  equipment_owner: ['equipment'],
  admin: ['analytics', 'forum'],
};

const NAV_LABELS = {
  dashboard: 'Dashboard',
  marketplace: 'Marketplace',
  cart: 'Cart',
  wishlist: 'Wishlist',
  orders: 'Orders',
  chat: 'Chat',
  products: 'My Products',
  farm: 'Farm',
  equipment: 'Equipment',
  consultations: 'Consultations',
  ai: 'AI Lab',
  education: 'Education',
  deliveries: 'Deliveries',
  analytics: 'Analytics',
  profile: 'Profile',
  notifications: 'Alerts',
};

export const getNavItemsForRole = (role) => {
  const r = normalizeRole(role);
  const segments = ROLE_NAV_SEGMENTS[r] || [];
  return segments.map((segment) => ({
    label: NAV_LABELS[segment] || segment,
    to: rolePath(r, segment),
  }));
};

export const getRoleLabel = (role) => {
  const labels = {
    consumer: 'Consumer',
    farmer: 'Farmer',
    expert: 'Expert',
    delivery: 'Delivery Partner',
    equipment_owner: 'Equipment Owner',
    admin: 'Admin',
  };
  return labels[normalizeRole(role)] || 'User';
};

export const isPublicPath = (pathname) => {
  const path = pathname.split('?')[0];
  return PUBLIC_PATHS.includes(path);
};

export const parseRolePath = (pathname) => {
  const path = pathname.split('?')[0];
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  const role = PREFIX_TO_ROLE[parts[0]];
  if (!role) return null;
  const rest = parts.slice(1).join('/');
  const segment = parts[1] || 'dashboard';
  return { role, prefix: parts[0], segment, rest };
};

export const getLegacyRedirect = (pathname) => {
  const path = pathname.split('?')[0];
  if (LEGACY_REDIRECTS[path]) return LEGACY_REDIRECTS[path];
  if (path.startsWith('/marketplace/')) return `marketplace/${path.split('/marketplace/')[1]}`;
  if (path.startsWith('/farmers/')) return `farmers/${path.split('/farmers/')[1]}`;
  if (path.startsWith('/payment/')) return `payment/${path.split('/payment/')[1]}`;
  return null;
};

export const canAccessRoute = (pathname, userRole) => {
  const path = pathname.split('?')[0];
  const r = normalizeRole(userRole);

  if (!r) return isPublicPath(path);
  if (isPublicPath(path)) return true;

  const parsed = parseRolePath(path);
  if (!parsed) return false;
  if (parsed.role !== r) return false;

  const allowed = ROLE_SEGMENTS[r] || [];
  return allowed.some((s) => parsed.rest === s || parsed.rest.startsWith(`${s}/`));
};
