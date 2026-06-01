import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import api from '../../services/api';

const ResetPassword = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    setError('');
    try {
      await api.post('/auth/reset-password', {
        token: values.token,
        password: values.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset password</h1>
          <p className="text-sm text-slate-500">Enter the token from your email and a new password.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Reset token" {...register('token', { required: true })} />
          <Input label="New password" type="password" {...register('password', { required: true })} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            Reset password
          </Button>
        </form>
        <Link to="/login" className="text-sm font-semibold text-brand-green">
          Back to login
        </Link>
      </Card>
    </div>
  );
};

export default ResetPassword;
