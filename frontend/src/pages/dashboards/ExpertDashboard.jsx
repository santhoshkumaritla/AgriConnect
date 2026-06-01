import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import useRolePath from '../../hooks/useRolePath';

const ExpertDashboard = () => {
  const { rp } = useRolePath();
  const { data } = useQuery({
    queryKey: ['expert-analytics'],
    queryFn: async () => (await api.get('/analytics/expert')).data,
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Expert Dashboard" subtitle="Consultation requests and resolution metrics." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Consultations" value={data?.consultationsHandled ?? 0} />
        <StatCard
          label="Resolution rate"
          value={`${((data?.resolutionRate ?? 0) * 100).toFixed(0)}%`}
        />
        <StatCard label="Average rating" value={data?.ratings || '4.8/5'} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to={rp('consultations')}>
          <Button>Open consultations</Button>
        </Link>
        <Link to={rp('education')}>
          <Button variant="outline">Education hub</Button>
        </Link>
      </div>
    </div>
  );
};

export default ExpertDashboard;
