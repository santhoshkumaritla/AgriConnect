import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/PageHeader';
import api from '../../services/api';

const AdminDashboard = () => {
  const { data } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => (await api.get('/analytics/admin')).data,
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide metrics and activity." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total users" value={data?.totalUsers ?? 0} />
        <StatCard label="Orders" value={data?.totalOrders ?? 0} />
        <StatCard label="Revenue" value={`₹${data?.revenue ?? 0}`} />
        <StatCard label="Equipment rentals" value={data?.equipmentRentals ?? 0} />
        <StatCard label="Consultations" value={data?.consultations ?? 0} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        Use notifications API to broadcast system alerts. User management via /api/users (admin).
      </div>
    </div>
  );
};

export default AdminDashboard;
