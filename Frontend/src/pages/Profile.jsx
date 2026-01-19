import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, LogOut } from "lucide-react";
import Layout from "../components/Layout/Layout";
import Card from "../components/UI/Card";
import Loading from "../components/UI/Loading";
import Button from "../components/UI/Button";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", mobile: "" });
  const [initialData, setInitialData] = useState({ name: "", mobile: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || "",
        mobile: user.mobile || "",
      };
      setFormData(data);
      setInitialData(data);
      setLoading(false);
    }
  }, [user]);

  /** 🔹 Detect changes */
  const isDirty = useMemo(() => {
    return (
      formData.name !== initialData.name ||
      formData.mobile !== initialData.mobile
    );
  }, [formData, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;

    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      setInitialData(formData);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /** 🔹 Custom Logout Confirm */
  const handleLogout = () => {
    toast(
      ({ closeToast }) => (
        <div className="text-center">
          <p className="mb-3 fw-semibold">Are you sure you want to logout?</p>
          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={closeToast}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={async () => {
                closeToast();
                await logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      }
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <Loading />
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="row justify-content-center"
          >
            <div className="col-lg-6 col-md-8">
              <Card className="profile-card p-4">
                {/* HEADER */}
                <div className="text-center mb-4">
                  <div className="profile-avatar mx-auto mb-3">
                    <User size={36} />
                  </div>
                  <h3 className="mb-1">{user.name || "Your Name"}</h3>
                  <span className="badge bg-primary-subtle text-primary px-3 py-1">
                    {user.role?.toUpperCase()}
                  </span>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* EMAIL */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <div className="input-icon">
                      <Mail size={18} />
                      <input
                        type="email"
                        className="form-control"
                        value={user.email}
                        disabled
                      />
                    </div>
                  </div>

                  {/* NAME */}
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <div className="input-icon">
                      <User size={18} />
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="mb-4">
                    <label className="form-label">Mobile</label>
                    <div className="input-icon">
                      <Phone size={18} />
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="d-grid gap-3">
                    {isDirty && (
                      <Button
                        type="submit"
                        variant="primary"
                        loading={saving}
                        className="py-2"
                      >
                        <Save size={18} className="me-2" />
                        Save Changes
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline-danger"
                      className="py-2"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} className="me-2" />
                      Logout
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </motion.div>
        </div>
      </Layout>

      {/* STYLES */}
      <style>
        {`
        .profile-card {
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff, #f8f9ff);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3a86ff, #5f9cff);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .input-icon {
          position: relative;
        }
        .input-icon svg {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          color: #6c757d;
        }
        .input-icon input {
          padding-left: 40px;
          height: 48px;
          border-radius: 10px;
        }
        `}
      </style>
    </ProtectedRoute>
  );
};

export default Profile;
