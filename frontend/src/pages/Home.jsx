import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../config/roleAccess';

/** Marketing landing — only for guests. Logged-in users go to their dashboard. */
const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return (
    <div className="flex flex-col gap-12">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-r from-brand-green via-emerald-600 to-emerald-700 px-8 py-12 text-white"
      >
        <p className="text-sm uppercase tracking-wide text-emerald-100">
          Full-stack Agriculture Platform
        </p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
          Fresh produce, direct from farm to table.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-emerald-100">
          Register as a farmer, consumer, expert, delivery partner, or equipment owner. Each role
          gets its own dashboard and tools.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/login">
            <Button>Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">Create account</Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
