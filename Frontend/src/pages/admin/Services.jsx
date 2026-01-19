import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { serviceService } from '../../services/serviceService';
import { toast } from 'react-toastify';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingService, setEditingService] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', cost: '', notes: '' });

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await serviceService.getAll(params);
      setServices(response.results || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id) => {
    try {
      await serviceService.updateStatus(
        id,
        statusForm.status,
        statusForm.cost || null,
        statusForm.notes || ''
      );
      toast.success('Service updated');
      setEditingService(null);
      setStatusForm({ status: '', cost: '', notes: '' });
      fetchServices();
    } catch {
      toast.error('Update failed');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle size={18} className="text-success" />;
    if (status === 'cancelled') return <XCircle size={18} className="text-danger" />;
    return <Clock size={18} className="text-warning" />;
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

          {/* Header */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="icon-box">
              <Wrench size={26} />
            </div>
            <div>
              <h2 className="mb-0">Service Requests</h2>
              <small className="text-muted">Admin service management</small>
            </div>
          </div>

          {/* Filters */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter(s)}
              >
                {s.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Empty */}
          {services.length === 0 && (
            <Card className="text-center py-5">
              <h6> <Wrench size={20} className="text-muted mb-3 mt-2 me-1" /> No services found</h6>
            </Card>
          )}

          {/* List */}
          <div className="row g-4">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                className="col-12"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="service-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      {getStatusIcon(service.status)}
                      <h5 className="mb-0">
                        {service.vehicle_details?.brand} {service.vehicle_details?.model}
                      </h5>
                    </div>
                    <span className={`badge status-${service.status}`}>
                      {service.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="text-muted small mb-2">
                    Customer: <strong>{service.customer_details?.name || '—'}</strong>
                    {service.customer_details?.email && ` (${service.customer_details.email})`}
                  </div>

                  {service.description && (
                    <p className="mb-2">{service.description}</p>
                  )}

                  <div className="d-flex flex-wrap gap-3 text-muted small mb-3">
                    {service.cost > 0 && (
                      <span><strong>₹{parseFloat(service.cost).toLocaleString()}</strong></span>
                    )}
                    <span>{new Date(service.date).toLocaleString()}</span>
                  </div>

                  {/* Actions */}
                  {editingService === service.id ? (
                    <div className="update-box">
                      <select
                        className="form-select form-select-sm mb-2"
                        value={statusForm.status}
                        onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                      >
                        <option value="">Select Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <input
                        type="number"
                        className="form-control form-control-sm mb-2"
                        placeholder="Cost"
                        value={statusForm.cost}
                        onChange={(e) => setStatusForm({ ...statusForm, cost: e.target.value })}
                      />

                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows="2"
                        placeholder="Notes"
                        value={statusForm.notes}
                        onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                      />

                      <div className="d-flex gap-2">
                        <Button size="sm" variant="success" onClick={() => handleUpdateStatus(service.id)}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingService(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setEditingService(service.id)}>
                      Update Status
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Custom Styles */}
        <style>{`
          .icon-box {
            background:#eef3ff;
            color:#3a86ff;
            padding:12px;
            border-radius:12px;
          }
          .service-card {
            border-radius:16px;
            box-shadow:0 8px 24px rgba(0,0,0,.05);
          }
          .update-box {
            background:#f8f9fa;
            padding:12px;
            border-radius:12px;
          }
          .status-pending { background:#ffc107 }
          .status-in_progress { background:#0dcaf0 }
          .status-completed { background:#198754 }
          .status-cancelled { background:#dc3545 }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
};

export default Services;
