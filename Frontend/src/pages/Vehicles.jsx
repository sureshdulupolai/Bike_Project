import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, Search, IndianRupee } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Loading from '../components/UI/Loading';
import Button from '../components/UI/Button';
import { vehicleService } from '../services/vehicleService';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [filterBrand, priceRange]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterBrand) params.brand = filterBrand;
      if (searchTerm) params.search = searchTerm;

      if (priceRange) {
        if (priceRange === '200000+') {
          params.min_price = 200000;
        } else {
          const [min, max] = priceRange.split('-');
          params.min_price = min;
          params.max_price = max;
        }
      }

      const res = await vehicleService.getAll(params);
      setVehicles(res.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container my-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* Page Header */}
          <div className="vehicles-header mb-5">
            <div>
              <h1 className="mb-1">Available Vehicles</h1>
              <p className="text-muted mb-0">
                Choose your next ride from our collection
              </p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="search-filter-box mb-5">
            <form onSubmit={handleSearch} className="row g-2 align-items-center">
              <div className="col-md-7">
                <div className="search-input">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by model, brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <option value="">All Brands</option>
                  <option value="Honda">Honda</option>
                  <option value="Yamaha">Yamaha</option>
                  <option value="Bajaj">Bajaj</option>
                  <option value="TVS">TVS</option>
                  <option value="Hero">Hero</option>
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">All Prices</option>
                  <option value="100000-120000">₹1,00,000 – ₹1,20,000</option>
                  <option value="120000-150000">₹1,20,000 – ₹1,50,000</option>
                  <option value="150000-200000">₹1,50,000 – ₹2,00,000</option>
                  <option value="200000+">₹2,00,000+</option>
                </select>
              </div>

              <div className="col-md-2 d-grid">
                <Button type="submit" variant="primary">
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Vehicles Grid */}
          {vehicles.length === 0 ? (
            <div className="text-center py-5">
              <Bike size={70} className="text-muted mb-3" />
              <h5>No vehicles found</h5>
              <p className="text-muted">
                Try changing filters or search keywords
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {vehicles.map((v, i) => (
                <motion.div
                  key={v.id}
                  className="col-md-6 col-lg-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="vehicle-card h-100">
                    <div className="image-wrap">
                      {v.image ? (
                        <img src={v.image} alt={v.model} />
                      ) : (
                        <Bike size={60} className="text-muted" />
                      )}
                      <span
                        className={`stock-badge ${v.is_in_stock ? 'in' : 'out'
                          }`}
                      >
                        {v.is_in_stock ? 'In Stock' : 'Out'}
                      </span>
                    </div>

                    <div className="card-body">
                      <h5 className="mb-1">
                        {v.brand} {v.model}
                      </h5>

                      <p className="text-muted small mb-2">
                        {v.description && v.description.trim()
                          ? `${v.description.slice(0, 80)}...`
                          : 'No description'}
                      </p>

                      <div className="price-row mb-3">
                        <IndianRupee size={18} />
                        {Number(v.price).toLocaleString()}
                      </div>

                      <Link
                        to={`/vehicles/${v.id}`}
                        className="btn btn-primary w-100"
                      >
                        View Details
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ================= CUSTOM STYLES ================= */}
      <style>{`
        .vehicles-header h1 {
          font-weight: 700;
        }

        .search-filter-box {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 12px;
        }

        .search-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .search-input input {
          border: none;
          outline: none;
          width: 100%;
        }

        .vehicle-card {
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .vehicle-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }

        .image-wrap {
          position: relative;
          height: 200px;
          background: #f1f1f1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          font-size: 12px;
          border-radius: 20px;
          color: #fff;
        }

        .stock-badge.in {
          background: #28a745;
        }

        .stock-badge.out {
          background: #dc3545;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          color: #0d6efd;
          font-size: 18px;
        }
      `}</style>
    </Layout>
  );
};

export default Vehicles;
