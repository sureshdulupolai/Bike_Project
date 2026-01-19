import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle, AlertTriangle, Code } from 'lucide-react';
import Button from '../../components/UI/Button';
import PublicRoute from '../../components/PublicRoute';
import { API_BASE_URL } from '../../config/api';

const DEVELOPER_KEY = 'DEV-2026-SECURE';

const DeveloperRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirm: '',
    security_key: '',
  });

  const [verified, setVerified] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 3500);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const verifyKey = () => {
    if (formData.security_key !== DEVELOPER_KEY) {
      showAlert('error', 'Invalid developer security key');
      return;
    }
    showAlert('success', 'Developer access verified');
    setVerified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      showAlert('error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/developer/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert('error', data?.error || 'Registration failed');
        return;
      }

      showAlert('success', 'Developer registered successfully');
      setTimeout(() => navigate('/login'), 1500);

    } catch {
      showAlert('error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-vh-100 d-flex align-items-center bg-light">
        <div className="container mt-4 mb-4">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card shadow-lg border-0">
                  <div className="card-body p-5">

                    <div className="text-center mb-4">
                      <Code size={44} className="text-primary mb-2" />
                      <h3 className="fw-bold">Developer Registration</h3>
                      <p className="text-muted small">
                        Secure access required
                      </p>
                    </div>

                    {/* 🔔 Custom Alert */}
                    <AnimatePresence>
                      {alert.message && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`alert d-flex align-items-center gap-2 ${
                            alert.type === 'success'
                              ? 'alert-success'
                              : 'alert-danger'
                          }`}
                        >
                          {alert.type === 'success' ? (
                            <CheckCircle size={18} />
                          ) : (
                            <AlertTriangle size={18} />
                          )}
                          {alert.message}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!verified && (
                      <div className="mb-4">
                        <label className="form-label">
                          <ShieldCheck size={16} /> Developer Security Key
                        </label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          name="security_key"
                          value={formData.security_key}
                          onChange={handleChange}
                        />
                        <Button className="w-100" onClick={verifyKey}>
                          Verify Key
                        </Button>
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      {['name', 'email', 'mobile', 'password', 'password_confirm'].map((f) => (
                        <div className="mb-3" key={f}>
                          <label className="form-label text-capitalize">
                            {f.replace('_', ' ')}
                          </label>
                          <input
                            type={f.includes('password') ? 'password' : 'text'}
                            className="form-control"
                            name={f}
                            value={formData[f]}
                            onChange={handleChange}
                            disabled={!verified}
                            required
                          />
                        </div>
                      ))}

                      <Button
                        type="submit"
                        className="w-100"
                        disabled={!verified}
                        loading={loading}
                      >
                        Register Developer
                      </Button>
                    </form>

                    <div className="text-center mt-3">
                      <Link to="/login" className="text-decoration-none">
                        Back to Login
                      </Link>
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

export default DeveloperRegister;
