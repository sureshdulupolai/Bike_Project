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

  useEffect(() => {
    fetchVehicles();
  }, [filterBrand]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterBrand) params.brand = filterBrand;
      if (searchTerm) params.search = searchTerm;

      const response = await vehicleService.getAll(params);
      setVehicles(response.results || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-2">Available Vehicles</h1>
              <p className="text-muted">Browse our collection of 2-wheelers</p>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-8">
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <div className="flex-grow-1">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="primary">
                  <Search size={18} />
                </Button>
              </form>
            </div>
            <div className="col-md-4">
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
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-5">
              <Bike size={64} className="text-muted mb-3" />
              <p className="text-muted">No vehicles found</p>
            </div>
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
                  <Card className="h-100">
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
                      <p className="card-text text-muted small">
                        {vehicle.description?.substring(0, 100)}...
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <strong className="text-primary d-flex align-items-center">
                            <IndianRupee size={18} />
                            {parseFloat(vehicle.price).toLocaleString()}
                          </strong>
                        </div>
                        <span className={`badge ${vehicle.is_in_stock ? 'bg-success' : 'bg-danger'}`}>
                          {vehicle.is_in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <div className="d-grid gap-2">
                        <Link
                          to={`/vehicles/${vehicle.id}`}
                          className="btn btn-primary"
                        >
                          View Details
                        </Link>
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
  );
};

export default Vehicles;
