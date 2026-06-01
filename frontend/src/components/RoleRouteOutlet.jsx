import { Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { rolePath } from '../config/roleAccess';

const RoleRouteOutlet = ({ role }) => (
  <ProtectedRoute roles={[role]}>
    <Outlet />
  </ProtectedRoute>
);

export const RoleIndexRedirect = ({ role }) => (
  <Navigate to={rolePath(role, 'dashboard')} replace />
);

export default RoleRouteOutlet;
