import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Bike, Mail, Lock, ArrowLeft } from 'lucide-react';
import Button from '../../components/UI/Button';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔁 Back logic
  const handleBack = () => {
    const from = location.state?.from;
    navigate(from || '/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="card shadow-lg border-0 position-relative">
                
                {/* 🔙 Back Button */}
                <button
                  onClick={handleBack}
                  className="btn btn-light position-absolute d-flex align-items-center justify-content-center"
                  style={{
                    top: '15px',
                    left: '15px',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <Bike size={48} className="text-primary mb-3" />
                    <h2 className="fw-bold">Login</h2>
                    <p className="text-muted">Welcome back!</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">
                        <Mail size={16} className="me-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        <Lock size={16} className="me-1" />
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mb-3"
                      loading={loading}
                    >
                      Login
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="mb-0">
                      Don&apos;t have an account?{' '}
                      <Link to="/register" className="text-primary text-decoration-none">
                        Register here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
