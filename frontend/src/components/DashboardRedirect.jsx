import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath, normalizeRole } from '../config/roleAccess';

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(normalizeRole(user.role))} replace />;
};

export default DashboardRedirect;
