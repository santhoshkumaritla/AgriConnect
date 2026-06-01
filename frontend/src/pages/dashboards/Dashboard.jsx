import { useAuth } from '../../context/AuthContext';
import FarmerDashboard from './FarmerDashboard';
import ConsumerDashboard from './ConsumerDashboard';
import ExpertDashboard from './ExpertDashboard';
import DeliveryDashboard from './DeliveryDashboard';
import OwnerDashboard from './OwnerDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'farmer') return <FarmerDashboard />;
  if (role === 'expert') return <ExpertDashboard />;
  if (role === 'delivery') return <DeliveryDashboard />;
  if (role === 'equipment_owner') return <OwnerDashboard />;
  if (role === 'admin') return <AdminDashboard />;
  return <ConsumerDashboard />;
};

export default Dashboard;
