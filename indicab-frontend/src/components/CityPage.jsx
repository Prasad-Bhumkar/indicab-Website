import React from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SEOHead from './SEOHead';
import { getCitySEOData } from '../utils/seoConfig';

const CityPage = () => {
  const { cityName } = useParams();
  
  // Format city name for display (from kebab-case to proper case)
  const formattedCityName = cityName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const seoData = getCitySEOData(formattedCityName);

  return (
    <>
      <SEOHead
        pageKey="home"
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        path={seoData.path}
      />
      <Header />
      <div className="city-page-container">
        <div className="city-hero-section">
          <h1>{formattedCityName} - Reliable Ride Booking with IndiCab</h1>
          <p>Book your ride safely and affordably in {formattedCityName}</p>
        </div>

        <div className="city-content">
          <section className="about-service">
            <h2>Ride Booking Services in {formattedCityName}</h2>
            <p>
              IndiCab provides reliable, affordable, and safe ride-booking services across {formattedCityName}.
              Whether you need airport transfers, hourly rentals, or quick city rides, our trusted drivers are ready to serve you.
            </p>
          </section>

          <section className="service-features">
            <h3>Why Choose IndiCab in {formattedCityName}?</h3>
            <div className="features-grid">
              <div className="feature-card">
                <h4>Trusted Drivers</h4>
                <p>All drivers are verified and background-checked for your safety.</p>
              </div>
              <div className="feature-card">
                <h4>Affordable Rates</h4>
                <p>Transparent pricing with no hidden charges.</p>
              </div>
              <div className="feature-card">
                <h4>24/7 Support</h4>
                <p>Round-the-clock customer service to assist you anytime.</p>
              </div>
              <div className="feature-card">
                <h4>Easy Booking</h4>
                <p>Simple and quick booking process from your mobile or web.</p>
              </div>
            </div>
          </section>

          <section className="booking-cta">
            <h3>Ready to Book Your Ride in {formattedCityName}?</h3>
            <button className="btn btn-primary btn-lg">Book Now</button>
          </section>
        </div>
      </div>

      <style>{`
        .city-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .city-hero-section {
          padding: 60px 20px;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .city-hero-section h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .city-hero-section p {
          font-size: 1.2rem;
          margin: 0;
          opacity: 0.9;
        }

        .city-content {
          max-width: 1200px;
          margin: -40px auto 0;
          padding: 40px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .city-content section {
          margin-bottom: 60px;
        }

        .city-content h2,
        .city-content h3 {
          color: #2d3748;
          margin-bottom: 20px;
        }

        .city-content h2 {
          font-size: 2rem;
        }

        .city-content h3 {
          font-size: 1.5rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .feature-card {
          padding: 30px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid #667eea;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.1);
        }

        .feature-card h4 {
          color: #2d3748;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .feature-card p {
          color: #718096;
          margin: 0;
          font-size: 0.95rem;
        }

        .booking-cta {
          text-align: center;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          color: white;
        }

        .booking-cta h3 {
          color: white;
        }

        .btn-lg {
          padding: 12px 40px;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .city-hero-section h1 {
            font-size: 1.8rem;
          }

          .city-hero-section p {
            font-size: 1rem;
          }

          .city-content {
            margin-top: -20px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default CityPage;
