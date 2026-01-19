import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Mail
} from 'lucide-react';
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
      const res = await salesService.getAll(params);
      setSales(res.results || []);
    } catch {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    await salesService.verify(id);
    toast.success('Sale verified');
    fetchSales();
  };

  const handleCancel = async (id) => {
    await salesService.cancel(id);
    toast.success('Sale cancelled');
    fetchSales();
  };

  const statusUI = {
    pending: { color: 'warning', icon: <Clock size={16} /> },
    verified: { color: 'success', icon: <CheckCircle size={16} /> },
    cancelled: { color: 'danger', icon: <XCircle size={16} /> },
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <Layout><Loading /></Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container my-5">

          <h1 className="mb-2">Sales Management</h1>
          <p className="text-muted mb-4">Verify & manage customer purchases</p>

          {/* FILTER */}
          <div className="filter-tabs mb-4">
            {['all', 'pending', 'verified', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`tab ${filter === s ? 'active' : ''}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          {sales.length === 0 ? (
            <Card className="text-center p-5">
              <ShoppingCart size={60} className="text-muted mb-3" />
              <p className="text-muted">No sales found</p>
            </Card>
          ) : (
            <div className="sales-list">
              {sales.map((sale, i) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="sale-card p-4">
                    <div className="sale-top">
                      <h5>
                        {sale.vehicle_details?.brand} {sale.vehicle_details?.model}
                      </h5>
                      <span className={`status ${statusUI[sale.status].color}`}>
                        {statusUI[sale.status].icon}
                        {sale.status}
                      </span>
                    </div>

                    <div className="sale-info">
                      <div>
                        <User size={14} /> {sale.customer_details?.name}
                      </div>
                      <div>
                        <Mail size={14} /> {sale.customer_details?.email}
                      </div>
                    </div>

                    <div className="sale-meta">
                      Qty: <strong>{sale.quantity}</strong> |
                      Amount: <strong>₹{Number(sale.amount).toLocaleString()}</strong>
                    </div>

                    {sale.status === 'pending' && (
                      <div className="actions">
                        <Button size="sm" variant="success" onClick={() => handleVerify(sale.id)}>
                          Verify
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleCancel(sale.id)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* CUSTOM CSS */}
        <style>{`
          .filter-tabs {
            display: flex;
            gap: 10px;
          }

          .tab {
            padding: 6px 14px;
            border-radius: 20px;
            border: 1px solid #ddd;
            background: white;
            font-size: 13px;
          }

          .tab.active {
            background: #0d6efd;
            color: white;
            border-color: #0d6efd;
          }

          .sale-card {
            border-radius: 14px;
            margin-bottom: 15px;
          }

          .sale-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .status {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            color: white;
          }

          .status.success { background: #28a745; }
          .status.warning { background: #ffc107; color: #333; }
          .status.danger { background: #dc3545; }

          .sale-info {
            display: flex;
            gap: 20px;
            margin: 10px 0;
            font-size: 13px;
            color: #555;
          }

          .sale-meta {
            font-size: 14px;
            margin-bottom: 10px;
          }

          .actions {
            display: flex;
            gap: 10px;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
};

export default Sales;
