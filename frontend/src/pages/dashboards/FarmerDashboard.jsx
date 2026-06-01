import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import useRolePath from '../../hooks/useRolePath';

const chartData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 14000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 16000 },
  { month: 'May', revenue: 22000 },
];

const FarmerDashboard = () => {
  const { rp } = useRolePath();
  const { data } = useQuery({
    queryKey: ['farmer-analytics'],
    queryFn: async () => (await api.get('/analytics/farmer')).data,
    staleTime: 30000,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Farmer Dashboard"
        subtitle="Marketplace, equipment, consultations, and farm management."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total revenue" value={`₹${data?.totalRevenue ?? 0}`} />
        <StatCard label="Orders" value={data?.totalOrders ?? 0} />
        <StatCard label="Best sellers" value="Top crops" helper="Based on sales volume" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to={rp('products')}><Button>Manage products</Button></Link>
        <Link to={rp('farm')}><Button variant="outline">Farm profile</Button></Link>
        <Link to={rp('marketplace')}><Button variant="outline">Marketplace</Button></Link>
        <Link to={rp('equipment')}><Button variant="outline">Equipment</Button></Link>
        <Link to={rp('orders')}><Button variant="outline">Orders</Button></Link>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Monthly growth</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
