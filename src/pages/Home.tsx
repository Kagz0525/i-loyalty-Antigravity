import { useAuth } from '../context/AuthContext';
import VendorDashboard from './VendorDashboard';
import CustomerDashboard from './CustomerDashboard';

export default function Home() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'vendor' ? <VendorDashboard /> : <CustomerDashboard />;
}
