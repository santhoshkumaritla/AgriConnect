import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath, normalizeRole } from '../../config/roleAccess';

const roleOptions = [
  { value: 'consumer', label: 'Consumer' },
  { value: 'farmer', label: 'Farmer' },
  { value: 'expert', label: 'Agricultural Expert' },
  { value: 'delivery', label: 'Delivery Partner' },
  { value: 'equipment_owner', label: 'Equipment Owner' },
];

const Register = () => {
  const { register, handleSubmit } = useForm();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    setError('');
    try {
      const data = await registerUser(values);
      navigate(getDashboardPath(normalizeRole(data.user.role)));
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) {
        setError(msg || 'This email is already registered. Please log in instead.');
      } else if (!err?.response) {
        setError('Cannot reach server. Check your connection or try again in a minute (Render may be waking up).');
      } else {
        setError(msg || 'Unable to register');
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-sm text-slate-500">Join the AgriConnect AI ecosystem.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('name', { required: true })} />
          <Input label="Email" type="email" {...register('email', { required: true })} />
          <Input label="Password" type="password" {...register('password', { required: true })} />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
            Role
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('role', { required: true })}
              defaultValue="consumer"
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-green">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
