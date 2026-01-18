import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Package, Wrench } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import ProtectedRoute from '../../components/ProtectedRoute';
import { reportService } from '../../services/reportService';
import Button from '../../components/UI/Button';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [serviceReport, setServiceReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [sales, inventory, service] = await Promise.all([
        reportService.getSalesReport(),
        reportService.getInventoryReport(),
        reportService.getServiceReport(),
      ]);
      setSalesReport(sales);
      setInventoryReport(inventory);
      setServiceReport(service);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.start_date) params.start_date = dateRange.start_date;
      if (dateRange.end_date) params.end_date = dateRange.end_date;

      if (activeTab === 'sales') {
        const report = await reportService.getSalesReport(params);
        setSalesReport(report);
      } else if (activeTab === 'service') {
        const report = await reportService.getServiceReport(params);
        setServiceReport(report);
      }
    } catch (error) {
      console.error('Error filtering reports:', error);
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

  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container my-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="d-flex align-items-center mb-4">
              <BarChart3 size={32} className="me-3 text-primary" />
              <div>
                <h1 className="mb-0">Reports</h1>
                <p className="text-muted mb-0">View business analytics and reports</p>
              </div>
            </div>

            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sales')}
                >
                  <TrendingUp size={18} className="me-2" />
                  Sales Report
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inventory')}
                >
                  <Package size={18} className="me-2" />
                  Inventory Report
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'service' ? 'active' : ''}`}
                  onClick={() => setActiveTab('service')}
                >
                  <Wrench size={18} className="me-2" />
                  Service Report
                </button>
              </li>
            </ul>

            {(activeTab === 'sales' || activeTab === 'service') && (
              <Card className="p-4 mb-4">
                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.start_date}
                      onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.end_date}
                      onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <Button variant="primary" onClick={handleDateFilter}>
                      Filter
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'sales' && salesReport && (
              <Card className="p-4">
                <h5 className="mb-4">Sales Report</h5>
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-primary">{salesReport.summary?.total_sales || 0}</h3>
                      <p className="text-muted mb-0">Total Sales</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-success">{salesReport.summary?.verified_sales || 0}</h3>
                      <p className="text-muted mb-0">Verified Sales</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-info">₹{(salesReport.summary?.total_revenue || 0).toLocaleString()}</h3>
                      <p className="text-muted mb-0">Total Revenue</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-warning">{salesReport.summary?.pending_sales || 0}</h3>
                      <p className="text-muted mb-0">Pending Sales</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'inventory' && inventoryReport && (
              <Card className="p-4">
                <h5 className="mb-4">Inventory Report</h5>
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-primary">{inventoryReport.summary?.total_vehicles || 0}</h3>
                      <p className="text-muted mb-0">Total Vehicles</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-success">{inventoryReport.summary?.in_stock_vehicles || 0}</h3>
                      <p className="text-muted mb-0">In Stock</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-warning">{inventoryReport.summary?.low_stock_vehicles || 0}</h3>
                      <p className="text-muted mb-0">Low Stock</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-danger">{inventoryReport.summary?.out_of_stock_vehicles || 0}</h3>
                      <p className="text-muted mb-0">Out of Stock</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'service' && serviceReport && (
              <Card className="p-4">
                <h5 className="mb-4">Service Report</h5>
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-primary">{serviceReport.summary?.total_requests || 0}</h3>
                      <p className="text-muted mb-0">Total Requests</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-success">{serviceReport.summary?.completed_requests || 0}</h3>
                      <p className="text-muted mb-0">Completed</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-info">₹{(serviceReport.summary?.total_revenue || 0).toLocaleString()}</h3>
                      <p className="text-muted mb-0">Total Revenue</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h3 className="text-warning">{serviceReport.summary?.pending_requests || 0}</h3>
                      <p className="text-muted mb-0">Pending</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Reports;
