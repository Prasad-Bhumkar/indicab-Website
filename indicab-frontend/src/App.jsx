import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DriverDashboard from './features/driver/DriverDashboard';
import DriverRegister from './features/driver/DriverRegister';
import ProfilePage from './features/profile/ProfilePage';
import PaymentForm from './features/payment/PaymentForm';
import AdminRoutes from './features/admin/AdminRoutes';

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PopularRoutes from './components/PopularRoutes';
import Recommendations from './components/Recommendations';
import ServiceCities from './components/ServiceCities';
import AppSection from './components/AppSection';
import BookingHistory from './components/BookingHistory';
import ContactUs from './components/ContactUs';
import TravelPackages from './components/TravelPackages';
import Blog from './components/Blog';
import AboutUs from './components/AboutUs';
import ConnectionStatus from './components/ConnectionStatus';
// ...existing code...
import ProtectedRoute from './features/auth/ProtectedRoute';

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
  <Router>
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
      <Route path="/history" element={<BookingHistory />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/packages" element={<TravelPackages />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/driver/register" element={<DriverRegister />} />
      <Route path="/driver/dashboard" element={<DriverDashboard />} />
      <Route path="/payment" element={<PaymentForm />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Router>
);
}

export default App;
