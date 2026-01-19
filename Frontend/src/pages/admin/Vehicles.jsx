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

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [stockQty, setStockQty] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehicleService.getAll();
      setVehicles(res.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async () => {
    try {
      await vehicleService.delete(confirmDelete.id);
      toast.success('Vehicle deleted');
      setConfirmDelete(null);
      fetchVehicles();
    } catch {
      toast.error('Delete failed');
    }
  };

  const updateStock = async () => {
    try {
      await vehicleService.updateStock(
        stockModal.id,
        parseInt(stockQty),
        stockModal.action
      );
      toast.success('Stock updated');
      setStockModal(null);
      setStockQty('');
      fetchVehicles();
    } catch {
      toast.error('Stock update failed');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <Layout><Loading /></Layout>
      </ProtectedRoute>
    );
  }

  return (
    <>
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container my-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div className="d-flex align-items-center gap-3">
                <Bike size={34} className="text-primary" />
                <div>
                  <h2 className="mb-0">Vehicle Inventory</h2>
                  <p className="text-muted mb-0">Manage stock & pricing</p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setEditingVehicle(null);
                  setShowVehicleModal(true);
                }}
              >
                <Plus size={18} className="me-2" />
                Add Vehicle
              </Button>
            </div>

            {/* Vehicle Cards */}
            <div className="row g-4">
              {vehicles.map((v, i) => (
                <motion.div
                  key={v.id}
                  className="col-md-6 col-lg-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-100 overflow-hidden">
                    {v.image && (
                      <img
                        src={v.image}
                        alt={v.model}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    )}
                    <div className="p-3">
                      <h5>{v.brand} {v.model}</h5>
                      <p className="mb-1">₹ {Number(v.price).toLocaleString()}</p>
                      <p className="text-muted small">
                        Stock: <strong>{v.stock_qty}</strong>
                      </p>

                      <div className="d-flex gap-2 mb-3">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            setStockModal({ id: v.id, action: 'add' })
                          }
                        >
                          <Package size={15} /> Add
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() =>
                            setStockModal({ id: v.id, action: 'reduce' })
                          }
                        >
                          Reduce
                        </Button>
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setEditingVehicle(v);
                            setShowVehicleModal(true);
                          }}
                        >
                          <Edit size={15} /> Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirmDelete(v)}
                        >
                          <Trash2 size={15} /> Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Delete Confirm Modal */}
        {confirmDelete && (
          <div className="modal-backdrop-custom">
            <div className="modal-box">
              <h5>Delete Vehicle?</h5>
              <p className="text-muted">
                {confirmDelete.brand} {confirmDelete.model} will be removed.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={deleteVehicle}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Modal */}
        {stockModal && (
          <div className="modal-backdrop-custom">
            <div className="modal-box">
              <h5>
                {stockModal.action === 'add' ? 'Add Stock' : 'Reduce Stock'}
              </h5>

              <input
                type="number"
                className="form-control my-3"
                placeholder="Enter quantity"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
              />

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setStockModal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={updateStock}>
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Add/Edit Modal */}
        {showVehicleModal && (
          <VehicleModal
            vehicle={editingVehicle}
            onClose={() => {
              setShowVehicleModal(false);
              setEditingVehicle(null);
              fetchVehicles();
            }}
          />
        )}
      </Layout>
    </ProtectedRoute>

    <style>
      {`
        .modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  background: #fff;
  padding: 25px;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

      `}
    </style>
    </>
  );
};

export default Vehicles;
