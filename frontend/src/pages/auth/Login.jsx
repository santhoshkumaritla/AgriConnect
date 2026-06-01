import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath, normalizeRole } from '../../config/roleAccess';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const { user, loading, login } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!loading && user) {
    return <Navigate to={getDashboardPath(normalizeRole(user.role))} replace />;
  }

  const onSubmit = async (values) => {
    setError('');
    try {
      const data = await login(values);
      navigate(getDashboardPath(normalizeRole(data.user.role)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to login');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-500">Login to manage your AgriConnect AI account.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email', { required: true })} />
          <Input label="Password" type="password" {...register('password', { required: true })} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <p className="text-sm text-slate-500">
          <Link to="/forgot-password" className="font-semibold text-brand-green">
            Forgot password?
          </Link>
        </p>
        <p className="text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-green">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
