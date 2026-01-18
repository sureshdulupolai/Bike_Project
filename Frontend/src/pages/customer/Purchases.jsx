import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CheckCircle, XCircle, Clock } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import ProtectedRoute from '../../components/ProtectedRoute';
import { salesService } from '../../services/salesService';
import { toast } from 'react-toastify';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await salesService.getMyPurchases();
      setPurchases(response.results || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this purchase?')) {
      return;
    }

    try {
      await salesService.cancel(id);
      toast.success('Purchase cancelled successfully');
      fetchPurchases();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel purchase');
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'warning',
      verified: 'success',
      cancelled: 'danger',
    };
    return badges[status] || 'secondary';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <Loading />
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
                <h1 className="mb-0">My Purchases</h1>
                <p className="text-muted mb-0">View your purchase history</p>
              </div>
            </div>

            {purchases.length === 0 ? (
              <Card className="text-center p-5">
                <ShoppingCart size={64} className="text-muted mb-3" />
                <h5>No purchases yet</h5>
                <p className="text-muted">Start shopping to see your purchases here</p>
              </Card>
            ) : (
              <div className="row g-4">
                {purchases.map((purchase, index) => (
                  <motion.div
                    key={purchase.id}
                    className="col-12"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4">
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <div className="d-flex align-items-center mb-2">
                            {getStatusIcon(purchase.status)}
                            <h5 className="mb-0 ms-2">
                              {purchase.vehicle_details?.brand} {purchase.vehicle_details?.model}
                            </h5>
                          </div>
                          <p className="text-muted mb-2">
                            Quantity: {purchase.quantity} | Amount: ₹{parseFloat(purchase.amount).toLocaleString()}
                          </p>
                          <p className="text-muted small mb-0">
                            Date: {new Date(purchase.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                          <span className={`badge bg-${getStatusBadge(purchase.status)} mb-3`}>
                            {purchase.status.toUpperCase()}
                          </span>
                          {purchase.status === 'pending' && (
                            <button
                              className="btn btn-outline-danger btn-sm d-block w-100"
                              onClick={() => handleCancel(purchase.id)}
                            >
                              Cancel Purchase
                            </button>
                          )}
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

export default Purchases;
