import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket';

const Notifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.notifications || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket(user._id);
    socket.on('notification:receive', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => socket.off('notification:receive');
  }, [user, queryClient]);

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Orders, deliveries, consultations, and system alerts." />
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : !data?.length ? (
        <p className="text-sm text-slate-500">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((n) => (
            <Card
              key={n._id}
              className={`cursor-pointer ${!n.isRead ? 'border-brand-green/40' : ''}`}
              onClick={() => !n.isRead && markRead.mutate(n._id)}
            >
              <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
              <p className="text-sm text-slate-500">{n.description}</p>
              {!n.isRead && <span className="text-xs text-brand-green">New</span>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
