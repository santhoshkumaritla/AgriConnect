import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import api from '../../services/api';
import useRolePath from '../../hooks/useRolePath';

const ConsumerDashboard = () => {
  const { rp } = useRolePath();

  const { data } = useQuery({
    queryKey: ['consumer-analytics'],
    queryFn: async () => (await api.get('/analytics/consumer')).data,
  });

  const actions = [
    { title: 'Browse produce', desc: 'Search and filter fresh listings', to: rp('marketplace'), primary: true },
    { title: 'Shopping cart', desc: 'Review items before checkout', to: rp('cart') },
    { title: 'Wishlist', desc: 'Saved products for later', to: rp('wishlist') },
    { title: 'My orders', desc: 'Track order status and history', to: rp('orders') },
    { title: 'Chat', desc: 'Message farmers about your orders', to: rp('chat') },
    { title: 'Profile', desc: 'Update your account details', to: rp('profile') },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Consumer Dashboard"
        subtitle="Shop fresh produce, manage orders, and chat with farmers."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total orders" value={data?.totalOrders ?? 0} />
        <StatCard label="Total spend" value={`₹${data?.totalSpent ?? 0}`} />
        <StatCard label="Saved items" value="Wishlist" helper="Products you saved" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Card key={action.to} className="flex flex-col justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{action.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{action.desc}</p>
            </div>
            <Link to={action.to}>
              <Button variant={action.primary ? 'primary' : 'outline'} className="w-full">
                Open
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConsumerDashboard;
