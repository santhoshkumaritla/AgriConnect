import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  getDashboardPath,
  getNavItemsForRole,
  getRoleLabel,
  normalizeRole,
  rolePath,
} from '../config/roleAccess';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [darkMode, setDarkMode] = useState(false);

  const role = normalizeRole(user?.role);
  const navItems = user ? getNavItemsForRole(role) : [];
  const dashboardPath = user ? getDashboardPath(role) : '/login';
  const profilePath = user ? rolePath(role, 'profile') : '/login';
  const alertsPath = user ? rolePath(role, 'notifications') : '/login';

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={dashboardPath} className="shrink-0 text-lg font-bold text-brand-green">
              AgriConnect AI
            </Link>
            {user && (
              <span className="hidden rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-medium text-brand-green sm:inline">
                {getRoleLabel(role)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <Link to={alertsPath} className="text-sm text-slate-600 dark:text-slate-200">
                  Alerts
                </Link>
                <Link to={profilePath} className="text-sm text-slate-600 dark:text-slate-200">
                  Profile
                </Link>
              </>
            )}
            <Button variant="ghost" onClick={toggleTheme}>
              {darkMode ? 'Light' : 'Dark'}
            </Button>
            {user ? (
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>

        {user && navItems.length > 0 && (
          <nav className="mt-3 flex gap-1 overflow-x-auto border-t border-slate-100 pt-3 dark:border-slate-800">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
                {item.to.endsWith('/cart') && count > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-green px-1 text-[10px] text-white">
                    {count}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
