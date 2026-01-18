import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Loading from '../components/UI/Loading';
import Button from '../components/UI/Button';
import { vehicleService } from '../services/vehicleService';
import { salesService } from '../services/salesService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const data = await vehicleService.getById(id);
      setVehicle(data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      toast.error('Vehicle not found');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated()) {
      toast.info('Please login to purchase');
      navigate('/login');
      return;
    }

    if (!isCustomer()) {
      toast.error('Only customers can purchase vehicles');
      return;
    }

    setPurchasing(true);
    try {
      const result = await salesService.purchase(vehicle.id, quantity);
      toast.success('Purchase request created! Waiting for admin verification.');
      navigate('/customer/purchases');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <Layout>
      <div className="container my-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/vehicles" className="btn btn-outline-secondary mb-4">
            <ArrowLeft size={18} className="me-2" />
            Back to Vehicles
          </Link>

          <div className="row">
            <div className="col-md-6 mb-4">
              {vehicle.image ? (
                <img
                  src={vehicle.image}
                  className="img-fluid rounded shadow"
                  alt={vehicle.brand}
                />
              ) : (
                <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                  <span className="text-muted">No image available</span>
                </div>
              )}
            </div>

            <div className="col-md-6">
              <Card className="p-4">
                <h1 className="mb-3">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <div className="mb-4">
                  <h2 className="text-primary d-flex align-items-center">
                    <IndianRupee size={32} />
                    {parseFloat(vehicle.price).toLocaleString()}
                  </h2>
                </div>

                <div className="mb-4">
                  <p className="text-muted">{vehicle.description}</p>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Stock Available:</span>
                    <strong>{vehicle.stock_qty} units</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Status:</span>
                    <span className={`badge ${vehicle.is_in_stock ? 'bg-success' : 'bg-danger'}`}>
                      {vehicle.is_in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {isAuthenticated() && isCustomer() && vehicle.is_in_stock && (
                  <div className="mb-4">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      min="1"
                      max={vehicle.stock_qty}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={handlePurchase}
                      loading={purchasing}
                    >
                      <ShoppingCart size={18} className="me-2" />
                      Purchase Now
                    </Button>
                  </div>
                )}

                {!isAuthenticated() && (
                  <div className="alert alert-info">
                    <Link to="/login" className="text-decoration-none">
                      Login to purchase this vehicle
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default VehicleDetail;
