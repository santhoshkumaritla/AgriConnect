import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ActionMessage from '../components/ui/ActionMessage';
import { useFormFeedback } from '../hooks/useFormFeedback';

const FarmerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const feedback = useFormFeedback();

  const { data: farmer } = useQuery({
    queryKey: ['farmer', id],
    queryFn: async () => (await api.get(`/users/${id}`)).data.user,
  });

  const { data: farms } = useQuery({
    queryKey: ['farms'],
    queryFn: async () => (await api.get('/farms')).data.farms || [],
  });

  const farm = farms?.find((f) => f.farmerId?._id === id || f.farmerId === id);

  const followMutation = useMutation({
    mutationFn: () => api.post('/users/me/following', { farmerId: id }),
    onSuccess: () => {
      feedback.showSuccess('You are now following this farmer!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => feedback.showError(err, 'Could not follow farmer.'),
  });

  if (!farmer) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title={farmer.name} subtitle="Farmer profile" />
      <Card className="space-y-3">
        <p className="text-sm text-slate-500">{farmer.address || 'No address listed'}</p>
        {user?.role === 'consumer' && (
          <>
            <Button
              variant="outline"
              disabled={followMutation.isPending}
              onClick={() => followMutation.mutate()}
            >
              {followMutation.isPending ? 'Following...' : 'Follow farmer'}
            </Button>
            <ActionMessage success={feedback.success} error={feedback.error} />
          </>
        )}
      </Card>
      {farm && (
        <Card>
          <h3 className="font-semibold">{farm.farmName}</h3>
          <p className="text-sm text-slate-500">
            {farm.location} · {farm.area} acres · {farm.soilType}
          </p>
        </Card>
      )}
    </div>
  );
};

export default FarmerProfile;
