import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, ShoppingCart, Wrench, Shield, TrendingUp, Users } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const Home = () => {
  const features = [
    {
      icon: Bike,
      title: 'Wide Vehicle Selection',
      description: 'Browse through our extensive collection of 2-wheelers',
    },
    {
      icon: ShoppingCart,
      title: 'Easy Purchase',
      description: 'Simple and secure vehicle purchase process',
    },
    {
      icon: Wrench,
      title: 'Maintenance Services',
      description: 'Professional maintenance and repair services',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data and transactions are safe with us',
    },
  ];

  return (
    <Layout>
      <div className="bg-primary text-white py-5">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-5"
          >
            <Bike size={64} className="mb-3" />
            <h1 className="display-4 fw-bold mb-3">2 Wheeler Sales & Maintenance</h1>
            <p className="lead mb-4">
              Your one-stop solution for buying and maintaining 2-wheelers
            </p>
            <div>
              <Link to="/register">
                <Button variant="light" size="lg" className="me-3">
                  Get Started
                </Button>
              </Link>
              <Link to="/vehicles">
                <Button variant="outline-light" size="lg">
                  Browse Vehicles
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container my-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="row g-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="col-md-6 col-lg-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="h-100 text-center p-4">
                <feature.icon size={48} className="text-primary mb-3" />
                <h5>{feature.title}</h5>
                <p className="text-muted mb-0">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
