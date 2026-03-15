import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import OfflineIndicator from './components/OfflineIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import SEOHead from './components/SEOHead';
import { setLogoutHandler } from './config/apiConfig';
import { logout } from './features/auth/authSlice';

// Lazy load components for code splitting
const HeroSection = lazy(() => import('./components/HeroSection'));
const PopularRoutes = lazy(() => import('./components/PopularRoutes'));
const Recommendations = lazy(() => import('./components/Recommendations'));
const ServiceCities = lazy(() => import('./components/ServiceCities'));
const TravelPackages = lazy(() => import('./components/TravelPackages'));
const Blog = lazy(() => import('./components/Blog'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const ContactUs = lazy(() => import('./components/ContactUs'));
const Login = lazy(() => import('./components/Login'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const Register = lazy(() => import('./components/Register'));
const Profile = lazy(() => import('./components/Profile'));
const BookingHistory = lazy(() => import('./components/BookingHistory'));
const GuestBookingStatus = lazy(() => import('./components/GuestBookingStatus'));
const DriverDashboard = lazy(() => import('./components/DriverDashboard'));
const RideTracker = lazy(() => import('./components/RideTracker'));
const CityPage = lazy(() => import('./components/CityPage'));
const ServicePage = lazy(() => import('./components/ServicePage'));
const AdminRoutes = lazy(() => import('./features/admin/AdminRoutes'));

// Loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const HomePage = () => (
  <>
    <SEOHead pageKey="home" />
    <Header />
    <Suspense fallback={<PageLoader />}>
      <HeroSection />
      <PopularRoutes />
      <Recommendations />
      <ServiceCities />
      <TravelPackages />
      <Blog />
    </Suspense>
  </>
);

// Inner app component that can use hooks
function AppContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Set logout handler for API client on mount
  useEffect(() => {
    setLogoutHandler(() => {
      dispatch(logout());
      navigate('/login', { replace: true });
    });
  }, [dispatch, navigate]);

  return (
    <>
      <OfflineIndicator />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<><SEOHead pageKey="about" /><Header /><AboutUs /></>} />
          <Route path="/packages" element={<><SEOHead pageKey="packages" /><Header /><TravelPackages /></>} />
          <Route path="/blog" element={<><SEOHead pageKey="blog" /><Header /><Blog /></>} />
          <Route path="/contact" element={<><SEOHead pageKey="contact" /><Header /><ContactUs /></>} />

          {/* City Pages */}
          <Route path="/city/:cityName" element={<Suspense fallback={<PageLoader />}><CityPage /></Suspense>} />

          {/* Service Pages */}
          <Route path="/service/:serviceName" element={<Suspense fallback={<PageLoader />}><ServicePage /></Suspense>} />

          {/* User Authentication Routes */}
          <Route path="/login" element={<><SEOHead pageKey="login" /><Header /><Login /></>} />
          <Route path="/register" element={<><SEOHead pageKey="register" /><Header /><Register /></>} />

          {/* Guest Booking Status Route (public, no auth required) */}
          <Route path="/bookings/status/:bookingId" element={<><SEOHead pageKey="home" /><Header /><GuestBookingStatus /></>} />
          <Route path="/bookings/status" element={<><SEOHead pageKey="home" /><Header /><GuestBookingStatus /></>} />

          {/* Admin Authentication Route */}
          <Route path="/admin-login" element={<><SEOHead pageKey="login" /><Header /><AdminLogin /></>} />

          {/* User Protected Routes */}
          <Route path="/history" element={<ProtectedRoute><><SEOHead pageKey="bookingHistory" /><Header /><BookingHistory /></></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><><SEOHead pageKey="profile" /><Header /><Profile /></></ProtectedRoute>} />
          <Route path="/ride-tracker" element={<ProtectedRoute><><SEOHead pageKey="home" /><Header /><RideTracker /></></ProtectedRoute>} />
          <Route path="/driver/dashboard" element={<ProtectedRoute><><SEOHead pageKey="home" /><Header /><DriverDashboard /></></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Suspense fallback={<PageLoader />}>
                    <AdminRoutes />
                  </Suspense>
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router basename="/">
          <AppContent />
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
