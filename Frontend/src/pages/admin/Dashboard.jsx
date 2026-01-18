import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Wrench, Bike, TrendingUp, Users, DollarSign } from 'lucide-react';
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
    },
    {
      title: 'Total Vehicles',
      value: dashboard?.inventory?.total_vehicles || 0,
      subtitle: `${dashboard?.inventory?.low_stock_count || 0} low stock`,
      icon: Bike,
      color: 'info',
      link: '/admin/vehicles',
    },
    {
      title: 'Pending Services',
      value: dashboard?.service?.pending_requests || 0,
      revenue: dashboard?.service?.recent_revenue || 0,
      icon: Wrench,
      color: 'warning',
      link: '/admin/services',
    },
    {
      title: 'Total Customers',
      value: dashboard?.customers?.total_customers || 0,
      subtitle: `${dashboard?.customers?.new_customers || 0} new this month`,
      icon: Users,
      color: 'success',
    },
  ];

  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container my-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4">Admin Dashboard</h1>
            <p className="text-muted mb-4">Overview of your business</p>

            <div className="row g-4 mb-5">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="col-md-6 col-lg-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {stat.link ? (
                    <Link to={stat.link} className="text-decoration-none">
                      <Card className="h-100 p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <stat.icon size={32} className={`text-${stat.color}`} />
                          {stat.revenue > 0 && (
                            <DollarSign size={20} className="text-muted" />
                          )}
                        </div>
                        <h3 className="fw-bold mb-1">{stat.value}</h3>
                        <p className="text-muted mb-0 small">{stat.title}</p>
                        {stat.revenue > 0 && (
                          <p className="text-success mb-0 mt-2">
                            ₹{stat.revenue.toLocaleString()}
                          </p>
                        )}
                        {stat.subtitle && (
                          <p className="text-muted mb-0 small mt-1">{stat.subtitle}</p>
                        )}
                      </Card>
                    </Link>
                  ) : (
                    <Card className="h-100 p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <stat.icon size={32} className={`text-${stat.color}`} />
                      </div>
                      <h3 className="fw-bold mb-1">{stat.value}</h3>
                      <p className="text-muted mb-0 small">{stat.title}</p>
                      {stat.subtitle && (
                        <p className="text-muted mb-0 small mt-1">{stat.subtitle}</p>
                      )}
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <Card className="p-4">
                  <h5 className="mb-3">Quick Actions</h5>
                  <div className="d-grid gap-2">
                    <Link to="/admin/vehicles" className="btn btn-primary">
                      <Bike className="me-2" size={18} />
                      Manage Vehicles
                    </Link>
                    <Link to="/admin/sales" className="btn btn-outline-primary">
                      <ShoppingCart className="me-2" size={18} />
                      View Sales
                    </Link>
                    <Link to="/admin/services" className="btn btn-outline-warning">
                      <Wrench className="me-2" size={18} />
                      Manage Services
                    </Link>
                    <Link to="/admin/reports" className="btn btn-outline-info">
                      <TrendingUp className="me-2" size={18} />
                      View Reports
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
