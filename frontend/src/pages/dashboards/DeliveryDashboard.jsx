import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import useRolePath from '../../hooks/useRolePath';

const DeliveryDashboard = () => {
  const { rp } = useRolePath();
  const { data } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => (await api.get('/deliveries')).data.deliveries || [],
  });

  const active = data?.filter((d) => d.status !== 'delivered').length ?? 0;
  const completed = data?.filter((d) => d.status === 'delivered').length ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Delivery Dashboard"
        subtitle="Claim packed orders from farmers, then deliver to customers."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active deliveries" value={active} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="Earnings" value="—" helper="Track in production" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to={rp('deliveries')}>
          <Button>Update deliveries</Button>
        </Link>
        <Link to={rp('orders')}>
          <Button variant="outline">View orders</Button>
        </Link>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
