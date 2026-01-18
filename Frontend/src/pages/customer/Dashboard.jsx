import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, ShoppingCart, Wrench, TrendingUp } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import ProtectedRoute from '../../components/ProtectedRoute';
import { salesService } from '../../services/salesService';
import { serviceService } from '../../services/serviceService';
import { vehicleService } from '../../services/vehicleService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    purchases: 0,
    services: 0,
    vehicles: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [purchases, services, vehicles] = await Promise.all([
          salesService.getMyPurchases(),
          serviceService.getMyServices(),
          vehicleService.getAll({ page_size: 1 }),
        ]);

        setStats({
          purchases: purchases.count || 0,
          services: services.count || 0,
          vehicles: vehicles.count || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({ ...stats, loading: false });
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <Loading />
        </Layout>
      </ProtectedRoute>
    );
  }

  const statCards = [
    {
      title: 'My Purchases',
      value: stats.purchases,
      icon: ShoppingCart,
      color: 'primary',
      link: '/customer/purchases',
    },
    {
      title: 'My Services',
      value: stats.services,
      icon: Wrench,
      color: 'success',
      link: '/customer/services',
    },
    {
      title: 'Available Vehicles',
      value: stats.vehicles,
      icon: Bike,
      color: 'info',
      link: '/vehicles',
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container my-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4">Customer Dashboard</h1>
            <p className="text-muted mb-4">Welcome back! Here's your overview.</p>

            <div className="row g-4 mb-5">
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  className="col-md-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={stat.link} className="text-decoration-none">
                    <Card className="h-100 text-center p-4">
                      <stat.icon size={48} className={`text-${stat.color} mb-3`} />
                      <h3 className="fw-bold">{stat.value}</h3>
                      <p className="text-muted mb-0">{stat.title}</p>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <Card className="p-4">
                  <h5 className="mb-3">Quick Actions</h5>
                  <div className="d-grid gap-2">
                    <Link to="/vehicles" className="btn btn-primary">
                      <Bike className="me-2" size={18} />
                      Browse Vehicles
                    </Link>
                    <Link to="/customer/services" className="btn btn-outline-success">
                      <Wrench className="me-2" size={18} />
                      Book Service
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
