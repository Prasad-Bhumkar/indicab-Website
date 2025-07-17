import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PopularRoutes from './components/PopularRoutes';
import Recommendations from './components/Recommendations';
import ServiceCities from './components/ServiceCities';
import AppSection from './components/AppSection';
import BookingHistory from './components/BookingHistory';

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
      <Header />
      <Routes>
        <Route path="/" element={
          <>
            <HeroSection />
            <PopularRoutes />
            <Recommendations />
            <ServiceCities />
            <AppSection />
            
          </>
        } />
        <Route path="/history" element={<BookingHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
