import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessRoute, getDashboardPath, normalizeRole } from '../config/roleAccess';

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const role = normalizeRole(user.role);
  const allowed = roles
    ? roles.map(normalizeRole).includes(role)
    : canAccessRoute(location.pathname, role);

  if (!allowed) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
