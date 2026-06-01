import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import api from '../../services/api';

const ForgotPassword = () => {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async ({ email }) => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'Check your email for a reset token.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Forgot password</h1>
          <p className="text-sm text-slate-500">We will send a reset token to your email.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email', { required: true })} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-brand-green">{message}</p>}
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
        <p className="text-sm text-slate-500">
          <Link to="/reset-password" className="font-semibold text-brand-green">
            Already have a token?
          </Link>
          {' · '}
          <Link to="/login" className="font-semibold text-brand-green">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default ForgotPassword;
