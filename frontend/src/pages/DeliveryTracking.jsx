import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ActionMessage from '../components/ui/ActionMessage';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../utils/apiError';

const DeliveryTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFeedback, setStatusFeedback] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => (await api.get('/deliveries')).data.deliveries || [],
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/deliveries/${id}/status`, { status }),
    onSuccess: (_, { id, status }) => {
      setStatusFeedback((s) => ({
        ...s,
        [id]: { type: 'success', text: `Status updated to ${status.replace(/_/g, ' ')}.` },
      }));
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
    onError: (err, { id }) => {
      setStatusFeedback((s) => ({
        ...s,
        [id]: { type: 'error', text: getApiError(err, 'Could not update status.') },
      }));
    },
  });

  const statusFlow = ['assigned', 'picked_up', 'in_transit', 'delivered'];

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery tracking" subtitle="Delivery records linked to orders in MongoDB." />
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : !data?.length ? (
        <p className="text-sm text-slate-500">No deliveries yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((d) => (
            <Card key={d._id}>
              <p className="font-medium">Delivery #{d._id.slice(-6)}</p>
              <p className="text-sm capitalize text-slate-500">Status: {d.status}</p>
              {d.orderId && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Order #{String(d.orderId._id || d.orderId).slice(-6)} · ₹{d.orderId.amount}
                  {d.orderId.consumerId?.name && ` → ${d.orderId.consumerId.name}`}
                  {d.orderId.consumerId?.address && ` · ${d.orderId.consumerId.address}`}
                </p>
              )}
              {d.eta && <p className="text-sm text-slate-500">ETA: {new Date(d.eta).toLocaleString()}</p>}
              {d.history?.length > 0 && (
                <ul className="mt-2 text-xs text-slate-500">
                  {d.history.map((h, i) => (
                    <li key={i} className="capitalize">
                      {h.status} — {new Date(h.timestamp || h.at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              )}
              {user?.role === 'delivery' && (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {statusFlow.map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: d._id, status: s })}
                      >
                        {s.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                  {statusFeedback[d._id] && (
                    <ActionMessage
                      success={statusFeedback[d._id].type === 'success' ? statusFeedback[d._id].text : ''}
                      error={statusFeedback[d._id].type === 'error' ? statusFeedback[d._id].text : ''}
                    />
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;
