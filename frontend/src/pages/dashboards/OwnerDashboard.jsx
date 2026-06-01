import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import useRolePath from '../../hooks/useRolePath';

const OwnerDashboard = () => {
  const { rp } = useRolePath();
  const { data: equipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => (await api.get('/equipment')).data.equipment || [],
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await api.get('/bookings')).data.bookings || [],
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Equipment Owner Dashboard" subtitle="Manage rentals and availability." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Listings" value={equipment?.length ?? 0} />
        <StatCard label="Bookings" value={bookings?.length ?? 0} />
        <StatCard
          label="Pending"
          value={bookings?.filter((b) => b.status === 'pending').length ?? 0}
        />
      </div>
      <Link to={rp('equipment')}>
        <Button>Manage equipment</Button>
      </Link>
    </div>
  );
};

export default OwnerDashboard;
