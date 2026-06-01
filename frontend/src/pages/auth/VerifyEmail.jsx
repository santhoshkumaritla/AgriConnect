import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../config/roleAccess';

const VerifyEmail = () => {
  const { user } = useAuth();
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async ({ token }) => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/verify-email', { token });
      setMessage(data.message || 'Email verified successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Verify email</h1>
          <p className="text-sm text-slate-500">Enter the verification token sent to your inbox.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Verification token" {...register('token', { required: true })} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-brand-green">{message}</p>}
          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>
        <Link
          to={user ? getDashboardPath(user.role) : '/login'}
          className="text-sm font-semibold text-brand-green"
        >
          Go to dashboard
        </Link>
      </Card>
    </div>
  );
};

export default VerifyEmail;
