import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  canAccessRoute,
  getDashboardPath,
  getLegacyRedirect,
  isPublicPath,
  normalizeRole,
  rolePath,
  ROLE_PREFIX,
} from '../config/roleAccess';

const GlobalRoleGuard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname.split('?')[0];

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading...</div>;
  }

  if (user) {
    const role = normalizeRole(user.role);
    const prefix = ROLE_PREFIX[role];
    const legacy = getLegacyRedirect(path);
    if (legacy && prefix && !path.startsWith(`/${prefix}`)) {
      return <Navigate to={rolePath(role, ...legacy.split('/'))} replace />;
    }
  }

  if (user && !isPublicPath(path) && !canAccessRoute(path, user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
};

export default GlobalRoleGuard;
