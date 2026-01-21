import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, User, Mail, Phone, Lock, ArrowLeft } from 'lucide-react';
import Button from '../../components/UI/Button';
import Notification from '../../components/UI/Notification';
import PublicRoute from '../../components/PublicRoute';
import { useNotification } from '../../hooks/useNotification';
import { API_BASE_URL } from '../../config/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const { notification, showNotification } = useNotification();

  const navigate = useNavigate();
  const location = useLocation();

  // 🔙 Back handler (same as Register)
  const handleBack = () => {
    navigate(location.state?.from || '/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      showNotification('error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          data?.error ||
          Object.values(data || {}).flat().join(' ') ||
          'Registration failed';
        showNotification('error', message);
        return;
      }

      localStorage.setItem('pending_verification_email', formData.email);

      showNotification(
        'success',
        'Admin registered successfully! Please verify OTP.'
      );

      setTimeout(() => navigate('/verify-otp'), 1200);

    } catch (err) {
      showNotification('error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-vh-100 d-flex align-items-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card shadow-lg border-0 position-relative">

                  {/* 🔙 Back Button (same style) */}
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
                      <h2 className="fw-bold">Admin Registration</h2>
                      <p className="text-muted">
                        OTP verification required
                      </p>
                    </div>

                    {/* 🔔 Notification */}
                    <Notification
                      type={notification.type}
                      message={notification.message}
                    />

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">
                          <User size={16} className="me-1" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>

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

                      <div className="mb-3">
                        <label className="form-label">
                          <Phone size={16} className="me-1" />
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.mobile}
                          onChange={(e) =>
                            setFormData({ ...formData, mobile: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="mb-3">
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
                          minLength={8}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label">
                          <Lock size={16} className="me-1" />
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          value={formData.password_confirm}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password_confirm: e.target.value,
                            })
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
                        Register Admin
                      </Button>
                    </form>

                    <div className="text-center">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <Link
                          to="/login"
                          className="text-primary text-decoration-none"
                        >
                          Login here
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
    </PublicRoute>
  );
};

export default AdminRegister;
