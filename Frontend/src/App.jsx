import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/auth/adminRegister';
import DeveloperRegister from './pages/auth/DeveloperRegister';
import VerifyOTP from './pages/auth/VerifyOTP';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Profile from './pages/Profile';
import NotFoundPage from './pages/NotFoundPage';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import Purchases from './pages/customer/Purchases';
import Services from './pages/customer/Services';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminVehicles from './pages/admin/Vehicles';
import AdminSales from './pages/admin/Sales';
import AdminServices from './pages/admin/Services';
import AdminReports from './pages/admin/Reports';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/admin" element={<AdminRegister />} />
        <Route path="/register/developer" element={<DeveloperRegister />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />

        {/* Protected Routes */}
        <Route path="/profile" element={<Profile />} />

        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/purchases" element={<Purchases />} />
        <Route path="/customer/services" element={<Services />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/vehicles" element={<AdminVehicles />} />
        <Route path="/admin/sales" element={<AdminSales />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/reports" element={<AdminReports />} />

        {/* 404 - Catch all undefined routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;
