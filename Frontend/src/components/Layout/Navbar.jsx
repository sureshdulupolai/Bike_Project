import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  LogOut,
  User,
  ShoppingCart,
  Wrench,
  BarChart3,
  Bike,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinks = user
    ? isAdmin()
      ? [
          { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
          { to: '/admin/vehicles', label: 'Vehicles', icon: Bike },
          { to: '/admin/sales', label: 'Sales', icon: ShoppingCart },
          { to: '/admin/services', label: 'Services', icon: Wrench },
          { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
        ]
      : [
          { to: '/customer/dashboard', label: 'Dashboard', icon: Home },
          { to: '/vehicles', label: 'Vehicles', icon: Bike },
          { to: '/customer/purchases', label: 'My Purchases', icon: ShoppingCart },
          { to: '/customer/services', label: 'My Services', icon: Wrench },
        ]
    : [];

  return (
    <>
      {/* INLINE CSS (same file) */}
<style>
{`
  .icon-only {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 10px;
    border-radius: 8px;
    transition: all 0.2s ease;
    color: rgba(255,255,255,0.7);
  }

  .icon-only:hover {
    color: #ffffff;
  }

  /* ACTIVE ICON — NO BACKGROUND */
  .icon-only.active {
    color: #ffffff !important;
  }

  .icon-only.active svg {
    stroke-width: 2.8;
    transform: scale(1.15);
  }
`}
</style>


      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-lg">
        <div className="container-fluid">
          {/* BRAND */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <Bike className="me-2" size={28} />
            <span className="fw-bold">BikeHub</span>
          </Link>

          {/* TOGGLER */}
          <button
            className="navbar-toggler"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            {/* LEFT NAV ICONS */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <li key={to} className="nav-item me-3">
                  <Link
                    to={to}
                    className={`nav-link icon-only ${
                      isActive(to) ? 'active' : ''
                    }`}
                    title={label}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                  </Link>
                </li>
              ))}
            </ul>

            {/* RIGHT SIDE */}
            <div className="d-flex align-items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="nav-link icon-only"
                    title="Profile"
                  >
                    <User size={20} />
                  </Link>

                  <button
                    className="nav-link icon-only text-danger border-0 bg-transparent"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <div>
                  <Link to="/login" className="btn btn-outline-light me-2">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-light">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
