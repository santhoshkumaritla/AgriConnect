import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/ui/StatCard';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const role = user?.role || 'consumer';

  const endpoint =
    role === 'farmer'
      ? '/analytics/farmer'
      : role === 'expert'
        ? '/analytics/expert'
        : role === 'admin'
          ? '/analytics/admin'
          : '/analytics/consumer';

  const { data } = useQuery({
    queryKey: ['analytics', role],
    queryFn: async () => {
      const res = await api.get(endpoint);
      return res.data;
    },
    enabled: !!user,
  });

  const chartData = [
    { month: 'Jan', value: 12000 },
    { month: 'Feb', value: 14000 },
    { month: 'Mar', value: 18000 },
    { month: 'Apr', value: 16000 },
    { month: 'May', value: 22000 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" subtitle="Role-based insights and trends." />
      {role === 'farmer' && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total revenue" value={`₹${data?.totalRevenue ?? 0}`} />
            <StatCard label="Orders" value={data?.totalOrders ?? 0} />
            <StatCard label="Best sellers" value="Top crops" helper="From order data" />
          </div>
          <div className="h-64 rounded-2xl border p-4 dark:border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4CAF50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      {role === 'consumer' && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard label="Total spent" value={`₹${data?.totalSpent ?? 0}`} />
            <StatCard label="Orders" value={data?.totalOrders ?? 0} />
          </div>
          <div className="h-64 rounded-2xl border p-4 dark:border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#7C4D24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      {role === 'expert' && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Consultations" value={data?.consultationsHandled ?? 0} />
          <StatCard
            label="Resolution rate"
            value={`${((data?.resolutionRate ?? 0) * 100).toFixed(0)}%`}
          />
          <StatCard label="Rating" value={data?.ratings ?? '—'} />
        </div>
      )}
      {role === 'admin' && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Users" value={data?.totalUsers ?? 0} />
          <StatCard label="Orders" value={data?.totalOrders ?? 0} />
          <StatCard label="Revenue" value={`₹${data?.revenue ?? 0}`} />
          <StatCard label="Rentals" value={data?.equipmentRentals ?? 0} />
          <StatCard label="Consultations" value={data?.consultations ?? 0} />
        </div>
      )}
    </div>
  );
};

export default Analytics;
