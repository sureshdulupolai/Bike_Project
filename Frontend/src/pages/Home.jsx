import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bike,
  ShoppingCart,
  Wrench,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
} from 'lucide-react';

import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';


const Home = () => {
  const features = [
    {
      icon: Bike,
      title: 'Wide Vehicle Selection',
      description: 'Latest & verified 2-wheelers from trusted sellers',
    },
    {
      icon: ShoppingCart,
      title: 'Easy Purchase',
      description: 'Smooth, transparent and hassle-free buying experience',
    },
    {
      icon: Wrench,
      title: 'Maintenance Services',
      description: 'Professional servicing with genuine spare parts',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data & payments are fully protected',
    },
  ];

  const steps = [
    {
      title: 'Browse Vehicles',
      desc: 'Explore bikes by brand, price & condition',
    },
    {
      title: 'Buy or Book Service',
      desc: 'Purchase instantly or schedule maintenance',
    },
    {
      title: 'Track & Relax',
      desc: 'Track order & enjoy stress-free ownership',
    },
  ];

  const { user } = useAuth();

  return (
    <Layout>

      {/* HERO */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-5"
          >
            <Bike size={64} className="mb-3" />
            <h1 className="display-4 fw-bold mb-3">
              2-Wheeler Sales & Maintenance Platform
            </h1>
            <p className="lead mb-4">
              Buy, service & manage your bike — all in one trusted platform
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

      {/* FEATURES */}
      <div className="container my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Everything You Need for Your Bike</h2>
          <p className="text-muted">
            From purchase to maintenance, we’ve got you covered
          </p>
        </div>

        <div className="row g-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="col-md-6 col-lg-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-100 text-center p-4 border-0 shadow-sm">
                <feature.icon size={48} className="text-primary mb-3" />
                <h5 className="fw-semibold">{feature.title}</h5>
                <p className="text-muted mb-0">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How It Works</h2>
            <p className="text-muted">Simple, fast & transparent process</p>
          </div>

          <div className="row g-4">
            {steps.map((step, index) => (
              <div key={index} className="col-md-4">
                <Card className="p-4 h-100 border-0 shadow-sm">
                  <h1 className="fw-bold text-primary mb-3">
                    {index + 1}
                  </h1>
                  <h5>{step.title}</h5>
                  <p className="text-muted mb-0">{step.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="container my-5">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4">
            <h2 className="fw-bold mb-3">
              Why Choose Our Platform?
            </h2>
            <p className="text-muted mb-4">
              We focus on quality, trust and long-term customer satisfaction.
            </p>

            <ul className="list-unstyled">
              {[
                'Verified vehicles & service partners',
                'Transparent pricing',
                'Professional service management',
                'Dedicated customer support',
              ].map((item, i) => (
                <li key={i} className="mb-2">
                  <CheckCircle size={18} className="text-success me-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-6 text-center">
            <TrendingUp size={180} className="text-primary opacity-25" />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <h2 className="fw-bold">10K+</h2>
              <p className="mb-0">Happy Customers</p>
            </div>
            <div className="col-md-4 mb-3">
              <h2 className="fw-bold">5K+</h2>
              <p className="mb-0">Vehicles Sold</p>
            </div>
            <div className="col-md-4 mb-3">
              <h2 className="fw-bold">24/7</h2>
              <p className="mb-0">Service Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      {!user && (
        <div className="container my-5 text-center">
          <h2 className="fw-bold mb-3">
            Ready to Experience a Better Bike Journey?
          </h2>
          <p className="text-muted mb-4">
            Join thousands of customers who trust our platform
          </p>
          <Link to="/register">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      )}

    </Layout>
  );
};

export default Home;
