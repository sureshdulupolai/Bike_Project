import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Bike, Mail } from 'lucide-react';
import Button from '../../components/UI/Button';
import PublicRoute from '../../components/PublicRoute';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP, resendOTP } = useAuth(); // Assuming you add a resend function in AuthContext
  const navigate = useNavigate();

  // Load pending email from localStorage
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pending_verification_email');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      navigate('/register');
    }
  }, [navigate]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only digits, max 1

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      alert('Please enter a complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(email, otpCode);
      if (result.success) {
        localStorage.removeItem('pending_verification_email');
        alert('Email verified successfully!');
        navigate('/login');
      } else {
        alert(result.message || 'Invalid OTP.');
      }
    } catch (err) {
      console.error(err);
      alert('OTP verification failed. Try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendOTP(email); // Implement resendOTP in AuthContext
      alert('OTP has been resent to your email.');
    } catch (err) {
      console.error(err);
      alert('Failed to resend OTP. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-vh-100 d-flex align-items-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card shadow-lg border-0">
                  <div className="card-body p-5">
                    <div className="text-center mb-4">
                      <Bike size={48} className="text-primary mb-3" />
                      <h2 className="fw-bold">Verify Email</h2>
                      <p className="text-muted">
                        Enter the OTP sent to <br />
                        <strong>{email}</strong>
                      </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label text-center w-100">
                          <Mail size={16} className="me-1" /> OTP Code
                        </label>
                        <div className="d-flex justify-content-center gap-2">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              className="form-control text-center"
                              style={{ width: '50px', fontSize: '1.5rem' }}
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              required
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-100 mb-3"
                        loading={loading}
                      >
                        Verify OTP
                      </Button>
                    </form>

                    <div className="text-center">
                      <p className="text-muted small mb-0">
                        Didn't receive OTP?{' '}
                        <button
                          type="button"
                          onClick={handleResend}
                          className="btn btn-link p-0 text-primary"
                          style={{ fontSize: '0.875rem' }}
                          disabled={loading}
                        >
                          Resend
                        </button>
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

export default VerifyOTP;
