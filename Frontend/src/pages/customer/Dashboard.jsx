import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bike,
  ShoppingCart,
  Wrench,
  TrendingUp,
  Clock
} from 'lucide-react';

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
        setStats((prev) => ({ ...prev, loading: false }));
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
      desc: 'Total vehicles you purchased',
    },
    {
      title: 'My Services',
      value: stats.services,
      icon: Wrench,
      color: 'success',
      link: '/customer/services',
      desc: 'Completed & ongoing services',
    },
    {
      title: 'Available Vehicles',
      value: stats.vehicles,
      icon: Bike,
      color: 'info',
      link: '/vehicles',
      desc: 'Vehicles you can explore',
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container my-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* HEADER */}
            <div className="mb-5">
              <h1 className="fw-bold mb-1">Customer Dashboard</h1>
              <p className="text-muted">
                Manage your purchases, services and explore vehicles easily.
              </p>
            </div>

            {/* STATS CARDS */}
            <div className="row g-4 mb-5">
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  className="col-md-4"
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Link to={stat.link} className="text-decoration-none">
                    <Card className="h-100 p-4 border-0 shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div
                          className={`p-3 rounded-circle bg-${stat.color} bg-opacity-10`}
                        >
                          <stat.icon
                            size={26}
                            className={`text-${stat.color}`}
                          />
                        </div>
                        <h2 className="fw-bold mb-0">{stat.value}</h2>
                      </div>

                      <h6 className="fw-semibold mb-1">{stat.title}</h6>
                      <p className="text-muted small mb-0">{stat.desc}</p>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* QUICK ACTIONS + INSIGHTS */}
            <div className="row mb-5">
              <div className="col-md-6 mb-4">
                <Card className="p-4 h-100">
                  <h5 className="fw-semibold mb-3">Quick Actions</h5>
                  <div className="d-grid gap-3">
                    <Link to="/vehicles" className="btn btn-primary">
                      <Bike size={18} className="me-2" />
                      Browse Vehicles
                    </Link>
                    <Link
                      to="/customer/services"
                      className="btn btn-outline-success"
                    >
                      <Wrench size={18} className="me-2" />
                      Book a Service
                    </Link>
                  </div>
                </Card>
              </div>

              <div className="col-md-6 mb-4">
                <Card className="p-4 h-100 bg-light border-0">
                  <h5 className="fw-semibold mb-3">Insights</h5>
                  <ul className="list-unstyled mb-0 text-muted small">
                    <li className="mb-2 d-flex align-items-center">
                      <TrendingUp size={16} className="me-2 text-success" />
                      You’ve completed {stats.services} services so far
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <Bike size={16} className="me-2 text-primary" />
                      New vehicles are added regularly
                    </li>
                    <li className="d-flex align-items-center">
                      <Clock size={16} className="me-2 text-warning" />
                      Timely service improves vehicle life
                    </li>
                  </ul>
                </Card>
              </div>
            </div>

            {/* RECENT ACTIVITY (STRUCTURE READY) */}
            <div className="row">
              <div className="col-12">
                <Card className="p-4">
                  <h5 className="fw-semibold mb-3">Recent Activity</h5>

                  <div className="text-muted small">
                    <div className="d-flex align-items-center mb-2">
                      <ShoppingCart size={16} className="me-2" />
                      Recent purchases will appear here
                    </div>
                    <div className="d-flex align-items-center">
                      <Wrench size={16} className="me-2" />
                      Recent service bookings will appear here
                    </div>
                  </div>

                  <p className="text-muted fst-italic mt-3 mb-0">
                    Detailed activity tracking coming soon.
                  </p>
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
