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
    } catch (error) {
      console.error('Error fetching services:', error);
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
      toast.success('Service status updated successfully');
      setEditingService(null);
      setStatusForm({ status: '', cost: '', notes: '' });
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
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
              <Wrench size={32} className="me-3 text-primary" />
              <div>
                <h1 className="mb-0">Service Management</h1>
                <p className="text-muted mb-0">Manage service requests</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="btn-group" role="group">
                {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn ${filter === status ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilter(status)}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {services.length === 0 ? (
              <Card className="text-center p-5">
                <Wrench size={64} className="text-muted mb-3" />
                <h5>No services found</h5>
              </Card>
            ) : (
              <div className="row g-4">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    className="col-12"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4">
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <div className="d-flex align-items-center mb-2">
                            {getStatusIcon(service.status)}
                            <h5 className="mb-0 ms-2">
                              {service.vehicle_details?.brand} {service.vehicle_details?.model}
                            </h5>
                          </div>
                          <p className="text-muted mb-2">
                            Customer: {service.customer_details?.name} ({service.customer_details?.email})
                          </p>
                          <p className="mb-2">{service.description}</p>
                          {service.cost > 0 && (
                            <p className="mb-2">
                              <strong>Cost: ₹{parseFloat(service.cost).toLocaleString()}</strong>
                            </p>
                          )}
                          <p className="text-muted small mb-0">
                            Date: {new Date(service.date).toLocaleString()}
                            {service.scheduled_date && (
                              <> | Scheduled: {new Date(service.scheduled_date).toLocaleString()}</>
                            )}
                          </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                          <span className={`badge bg-${service.status === 'completed' ? 'success' : service.status === 'cancelled' ? 'danger' : service.status === 'in_progress' ? 'info' : 'warning'} mb-3`}>
                            {service.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {editingService === service.id ? (
                            <div className="text-start">
                              <select
                                className="form-select mb-2"
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
                                className="form-control mb-2"
                                placeholder="Cost"
                                value={statusForm.cost}
                                onChange={(e) => setStatusForm({ ...statusForm, cost: e.target.value })}
                              />
                              <textarea
                                className="form-control mb-2"
                                rows="2"
                                placeholder="Notes"
                                value={statusForm.notes}
                                onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                              />
                              <div className="d-flex gap-2">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(service.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setEditingService(null);
                                    setStatusForm({ status: '', cost: '', notes: '' });
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setEditingService(service.id)}
                            >
                              Update Status
                            </Button>
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

export default Services;
