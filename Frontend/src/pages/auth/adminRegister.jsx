import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bike,
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import Button from '../../components/UI/Button';
import PublicRoute from '../../components/PublicRoute';
import { API_BASE_URL } from '../../config/api';

const ADMIN_SECURITY_CODE = "ADMIN-2026";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirm: '',
    role: 'admin',
    security_code: '',
  });

  const [agreed, setAgreed] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(location.state?.from || '/');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔐 VERIFY SECURITY CODE
  const handleVerify = () => {
    setError('');

    if (!agreed) {
      setError('Please confirm authorization checkbox.');
      return;
    }

    if (formData.security_code !== ADMIN_SECURITY_CODE) {
      setError('Invalid admin security code.');
      return;
    }

    setIsVerified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) return;

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match!');
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
        const backendError =
          data?.errors
            ? Object.values(data.errors).flat()[0]
            : data?.detail || 'Registration failed';
        setError(backendError);
        setLoading(false);
        return;
      }

      alert('Admin registered successfully!');
      navigate('/login');

    } catch (err) {
      console.error(err);
      setError('Something went wrong! Please try again.');
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card shadow-lg border-0 position-relative">

                  {/* 🔙 Back */}
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
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* 🔐 SECURITY VERIFICATION (TOP) */}
                    {!isVerified && (
                      <div className="border rounded p-3 mb-4 bg-light">
                        <h6 className="fw-bold mb-3">
                          <ShieldCheck size={16} className="me-1" />
                          Admin Verification
                        </h6>

                        <input
                          type="text"
                          className="form-control mb-3"
                          placeholder="Enter admin security code"
                          name="security_code"
                          value={formData.security_code}
                          onChange={handleChange}
                        />

                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                          />
                          <label className="form-check-label">
                            I am authorized to create an admin account
                          </label>
                        </div>

                        <Button className="w-100" onClick={handleVerify}>
                          Verify Access
                        </Button>
                      </div>
                    )}

                    {/* ✅ VERIFIED BADGE */}
                    {isVerified && (
                      <div className="alert alert-success d-flex align-items-center gap-2">
                        <CheckCircle size={18} />
                        Admin access verified. You may proceed.
                      </div>
                    )}

                    {/* 🧾 FORM (LOCKED UNTIL VERIFIED) */}
                    <form onSubmit={handleSubmit}>
                      {["name", "email", "mobile", "password", "password_confirm"].map((field) => (
                        <div className="mb-3" key={field}>
                          <label className="form-label">
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                          </label>
                          <input
                            type={field.includes("password") ? "password" : "text"}
                            className="form-control"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            disabled={!isVerified}
                            required
                          />
                        </div>
                      ))}

                      <Button
                        type="submit"
                        className="w-100"
                        loading={loading}
                        disabled={!isVerified}
                      >
                        Register Admin
                      </Button>
                    </form>

                    <div className="text-center mt-3">
                      Already have an account?
                      <Link to="/login" className='ms-1' style={{ textDecoration: 'none' }}>Login</Link>
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
