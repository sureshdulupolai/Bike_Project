import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, Mail, ArrowLeft } from 'lucide-react';
import Button from '../../components/UI/Button';
import PublicRoute from '../../components/PublicRoute';
import emailjs from '@emailjs/browser';
import { API_BASE_URL } from '../../config/api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Load email
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pending_verification_email');
    if (!pendingEmail) {
      navigate('/register');
    } else {
      setEmail(pendingEmail);
    }
  }, [navigate]);

  // Timer
  useEffect(() => {
    if (timer === 0) return;
    const i = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // VERIFY OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete 6 digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('OTP verified successfully!');
        localStorage.removeItem('pending_verification_email');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.error || 'Invalid OTP.');
      }
    } catch {
      setError('OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Call backend to generate OTP
      const res = await fetch(`${API_BASE_URL}/auth/otp/resend/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to resend OTP');
        setLoading(false);
        return;
      }

      const otpCode = data.otp; // ✅ Use backend-generated OTP

      // EmailJS send
      await emailjs.send(
        "service_5bm58np",
        "template_1v2c0p9",
        {
          to_email: email,
          name: "BikeHub",
          time: new Date().toLocaleString(),
          message: `Your OTP is: ${otpCode}` // ✅ use backend OTP
        },
        "wtfODQiMYk4i24OWU"
      );

      setTimer(60);
      setSuccess('OTP resent successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to resend OTP.');
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card shadow-lg border-0 position-relative">

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-light position-absolute"
                    style={{ top: 15, left: 15, width: 38, height: 38, borderRadius: '50%' }}
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="card-body p-5 text-center">
                    <Bike size={48} className="text-primary mb-3" />
                    <h2 className="fw-bold">Verify Email</h2>
                    <p className="text-muted">
                      Enter OTP sent to <br />
                      <strong>{email}</strong>
                    </p>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                      <div className="d-flex justify-content-center gap-2 mb-4">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            className="form-control text-center"
                            style={{ width: 48, fontSize: '1.4rem' }}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                          />
                        ))}
                      </div>

                      <Button type="submit" className="w-100 mb-3" loading={loading}>
                        Verify OTP
                      </Button>
                    </form>

                    {timer > 0 ? (
                      <small className="text-muted">Resend OTP in {timer}s</small>
                    ) : (
                      <button
                        className="btn btn-link p-0"
                        onClick={handleResend}
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    )}
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
