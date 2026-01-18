import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, User, Mail, Phone, Lock } from 'lucide-react';
import Button from '../../components/UI/Button';
import PublicRoute from '../../components/PublicRoute';
import { API_BASE_URL } from '../../config/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirm: '',
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: "admin"
      };

      const res = await fetch(`${API_BASE_URL}/auth/admin/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend might return errors object or detail
        const backendError = data?.errors
          ? Object.values(data.errors).flat()[0]
          : data?.detail || 'Registration failed';
        setError(backendError);
        setLoading(false);
        return;
      }

      // Admin registered successfully, no OTP
      alert('Admin registered successfully! You can now login.');
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card shadow-lg border-0">
                  <div className="card-body p-5">
                    <div className="text-center mb-4">
                      <Bike size={48} className="text-primary mb-3" />
                      <h2 className="fw-bold">Admin Registration</h2>
                      <p className="text-muted">Create an admin account</p>
                    </div>

                    {error && (
                      <div className="alert alert-danger">{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                      {["name", "email", "mobile", "password", "password_confirm"].map((field) => (
                        <div className="mb-3" key={field}>
                          <label className="form-label">
                            {field === "name" && <User size={16} className="me-1" />}
                            {field === "email" && <Mail size={16} className="me-1" />}
                            {field === "mobile" && <Phone size={16} className="me-1" />}
                            {field.includes("password") && <Lock size={16} className="me-1" />}
                            {field === "password_confirm" ? "Confirm Password" : field.charAt(0).toUpperCase() + field.slice(1)}
                          </label>
                          <input
                            type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
                            className="form-control"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                            minLength={field.includes("password") ? 8 : undefined}
                          />
                        </div>
                      ))}

                      <Button type="submit" variant="primary" className="w-100 mb-3" loading={loading}>
                        Register
                      </Button>
                    </form>

                    <div className="text-center">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary">Login here</Link>
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
