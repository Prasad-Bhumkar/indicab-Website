import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load route components for code splitting
const DriverDashboard = React.lazy(() => import('./features/driver/DriverDashboard'));
const DriverRegister = React.lazy(() => import('./features/driver/DriverRegister'));
const ProfilePage = React.lazy(() => import('./features/profile/ProfilePage'));
const PaymentForm = React.lazy(() => import('./features/payment/PaymentForm'));
const AdminRoutes = React.lazy(() => import('./features/admin/AdminRoutes'));
const BlogPage = React.lazy(() => import('./components/Blog'));
const AboutUsPage = React.lazy(() => import('./components/AboutUs'));
const TravelPackagesPage = React.lazy(() => import('./components/TravelPackages'));

// Eagerly load frequently used components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PopularRoutes from './components/PopularRoutes';
import Recommendations from './components/Recommendations';
import ServiceCities from './components/ServiceCities';
import AppSection from './components/AppSection';
import BookingHistory from './components/BookingHistory';
import ContactUs from './components/ContactUs';
import ConnectionStatus from './components/ConnectionStatus';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './features/auth/ProtectedRoute';

// Loading fallback component
const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <Router basename="/indicab-Website">
      <ConnectionStatus />
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <PopularRoutes />
              <Recommendations />
              <ServiceCities />
              <AppSection />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/history" element={<BookingHistory />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route
          path="/packages"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TravelPackagesPage />
            </Suspense>
          }
        />
        <Route
          path="/blog"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <BlogPage />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AboutUsPage />
            </Suspense>
          }
        />
        <Route
          path="/driver/register"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DriverRegister />
            </Suspense>
          }
        />
        <Route
          path="/driver/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DriverDashboard />
            </Suspense>
          }
        />
        <Route
          path="/payment"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PaymentForm />
            </Suspense>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminRoutes />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
