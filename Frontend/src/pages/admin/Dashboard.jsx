import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Wrench,
  Bike,
  Users,
  DollarSign,
  TrendingUp,
  Package,
} from 'lucide-react';

import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import ProtectedRoute from '../../components/ProtectedRoute';
import Button from '../../components/UI/Button';
import { reportService } from '../../services/reportService';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const [dash, sales, inventory, service] = await Promise.all([
        reportService.getDashboard(),
        reportService.getSalesReport(),
        reportService.getInventoryReport(),
        reportService.getServiceReport(),
      ]);

      setDashboard(dash);
      setReports({ sales, inventory, service });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <Layout><Loading /></Layout>
      </ProtectedRoute>
    );
  }

  const kpis = [
    {
      title: 'Recent Sales',
      value: dashboard?.sales?.recent_sales_count || 0,
      revenue: dashboard?.sales?.recent_revenue || 0,
      icon: ShoppingCart,
      color: 'primary',
    },
    {
      title: 'Vehicles',
      value: dashboard?.inventory?.total_vehicles || 0,
      subtitle: `${dashboard?.inventory?.low_stock_count || 0} low stock`,
      icon: Bike,
      color: 'info',
    },
    {
      title: 'Pending Services',
      value: dashboard?.service?.pending_requests || 0,
      icon: Wrench,
      color: 'warning',
    },
    {
      title: 'Customers',
      value: dashboard?.customers?.total_customers || 0,
      subtitle: `+${dashboard?.customers?.new_customers || 0} this month`,
      icon: Users,
      color: 'success',
    },
  ];

  const summaryMap = {
    sales: [
      ['Total Sales', reports.sales?.summary?.total_sales],
      ['Revenue', `₹${reports.sales?.summary?.total_revenue?.toLocaleString()}`],
      ['Verified', reports.sales?.summary?.verified_sales],
      ['Pending', reports.sales?.summary?.pending_sales],
    ],
    inventory: [
      ['Total', reports.inventory?.summary?.total_vehicles],
      ['In Stock', reports.inventory?.summary?.in_stock_vehicles],
      ['Low Stock', reports.inventory?.summary?.low_stock_vehicles],
      ['Out', reports.inventory?.summary?.out_of_stock_vehicles],
    ],
    service: [
      ['Requests', reports.service?.summary?.total_requests],
      ['Completed', reports.service?.summary?.completed_requests],
      ['Revenue', `₹${reports.service?.summary?.total_revenue?.toLocaleString()}`],
      ['Pending', reports.service?.summary?.pending_requests],
    ],
  };

  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container my-5">

          {/* HEADER */}
          <div className="mb-4">
            <h1 className="fw-bold">Admin Dashboard</h1>
            <p className="text-muted">Business overview & performance</p>
          </div>

          {/* KPI */}
          <div className="row g-4 mb-5">
            {kpis.map((k, i) => (
              <motion.div key={i} className="col-md-6 col-lg-3" whileHover={{ y: -6 }}>
                <Card className="p-4 border-0 shadow-sm h-100">
                  <div className="d-flex justify-content-between mb-3">
                    <div className={`p-3 rounded bg-${k.color} bg-opacity-10`}>
                      <k.icon className={`text-${k.color}`} />
                    </div>
                    {k.revenue && <DollarSign className="text-success" />}
                  </div>
                  <h3 className="fw-bold">{k.value}</h3>
                  <p className="text-muted small mb-0">{k.title}</p>
                  {k.subtitle && <small className="text-muted">{k.subtitle}</small>}
                  {k.revenue && (
                    <div className="text-success fw-semibold mt-1">
                      ₹{k.revenue.toLocaleString()}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* REPORTS (MERGED) */}
          <Card className="p-4 mb-5 border-0 shadow-sm">
            <div className="d-flex gap-3 mb-4">
              {['sales', 'inventory', 'service'].map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'primary' : 'outline-primary'}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'sales' && <TrendingUp size={16} />}
                  {tab === 'inventory' && <Package size={16} />}
                  {tab === 'service' && <Wrench size={16} />}
                  <span className="ms-2 text-capitalize">{tab}</span>
                </Button>
              ))}
            </div>

            <div className="row g-4">
              {summaryMap[activeTab].map(([label, value], i) => (
                <div key={i} className="col-md-3">
                  <div className="p-3 bg-light rounded text-center">
                    <h4 className="fw-bold">{value || 0}</h4>
                    <small className="text-muted">{label}</small>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ACTIONS + ALERTS */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <Card className="p-4 h-100">
                <h6 className="fw-semibold mb-3">⚠ Alerts</h6>
                <ul className="small text-muted mb-0">
                  <li>Low stock vehicles need attention</li>
                  <li>Pending services should be resolved</li>
                  <li>Track revenue daily for growth</li>
                </ul>
              </Card>
            </div>

            <div className="col-md-6 mb-4">
              <Card className="p-4 h-100">
                <h6 className="fw-semibold mb-3">⚡ Quick Actions</h6>
                <div className="d-grid gap-2">
                  <Link to="/admin/vehicles" className="btn btn-outline-primary">Manage Vehicles</Link>
                  <Link to="/admin/sales" className="btn btn-outline-success">View Sales</Link>
                  <Link to="/admin/services" className="btn btn-outline-warning">Service Requests</Link>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
