import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingCart, ArrowLeft, Package } from 'lucide-react';
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
    } catch {
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
      await salesService.purchase(vehicle.id, quantity);
      toast.success('Purchase request submitted successfully');
      navigate('/customer/purchases');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Purchase failed');
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

  if (!vehicle) return null;

  return (
    <Layout>
      <div className="container my-5">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>

          {/* Back */}
          <Link to="/vehicles" className="back-link mb-4 d-inline-flex">
            <ArrowLeft size={18} />
            <span>Back to Vehicles</span>
          </Link>

          <div className="row g-4">
            {/* Image */}
            <div className="col-md-6">
              <div className="image-box">
                {vehicle.image ? (
                  <img src={vehicle.image} alt={vehicle.model} />
                ) : (
                  <Package size={80} className="text-muted" />
                )}
                <span
                  className={`stock-pill ${
                    vehicle.is_in_stock ? 'in' : 'out'
                  }`}
                >
                  {vehicle.is_in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="col-md-6">
              <Card className="detail-card p-4">

                <h1 className="mb-1 fw-bold">
                  {vehicle.brand} {vehicle.model}
                </h1>

                <div className="price mb-2">
                  <IndianRupee size={20} />
                  {Number(vehicle.price).toLocaleString()}
                </div>

                {/* Description only if exists */}
                {vehicle.description && (
                  <p className="description mb-4">
                    {vehicle.description}
                  </p>
                )}

                <div className="info-row mb-4">
                  <span>Available Stock</span>
                  <strong>{vehicle.stock_qty} units</strong>
                </div>

                {/* Purchase Section */}
                {isAuthenticated() && isCustomer() && vehicle.is_in_stock && (
                  <div className="purchase-box">
                    <label className="form-label mb-1">Quantity</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      min="1"
                      max={vehicle.stock_qty}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                    />

                    <Button
                      variant="primary"
                      className="w-100"
                      loading={purchasing}
                      onClick={handlePurchase}
                    >
                      <ShoppingCart size={18} className="me-2" />
                      Purchase Now
                    </Button>
                  </div>
                )}

                {!isAuthenticated() && (
                  <div className="login-hint">
                    <Link to="/login">Login to purchase this vehicle</Link>
                  </div>
                )}

              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= CUSTOM STYLES ================= */}
      <style>{`
        .back-link {
          gap: 6px;
          align-items: center;
          color: #555;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          color: #0d6efd;
        }

        .image-box {
          position: relative;
          height: 420px;
          background: #f3f4f6;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stock-pill {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 6px 14px;
          font-size: 13px;
          border-radius: 30px;
          color: #fff;
          font-weight: 500;
        }

        .stock-pill.in {
          background: #28a745;
        }

        .stock-pill.out {
          background: #dc3545;
        }

        .detail-card {
          border-radius: 16px;
        }

        .price {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 20px;
          font-weight: 700;
          color: #0d6efd;
        }

        .description {
          color: #555;
          line-height: 1.6;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          background: #f8f9fa;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
        }

        .purchase-box {
          margin-top: 20px;
        }

        .login-hint {
          background: #e9f2ff;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }

        .login-hint a {
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>
    </Layout>
  );
};

export default VehicleDetail;
