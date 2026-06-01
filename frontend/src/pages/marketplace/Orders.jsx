import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ActionMessage from '../../components/ui/ActionMessage';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getApiError } from '../../utils/apiError';

const STATUS_STEPS = ['pending', 'accepted', 'packed', 'out_for_delivery', 'delivered'];
const FARMER_STEPS = ['pending', 'accepted', 'packed'];

const OrderTimeline = ({ status }) => {
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {STATUS_STEPS.map((step, i) => (
        <span
          key={step}
          className={`rounded-full px-2 py-0.5 text-xs capitalize ${
            i <= idx ? 'bg-brand-green/20 text-brand-green' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
          }`}
        >
          {step.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );
};

const Orders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [orderFeedback, setOrderFeedback] = useState({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.orders || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: (_, { id, status }) => {
      setOrderFeedback((s) => ({
        ...s,
        [id]: {
          type: 'success',
          text: status === 'cancelled' ? 'Order cancelled.' : `Order marked as ${status.replace(/_/g, ' ')}.`,
        },
      }));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
    onError: (err, { id }) => {
      setOrderFeedback((s) => ({
        ...s,
        [id]: { type: 'error', text: getApiError(err, 'Could not update order.') },
      }));
    },
  });

  const nextStatus = (current, role) => {
    const steps = role === 'farmer' ? FARMER_STEPS : STATUS_STEPS;
    const i = steps.indexOf(current);
    return i >= 0 && i < steps.length - 1 ? steps[i + 1] : null;
  };

  if (error) {
    return <p className="text-sm text-red-500">Failed to load orders. Is the backend running?</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Live data from MongoDB with status timeline." />
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading orders...</p>
      ) : !data?.length ? (
        <p className="text-sm text-slate-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((order) => (
            <Card key={order._id} className="space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Order #{order._id.slice(-6)} · ₹{order.amount}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.role === 'consumer' && order.farmerId?.name && `Farmer: ${order.farmerId.name}`}
                    {user?.role === 'farmer' && order.consumerId?.name && `Customer: ${order.consumerId.name}`}
                    {user?.role === 'delivery' && order.consumerId?.name && `Deliver to: ${order.consumerId.name}`}
                  </p>
                </div>
                <span className="text-sm capitalize text-brand-green">{order.status}</span>
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-300">
                {order.products?.map((p, i) => (
                  <li key={i}>
                    {p.title} × {p.quantity} kg — ₹{(p.price * p.quantity).toFixed(0)}
                  </li>
                ))}
              </ul>
              {order.payment?.transactionId && (
                <p className="text-xs text-slate-500">Payment: {order.payment.transactionId}</p>
              )}
              <OrderTimeline status={order.status} />
              {user?.role === 'farmer' && nextStatus(order.status, 'farmer') && order.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  onClick={() => updateMutation.mutate({ id: order._id, status: nextStatus(order.status, 'farmer') })}
                >
                  Mark as {nextStatus(order.status, 'farmer').replace(/_/g, ' ')}
                </Button>
              )}
              {user?.role === 'farmer' && order.status === 'packed' && (
                <p className="text-sm text-brand-green">
                  Sent to delivery partners — they will claim and deliver this order.
                </p>
              )}
              {user?.role === 'consumer' && order.status === 'pending' && (
                <Button
                  variant="outline"
                  disabled={updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ id: order._id, status: 'cancelled' })}
                >
                  Cancel order
                </Button>
              )}
              {orderFeedback[order._id] && (
                <ActionMessage
                  success={orderFeedback[order._id].type === 'success' ? orderFeedback[order._id].text : ''}
                  error={orderFeedback[order._id].type === 'error' ? orderFeedback[order._id].text : ''}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
