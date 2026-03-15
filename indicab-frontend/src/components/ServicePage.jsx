import React from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SEOHead from './SEOHead';
import { getServiceSEOData } from '../utils/seoConfig';

const ServicePage = () => {
  const { serviceName } = useParams();
  
  // Format service name for display (from kebab-case to proper case)
  const formattedServiceName = serviceName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const serviceDescriptions = {
    'hourly-rental': 'Book hourly rentals for flexible travel within the city or across regions.',
    'airport-transfer': 'Convenient airport transfer service with on-time pickup and drop-off.',
    'corporate-travel': 'Professional corporate travel solutions for business meetings and events.',
    'outstation': 'One-way and round-trip outstation service for intercity travel.',
    'wedding': 'Specialized wedding transportation for your special day.',
    'customer-carrier': 'Customizable carrier services for your unique transportation needs.',
  };

  const seoData = getServiceSEOData(
    formattedServiceName,
    serviceDescriptions[serviceName] || `Professional ${formattedServiceName} service with IndiCab.`
  );

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
      <div className="service-page-container">
        <div className="service-hero-section">
          <h1>{formattedServiceName} - IndiCab Ride Booking</h1>
          <p>Professional {formattedServiceName} services tailored to your needs</p>
        </div>

        <div className="service-content">
          <section className="service-overview">
            <h2>{formattedServiceName} Service</h2>
            <p>
              {serviceDescriptions[serviceName] || 
                `IndiCab offers reliable ${formattedServiceName} services with experienced drivers and comfortable vehicles.`}
            </p>
          </section>

          <section className="service-benefits">
            <h3>Benefits of IndiCab {formattedServiceName}</h3>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <div className="benefit-text">
                  <h4>Experienced Drivers</h4>
                  <p>Professional drivers trained for excellent customer service</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <div className="benefit-text">
                  <h4>Well-Maintained Vehicles</h4>
                  <p>Regular maintenance and safety checks for your comfort</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <div className="benefit-text">
                  <h4>Transparent Pricing</h4>
                  <p>No hidden charges, competitive rates upfront</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <div className="benefit-text">
                  <h4>Real-Time Tracking</h4>
                  <p>Track your ride in real-time for peace of mind</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <div className="benefit-text">
                  <h4>24/7 Customer Support</h4>
                  <p>Round-the-clock assistance for any queries</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <div className="benefit-text">
                  <h4>Safe & Secure</h4>
                  <p>Background-checked drivers and secure payment options</p>
                </div>
              </div>
            </div>
          </section>

          <section className="service-pricing">
            <h3>Pricing for {formattedServiceName}</h3>
            <p>Our pricing is transparent and competitive. Contact us for detailed pricing information.</p>
            <button className="btn btn-primary">Get Price Quote</button>
          </section>

          <section className="service-faq">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-items">
              <div className="faq-item">
                <h4>How do I book a {formattedServiceName}?</h4>
                <p>Simply download our app or visit our website, select the service, provide your details, and confirm your booking.</p>
              </div>
              <div className="faq-item">
                <h4>What are the payment options?</h4>
                <p>We accept credit/debit cards, digital wallets, and cash payments.</p>
              </div>
              <div className="faq-item">
                <h4>Can I cancel my booking?</h4>
                <p>Yes, you can cancel bookings with 30 minutes notice for a full refund.</p>
              </div>
            </div>
          </section>

          <section className="service-cta">
            <h3>Ready to Book Your {formattedServiceName}?</h3>
            <button className="btn btn-primary btn-lg">Book Now</button>
          </section>
        </div>
      </div>

      <style>{`
        .service-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .service-hero-section {
          padding: 60px 20px;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .service-hero-section h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .service-hero-section p {
          font-size: 1.2rem;
          margin: 0;
          opacity: 0.9;
        }

        .service-content {
          max-width: 1000px;
          margin: -40px auto 0;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .service-content section {
          margin-bottom: 50px;
        }

        .service-content h2,
        .service-content h3 {
          color: #2d3748;
          margin-bottom: 20px;
        }

        .service-content h2 {
          font-size: 2rem;
        }

        .service-content h3 {
          font-size: 1.5rem;
        }

        .benefits-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }

        .benefit-item {
          display: flex;
          gap: 20px;
        }

        .benefit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          font-size: 1.5rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .benefit-text h4 {
          color: #2d3748;
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .benefit-text p {
          color: #718096;
          margin: 0;
          font-size: 0.95rem;
        }

        .service-pricing {
          background: #f7fafc;
          padding: 30px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .service-pricing button {
          margin-top: 15px;
        }

        .faq-items {
          display: grid;
          gap: 20px;
          margin-top: 30px;
        }

        .faq-item {
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .faq-item h4 {
          color: #2d3748;
          margin: 0 0 10px 0;
        }

        .faq-item p {
          color: #718096;
          margin: 0;
        }

        .service-cta {
          text-align: center;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          color: white;
        }

        .service-cta h3 {
          color: white;
        }

        .btn-lg {
          padding: 12px 40px;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .service-hero-section h1 {
            font-size: 1.8rem;
          }

          .service-hero-section p {
            font-size: 1rem;
          }

          .service-content {
            margin-top: -20px;
            padding: 20px;
          }

          .benefits-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default ServicePage;
