import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ActionMessage from '../components/ui/ActionMessage';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../../utils/apiError';

const DELIVERY_FLOW = ['assigned', 'picked_up', 'in_transit', 'delivered'];

const nextDeliveryStatus = (current) => {
  const i = DELIVERY_FLOW.indexOf(current);
  return i >= 0 && i < DELIVERY_FLOW.length - 1 ? DELIVERY_FLOW[i + 1] : null;
};

const DeliveryCard = ({
  d,
  user,
  isMine,
  onClaim,
  onAdvance,
  claimPending,
  advancePending,
  feedback,
}) => {
  const order = d.orderId;
  const orderId = order?._id || d.orderId;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap justify-between gap-2">
        <p className="font-medium">Delivery #{d._id.slice(-6)}</p>
        <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-xs capitalize text-brand-green">
          {d.status?.replace(/_/g, ' ')}
        </span>
      </div>
      {order && (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Order #{String(orderId).slice(-6)} · ₹{order.amount}
          </p>
          <p className="text-sm">
            <strong>Deliver to:</strong> {order.consumerId?.name || 'Customer'}
            {order.consumerId?.phone && ` · ${order.consumerId.phone}`}
          </p>
          {order.consumerId?.address && (
            <p className="text-sm text-slate-500">{order.consumerId.address}</p>
          )}
          <p className="text-xs text-slate-500">
            From farmer: {order.farmerId?.name || '—'}
          </p>
          <ul className="text-xs text-slate-500">
            {order.products?.map((p, i) => (
              <li key={i}>
                {p.title} × {p.quantity} kg
              </li>
            ))}
          </ul>
        </>
      )}
      {user?.role === 'delivery' && !isMine && (
        <Button disabled={claimPending} onClick={() => onClaim(d._id)}>
          {claimPending ? 'Claiming...' : 'Claim this job'}
        </Button>
      )}
      {user?.role === 'delivery' && isMine && nextDeliveryStatus(d.status) && (
        <Button
          variant="outline"
          disabled={advancePending}
          onClick={() => onAdvance(d._id, nextDeliveryStatus(d.status))}
        >
          Mark as {nextDeliveryStatus(d.status).replace(/_/g, ' ')}
        </Button>
      )}
      {feedback && (
        <ActionMessage
          success={feedback.type === 'success' ? feedback.text : ''}
          error={feedback.type === 'error' ? feedback.text : ''}
        />
      )}
    </Card>
  );
};

const DeliveryTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const res = await api.get('/deliveries');
      return {
        available: res.data.available || [],
        mine: res.data.mine || res.data.deliveries || [],
      };
    },
    enabled: !!user,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const claimMutation = useMutation({
    mutationFn: (id) => api.patch(`/deliveries/${id}/claim`),
    onSuccess: (_, id) => {
      setFeedback((s) => ({ ...s, [id]: { type: 'success', text: 'Job claimed! Update status below.' } }));
      refresh();
    },
    onError: (err, id) => {
      setFeedback((s) => ({ ...s, [id]: { type: 'error', text: getApiError(err, 'Could not claim.') } }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/deliveries/${id}/status`, { status }),
    onSuccess: (_, { id, status }) => {
      setFeedback((s) => ({
        ...s,
        [id]: { type: 'success', text: `Updated to ${status.replace(/_/g, ' ')}.` },
      }));
      refresh();
    },
    onError: (err, id) => {
      setFeedback((s) => ({ ...s, [id]: { type: 'error', text: getApiError(err, 'Could not update.') } }));
    },
  });

  const isDelivery = user?.role === 'delivery';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Deliveries"
        subtitle={
          isDelivery
            ? 'Claim packed orders, then update pickup → in transit → delivered.'
            : 'Delivery jobs linked to orders.'
        }
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          {isDelivery && (
            <section className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Available jobs</h3>
              {!data?.available?.length ? (
                <Card>
                  <p className="text-sm text-slate-500">
                    No open jobs. Farmers must mark orders as <strong>packed</strong> first.
                  </p>
                </Card>
              ) : (
                data.available.map((d) => (
                  <DeliveryCard
                    key={d._id}
                    d={d}
                    user={user}
                    isMine={false}
                    onClaim={(id) => claimMutation.mutate(id)}
                    onAdvance={(id, status) => updateMutation.mutate({ id, status })}
                    claimPending={claimMutation.isPending}
                    advancePending={updateMutation.isPending}
                    feedback={feedback[d._id]}
                  />
                ))
              )}
            </section>
          )}

          <section className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {isDelivery ? 'My deliveries' : 'All deliveries'}
            </h3>
            {!data?.mine?.length ? (
              <Card>
                <p className="text-sm text-slate-500">
                  {isDelivery ? 'Claim a job above to start delivering.' : 'No deliveries yet.'}
                </p>
              </Card>
            ) : (
              data.mine.map((d) => (
                <DeliveryCard
                  key={d._id}
                  d={d}
                  user={user}
                  isMine
                  onClaim={(id) => claimMutation.mutate(id)}
                  onAdvance={(id, status) => updateMutation.mutate({ id, status })}
                  claimPending={claimMutation.isPending}
                  advancePending={updateMutation.isPending}
                  feedback={feedback[d._id]}
                />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DeliveryTracking;
