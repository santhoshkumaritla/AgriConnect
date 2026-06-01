import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ActionMessage from '../components/ui/ActionMessage';

const Profile = () => {
  const { user, setUser: updateUser } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/users/me')).data.user,
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        profileImage: data.profileImage || '',
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (payload) => api.put('/users/me', payload),
    onSuccess: (res) => {
      updateUser(res.data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Saved to your user record in MongoDB." />
      <Card className="max-w-xl space-y-4">
        <p className="text-sm text-slate-500">
          Email: <strong>{data?.email || user?.email}</strong>
          <br />
          Role: <strong className="capitalize">{(data?.role || user?.role)?.replace('_', ' ')}</strong>
        </p>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <Input label="Full name" {...register('name')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Address" {...register('address')} />
          <Input label="Profile image URL" {...register('profileImage')} />
          <ActionMessage
            success={mutation.isSuccess ? 'Profile saved to database.' : ''}
            error={mutation.isError ? (mutation.error?.response?.data?.message || 'Update failed') : ''}
          />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
