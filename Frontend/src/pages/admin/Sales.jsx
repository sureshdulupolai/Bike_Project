import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CheckCircle, Clock, XCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { salesService } from '../../services/salesService';
import { toast } from 'react-toastify';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSales();
  }, [filter]);

  const fetchSales = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await salesService.getAll(params);
      setSales(response.results || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await salesService.verify(id);
      toast.success('Sale verified successfully');
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to verify sale');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this sale?')) {
      return;
    }

    try {
      await salesService.cancel(id);
      toast.success('Sale cancelled successfully');
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel sale');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="text-success" size={20} />;
      case 'cancelled':
        return <XCircle className="text-danger" size={20} />;
      default:
        return <Clock className="text-warning" size={20} />;
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
              <ShoppingCart size={32} className="me-3 text-primary" />
              <div>
                <h1 className="mb-0">Sales Management</h1>
                <p className="text-muted mb-0">Manage and verify sales</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'verified' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('verified')}
                >
                  Verified
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'cancelled' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {sales.length === 0 ? (
              <Card className="text-center p-5">
                <ShoppingCart size={64} className="text-muted mb-3" />
                <h5>No sales found</h5>
              </Card>
            ) : (
              <div className="row g-4">
                {sales.map((sale, index) => (
                  <motion.div
                    key={sale.id}
                    className="col-12"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4">
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <div className="d-flex align-items-center mb-2">
                            {getStatusIcon(sale.status)}
                            <h5 className="mb-0 ms-2">
                              {sale.vehicle_details?.brand} {sale.vehicle_details?.model}
                            </h5>
                          </div>
                          <p className="text-muted mb-2">
                            Customer: {sale.customer_details?.name} ({sale.customer_details?.email})
                          </p>
                          <p className="mb-2">
                            Quantity: {sale.quantity} | Amount: ₹{parseFloat(sale.amount).toLocaleString()}
                          </p>
                          <p className="text-muted small mb-0">
                            Date: {new Date(sale.date).toLocaleString()}
                          </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                          <span className={`badge bg-${sale.status === 'verified' ? 'success' : sale.status === 'cancelled' ? 'danger' : 'warning'} mb-3`}>
                            {sale.status.toUpperCase()}
                          </span>
                          <div className="d-flex gap-2 justify-content-md-end">
                            {sale.status === 'pending' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleVerify(sale.id)}
                                >
                                  <CheckCircle size={16} className="me-1" />
                                  Verify
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleCancel(sale.id)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Sales;
