import { useAuth } from '../context/AuthContext';
import { normalizeRole, rolePath } from '../config/roleAccess';

/** Build paths under the current user's role prefix, e.g. /consumer/cart */
export const useRolePath = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  const rp = (...parts) => rolePath(role, ...parts);

  return { role, rp, dashboard: () => rolePath(role, 'dashboard') };
};

export default useRolePath;
