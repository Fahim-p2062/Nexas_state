import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import LandlordDashboard from './pages/LandlordDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Tenants from './pages/Tenants';
import TenantDetail from './pages/TenantDetail';
import Leases from './pages/Leases';
import LeaseDetail from './pages/LeaseDetail';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Staff from './pages/Staff';
import Documents from './pages/Documents';
import Expenses from './pages/Expenses';
import TenantPortal from './pages/TenantPortal';
import Notifications from './pages/Notifications';
import Complaints from './pages/Complaints';
import BrowseProperties from './pages/BrowseProperties';
import BrowsePropertyDetail from './pages/BrowsePropertyDetail';
import MyBookings from './pages/MyBookings';
import LandlordBookings from './pages/LandlordBookings';

// Layout wrapper for authenticated pages
const AppLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <Navbar />
      <main style={{ marginLeft: '220px', paddingTop: '60px', padding: '80px 32px 32px 252px', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const { isAuthenticated, role } = useAuth();

  const getRedirect = () => {
    if (role === 'Admin') return '/admin';
    if (role === 'Tenant') return '/tenant-portal';
    return '/dashboard';
  };

  return (
    <Routes>
      {/* Public routes — Landing is always accessible */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={getRedirect()} /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to={getRedirect()} /> : <Register />
      } />

      {/* Protected routes with layout */}
      <Route element={
        <ProtectedRoute roles={['Landlord', 'Tenant', 'Staff', 'Admin']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/complaints" element={
          <ProtectedRoute roles={['Admin', 'Landlord', 'Tenant']}><Complaints /></ProtectedRoute>
        } />

        {/* Landlord routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['Landlord']}><LandlordDashboard /></ProtectedRoute>
        } />
        <Route path="/properties" element={
          <ProtectedRoute roles={['Landlord']}><Properties /></ProtectedRoute>
        } />
        <Route path="/properties/:id" element={
          <ProtectedRoute roles={['Landlord']}><PropertyDetail /></ProtectedRoute>
        } />
        <Route path="/landlord-bookings" element={
          <ProtectedRoute roles={['Landlord']}><LandlordBookings /></ProtectedRoute>
        } />
        <Route path="/tenants" element={
          <ProtectedRoute roles={['Landlord']}><Tenants /></ProtectedRoute>
        } />
        <Route path="/tenants/:id" element={
          <ProtectedRoute roles={['Landlord']}><TenantDetail /></ProtectedRoute>
        } />
        <Route path="/leases" element={
          <ProtectedRoute roles={['Landlord']}><Leases /></ProtectedRoute>
        } />
        <Route path="/leases/:id" element={
          <ProtectedRoute roles={['Landlord']}><LeaseDetail /></ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute roles={['Landlord']}><Payments /></ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute roles={['Landlord']}><Staff /></ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute roles={['Landlord']}><Documents /></ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute roles={['Landlord']}><Expenses /></ProtectedRoute>
        } />

        {/* Shared routes — Landlord and Staff only for maintenance */}
        <Route path="/maintenance" element={
          <ProtectedRoute roles={['Landlord', 'Tenant', 'Staff']}><Maintenance /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute roles={['Landlord', 'Tenant', 'Staff']}><Notifications /></ProtectedRoute>
        } />

        {/* Tenant routes */}
        <Route path="/tenant-portal" element={
          <ProtectedRoute roles={['Tenant']}><TenantPortal /></ProtectedRoute>
        } />
        <Route path="/browse-properties" element={
          <ProtectedRoute roles={['Tenant']}><BrowseProperties /></ProtectedRoute>
        } />
        <Route path="/browse-properties/:id" element={
          <ProtectedRoute roles={['Tenant']}><BrowsePropertyDetail /></ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['Tenant']}><MyBookings /></ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
