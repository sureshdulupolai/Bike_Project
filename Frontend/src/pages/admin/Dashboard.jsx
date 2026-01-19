import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Wrench,
  Bike,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import ProtectedRoute from '../../components/ProtectedRoute';
import { reportService } from '../../services/reportService';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await reportService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <Layout>
          <Loading />
        </Layout>
      </ProtectedRoute>
    );
  }

  const stats = [
    {
      title: 'Recent Sales',
      value: dashboard?.sales?.recent_sales_count || 0,
      revenue: dashboard?.sales?.recent_revenue || 0,
      icon: ShoppingCart,
      color: 'primary',
      link: '/admin/sales',
      desc: 'Sales in recent period',
    },
    {
      title: 'Total Vehicles',
      value: dashboard?.inventory?.total_vehicles || 0,
      subtitle: `${dashboard?.inventory?.low_stock_count || 0} low stock`,
      icon: Bike,
      color: 'info',
      link: '/admin/vehicles',
      desc: 'Inventory overview',
    },
    {
      title: 'Pending Services',
      value: dashboard?.service?.pending_requests || 0,
      revenue: dashboard?.service?.recent_revenue || 0,
      icon: Wrench,
      color: 'warning',
      link: '/admin/services',
      desc: 'Service requests awaiting action',
    },
    {
      title: 'Total Customers',
      value: dashboard?.customers?.total_customers || 0,
      subtitle: `${dashboard?.customers?.new_customers || 0} new this month`,
      icon: Users,
      color: 'success',
      desc: 'Registered customers',
    },
  ];

  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container my-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* HEADER */}
            <div className="mb-5">
              <h1 className="fw-bold mb-1">Admin Dashboard</h1>
              <p className="text-muted">
                Monitor sales, services, inventory, and customers
              </p>
            </div>

            {/* KPI CARDS */}
            <div className="row g-4 mb-5">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="col-md-6 col-lg-3"
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {stat.link ? (
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

                          {stat.revenue > 0 && (
                            <DollarSign size={18} className="text-success" />
                          )}
                        </div>

                        <h3 className="fw-bold mb-0">{stat.value}</h3>
                        <p className="text-muted small mb-1">{stat.title}</p>

                        {stat.revenue > 0 && (
                          <p className="text-success fw-semibold mb-1">
                            ₹{stat.revenue.toLocaleString()}
                          </p>
                        )}

                        {stat.subtitle && (
                          <p className="text-muted small mb-0">
                            {stat.subtitle}
                          </p>
                        )}
                      </Card>
                    </Link>
                  ) : (
                    <Card className="h-100 p-4 border-0 shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <stat.icon size={26} className={`text-${stat.color}`} />
                      </div>
                      <h3 className="fw-bold mb-0">{stat.value}</h3>
                      <p className="text-muted small mb-0">{stat.title}</p>
                      {stat.subtitle && (
                        <p className="text-muted small mb-0 mt-1">
                          {stat.subtitle}
                        </p>
                      )}
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>

            {/* QUICK ACTIONS + INSIGHTS */}
            <div className="row">
              <div className="col-md-6 mb-4">
                <Card className="p-4 h-100">
                  <h5 className="fw-semibold mb-3">Quick Actions</h5>
                  <div className="d-grid gap-3">
                    <Link to="/admin/vehicles" className="btn btn-primary">
                      <Bike size={18} className="me-2" />
                      Manage Vehicles
                    </Link>
                    <Link to="/admin/sales" className="btn btn-outline-primary">
                      <ShoppingCart size={18} className="me-2" />
                      View Sales
                    </Link>
                    <Link to="/admin/services" className="btn btn-outline-warning">
                      <Wrench size={18} className="me-2" />
                      Manage Services
                    </Link>
                    <Link to="/admin/reports" className="btn btn-outline-info">
                      <TrendingUp size={18} className="me-2" />
                      View Reports
                    </Link>
                  </div>
                </Card>
              </div>

              <div className="col-md-6 mb-4">
                <Card className="p-4 h-100 bg-light border-0">
                  <h5 className="fw-semibold mb-3">Business Insights</h5>
                  <ul className="list-unstyled mb-0 text-muted small">
                    <li className="mb-2">
                      📈 Revenue performance is updated in real-time
                    </li>
                    <li className="mb-2">
                      🚨 Check low-stock vehicles regularly
                    </li>
                    <li>
                      🛠 Pending services should be resolved quickly
                    </li>
                  </ul>
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
