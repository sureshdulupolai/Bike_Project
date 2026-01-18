import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = user ? (
    isAdmin() ? [
      { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
      { to: '/admin/vehicles', label: 'Vehicles', icon: Bike },
      { to: '/admin/sales', label: 'Sales', icon: ShoppingCart },
      { to: '/admin/services', label: 'Services', icon: Wrench },
      { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    ] : [
      { to: '/customer/dashboard', label: 'Dashboard', icon: Home },
      { to: '/vehicles', label: 'Vehicles', icon: Bike },
      { to: '/customer/purchases', label: 'My Purchases', icon: ShoppingCart },
      { to: '/customer/services', label: 'My Services', icon: Wrench },
    ]
  ) : [];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-lg">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <Bike className="me-2" size={28} />
          <span className="fw-bold">2 Wheeler Sales</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navLinks.map((link) => (
              <li key={link.to} className="nav-item">
                <Link 
                  className="nav-link" 
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={18} className="me-1" />
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Mobile Logout Option */}
            {user && (
              <>
                <li className="nav-item d-lg-none">
                  <Link 
                    className="nav-link" 
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} className="me-1" />
                    Profile
                  </Link>
                </li>
                <li className="nav-item d-lg-none">
                  <button 
                    className="nav-link text-danger border-0 bg-transparent w-100 text-start"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={18} className="me-1" />
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <div className="dropdown">
                  <button
                    className="btn btn-light dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="userMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <User size={18} className="me-2" />
                    {user.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <User size={16} className="me-2" />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <LogOut size={16} className="me-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
                {/* Visible Logout Button */}
                <button
                  className="btn btn-outline-light d-flex align-items-center"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={18} className="me-1" />
                  <span className="d-none d-md-inline">Logout</span>
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
  );
};

export default Navbar;
