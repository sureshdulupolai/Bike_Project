import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, User, Mail, Phone, Lock } from 'lucide-react';
import Button from '../../components/UI/Button';
import PublicRoute from '../../components/PublicRoute';
import emailjs from '@emailjs/browser'; // ✅ EmailJS import
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // Register the user via backend
      const result = await register(formData);

      if (result.success) {
        // Send OTP via EmailJS
        const templateParams = {
          name: formData.name,
          to_email: formData.email,
          message: `Hello ${formData.name}, your OTP is ${result.otp}`,
          time: new Date().toLocaleString(),
        };

        await emailjs.send(
          "service_r8cniy2",
          "template_exgvesr",
          templateParams,
          "BwBgnnEEONzpzoNJG"
        );

        // Store email for OTP verification
        localStorage.setItem('pending_verification_email', formData.email);

        alert('Registration successful! OTP sent to your email.');
        navigate('/verify-otp');
      }
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.email ||
        error.response?.data?.mobile ||
        'Registration failed. Please try again.'
      );
    }

    setLoading(false);
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
                      <h2 className="fw-bold">Create Account</h2>
                      <p className="text-muted">Join us today!</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          <User size={16} className="me-1" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          <Mail size={16} className="me-1" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="mobile" className="form-label">
                          <Phone size={16} className="me-1" />
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="mobile"
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          <Lock size={16} className="me-1" />
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password_confirm" className="form-label">
                          <Lock size={16} className="me-1" />
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password_confirm"
                          value={formData.password_confirm}
                          onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-100 mb-3"
                        loading={loading}
                      >
                        Register
                      </Button>
                    </form>

                    <div className="text-center">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary text-decoration-none">
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

export default Register;
