import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, Plus, Edit, Trash2, Package } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { vehicleService } from '../../services/vehicleService';
import { toast } from 'react-toastify';
import VehicleModal from '../../components/admin/VehicleModal';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.results || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await vehicleService.delete(id);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete vehicle');
    }
  };

  const handleUpdateStock = async (id, quantity, action) => {
    try {
      await vehicleService.updateStock(id, quantity, action);
      toast.success('Stock updated successfully');
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update stock');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingVehicle(null);
    fetchVehicles();
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <Bike size={32} className="me-3 text-primary" />
                <div>
                  <h1 className="mb-0">Manage Vehicles</h1>
                  <p className="text-muted mb-0">Add, edit, and manage vehicle inventory</p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setEditingVehicle(null);
                  setShowModal(true);
                }}
              >
                <Plus size={18} className="me-2" />
                Add Vehicle
              </Button>
            </div>

            {vehicles.length === 0 ? (
              <Card className="text-center p-5">
                <Bike size={64} className="text-muted mb-3" />
                <h5>No vehicles</h5>
                <p className="text-muted">Add your first vehicle to get started</p>
              </Card>
            ) : (
              <div className="row g-4">
                {vehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle.id}
                    className="col-md-6 col-lg-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      {vehicle.image && (
                        <img
                          src={vehicle.image}
                          className="card-img-top"
                          alt={vehicle.brand}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <div className="card-body">
                        <h5 className="card-title">
                          {vehicle.brand} {vehicle.model}
                        </h5>
                        <p className="card-text">
                          <strong>Price:</strong> ₹{parseFloat(vehicle.price).toLocaleString()}
                        </p>
                        <p className="card-text">
                          <strong>Stock:</strong> {vehicle.stock_qty} units
                        </p>
                        <div className="d-flex gap-2 mb-3">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              const qty = prompt('Enter quantity to add:');
                              if (qty) handleUpdateStock(vehicle.id, parseInt(qty), 'add');
                            }}
                          >
                            <Package size={16} className="me-1" />
                            Add Stock
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              const qty = prompt('Enter quantity to reduce:');
                              if (qty) handleUpdateStock(vehicle.id, parseInt(qty), 'reduce');
                            }}
                          >
                            Reduce Stock
                          </Button>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setEditingVehicle(vehicle);
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} className="me-1" />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(vehicle.id)}
                          >
                            <Trash2 size={16} className="me-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {showModal && (
          <VehicleModal
            vehicle={editingVehicle}
            onClose={handleModalClose}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export default Vehicles;
