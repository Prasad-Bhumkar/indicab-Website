import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import OfflineIndicator from './components/OfflineIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

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
const Register = lazy(() => import('./components/Register'));
const Profile = lazy(() => import('./components/Profile'));
const BookingHistory = lazy(() => import('./components/BookingHistory'));
const DriverDashboard = lazy(() => import('./components/DriverDashboard'));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const RideTracker = lazy(() => import('./components/RideTracker'));

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

function App() {
  return (
    <ErrorBoundary>
      <Router basename="/">
        <OfflineIndicator />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<><Header /><AboutUs /></>} />
            <Route path="/packages" element={<><Header /><TravelPackages /></>} />
            <Route path="/blog" element={<><Header /><Blog /></>} />
            <Route path="/contact" element={<><Header /><ContactUs /></>} />
            <Route path="/login" element={<><Header /><Login /></>} />
            <Route path="/register" element={<><Header /><Register /></>} />
            <Route path="/history" element={<ProtectedRoute><><Header /><BookingHistory /></></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><><Header /><Profile /></></ProtectedRoute>} />
            <Route path="/ride-tracker" element={<ProtectedRoute><><Header /><RideTracker /></></ProtectedRoute>} />
            <Route path="/driver/dashboard" element={<ProtectedRoute><><Header /><DriverDashboard /></></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><><Header /><AdminDashboard /></></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
