import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { serviceService } from '../../services/serviceService';
import { vehicleService } from '../../services/vehicleService';
import { toast } from 'react-toastify';

const Services = () => {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    description: '',
    scheduled_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchServices();
    fetchVehicles();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await serviceService.getMyServices();
      setServices(response.results || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.results || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    try {
      await serviceService.book(
        formData.vehicle,
        formData.description,
        formData.scheduled_date || null,
        formData.notes
      );
      toast.success('Service booked successfully!');
      setShowBookingForm(false);
      setFormData({ vehicle: '', description: '', scheduled_date: '', notes: '' });
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book service');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this service?')) {
      return;
    }

    try {
      await serviceService.cancel(id);
      toast.success('Service cancelled successfully');
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel service');
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <Wrench size={32} className="me-3 text-primary" />
                <div>
                  <h1 className="mb-0">My Services</h1>
                  <p className="text-muted mb-0">Manage your service requests</p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowBookingForm(!showBookingForm)}
              >
                <Plus size={18} className="me-2" />
                Book Service
              </Button>
            </div>

            {showBookingForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Card className="p-4">
                  <h5 className="mb-3">Book New Service</h5>
                  <form onSubmit={handleBookService}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Vehicle</label>
                        <select
                          className="form-select"
                          value={formData.vehicle}
                          onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                          required
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.brand} {vehicle.model}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Scheduled Date</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.scheduled_date}
                          onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Notes (Optional)</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary">
                        Book Service
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowBookingForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {services.length === 0 ? (
              <Card className="text-center p-5">
                <Wrench size={64} className="text-muted mb-3" />
                <h5>No services yet</h5>
                <p className="text-muted">Book a service to get started</p>
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
                          <p className="text-muted mb-2">{service.description}</p>
                          {service.cost > 0 && (
                            <p className="mb-2">
                              <strong>Cost: ₹{parseFloat(service.cost).toLocaleString()}</strong>
                            </p>
                          )}
                          <p className="text-muted small mb-0">
                            Date: {new Date(service.date).toLocaleDateString()}
                            {service.scheduled_date && (
                              <> | Scheduled: {new Date(service.scheduled_date).toLocaleString()}</>
                            )}
                          </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                          <span className={`badge bg-${getStatusBadge(service.status)} mb-3`}>
                            {service.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {service.status === 'pending' && (
                            <button
                              className="btn btn-outline-danger btn-sm d-block w-100"
                              onClick={() => handleCancel(service.id)}
                            >
                              Cancel Service
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

export default Services;
