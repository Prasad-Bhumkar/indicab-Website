import React, { useState, useEffect } from 'react';

const TravelPackages = () => {
  const [isVisible, setIsVisible] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const packageCategories = [
    { id: 'all', name: 'All Packages', icon: 'bi-collection' },
    { id: 'hourly', name: 'Hourly Rentals', icon: 'bi-clock' },
    { id: 'regional', name: 'Regional Tours', icon: 'bi-geo-alt' },
    { id: 'national', name: 'National Tours', icon: 'bi-map' },
    { id: 'corporate', name: 'Corporate', icon: 'bi-building' }
  ];

  const hourlyPackages = [
    {
      id: 'hour-4',
      title: '4 Hours',
      subtitle: '40 km included',
      price: '₹1,299',
      originalPrice: '₹1,499',
      features: ['AC Sedan/SUV/Premium', 'Professional Chauffeur', 'Complimentary Water & Snacks', 'Free Cancellation up to 2 hrs', 'Multi-stop Flexibility', 'GPS Tracking'],
      popular: false,
      badge: 'Quick Trips'
    },
    {
      id: 'hour-8',
      title: '8 Hours',
      subtitle: '80 km included',
      price: '₹2,199',
      originalPrice: '₹2,599',
      features: ['AC Sedan/SUV/Premium', 'Professional Chauffeur', 'Complimentary Water & Snacks', 'Free Cancellation up to 4 hrs', 'Multi-stop Flexibility', 'GPS Tracking & Live Updates'],
      popular: true,
      badge: 'Most Popular'
    },
    {
      id: 'hour-12',
      title: '12 Hours',
      subtitle: '120 km included',
      price: '₹2,999',
      originalPrice: '₹3,499',
      features: ['AC Sedan/SUV/Premium', 'Professional Chauffeur', 'Complimentary Meals & Refreshments', 'Free Cancellation up to 6 hrs', 'Multi-stop Flexibility', 'Dedicated Customer Support'],
      popular: false,
      badge: 'Extended Tours'
    }
  ];

  const regionalPackages = [
    {
      id: 'ashtavinayak',
      title: 'Sacred Ashtavinayak Darshan',
      subtitle: '2 Days / 1 Night',
      price: '₹7,999',
      originalPrice: '₹9,499',
      description: 'Embark on a divine spiritual journey visiting all eight sacred Ganesh temples across Maharashtra with experienced guides.',
      features: ['Comfortable AC Sedan/SUV', 'Experienced Religious Guide', 'All Tolls, Parking & Driver Charges', 'Customizable Temple Route', 'Photography Assistance', 'Temple History & Significance'],
      image: '🙏',
      duration: '2D/1N'
    },
    {
      id: 'hill-stations',
      title: 'Mahabaleshwar & Panchgani Escape',
      subtitle: '2 Days / 1 Night',
      price: '₹6,499',
      originalPrice: '₹7,999',
      description: 'Discover misty mountains, strawberry farms, and breathtaking viewpoints in Maharashtra\'s crown jewel hill stations.',
      features: ['Premium AC Transportation', 'Local Sightseeing Guide', 'Strawberry Farm Visit', 'Scenic Viewpoint Tours', 'Photography Sessions', 'Flexible Pickup & Drop'],
      image: '🏔️',
      duration: '2D/1N'
    },
    {
      id: 'ajanta-ellora',
      title: 'Ajanta & Ellora Caves Heritage',
      subtitle: '3 Days / 2 Nights',
      price: '₹9,999',
      originalPrice: '₹12,499',
      description: 'Explore UNESCO World Heritage Sites with ancient rock-cut caves showcasing incredible art and architecture.',
      features: ['Heritage-Certified Guide', 'Museum & Archaeological Tours', 'Traditional Maharashtrian Cuisine', 'Historical Documentation', 'Professional Photography', 'Cultural Insights'],
      image: '🏛️',
      duration: '3D/2N'
    }
  ];

  const nationalPackages = [
    {
      id: 'golden-triangle',
      title: 'Golden Triangle Classic',
      subtitle: '5 Days / 4 Nights',
      price: '₹14,999',
      originalPrice: '₹18,999',
      description: 'Experience India\'s most iconic destinations: Delhi\'s heritage, Agra\'s romance, and Jaipur\'s royalty in one magical journey.',
      features: ['Luxury AC Transportation', 'Professional Tour Guide', 'Taj Mahal Sunrise Experience', 'Red Fort & India Gate', 'Amber Fort & City Palace', 'Cultural Evening Shows'],
      image: '🕌',
      duration: '5D/4N',
      popular: true
    },
    {
      id: 'royal-rajasthan',
      title: 'Royal Rajasthan Splendor',
      subtitle: '7 Days / 6 Nights',
      price: '₹19,999',
      originalPrice: '₹24,999',
      description: 'Journey through the land of maharajas, experiencing majestic forts, vibrant culture, and the mystical Thar Desert.',
      features: ['Desert Safari Experience', 'Palace Hotel Visits', 'Camel Ride & Cultural Shows', 'Local Handicraft Shopping', 'Traditional Rajasthani Cuisine', 'Folk Music & Dance'],
      image: '🏰',
      duration: '7D/6N'
    },
    {
      id: 'kerala-backwaters',
      title: 'Kerala Backwaters Paradise',
      subtitle: '6 Days / 5 Nights',
      price: '₹17,999',
      originalPrice: '₹21,999',
      description: 'Immerse yourself in the tranquil backwaters, lush tea gardens, and pristine beaches of God\'s Own Country.',
      features: ['Traditional Houseboat Stay', 'Munnar Tea Garden Tours', 'Alleppey Backwater Cruise', 'Kovalam Beach Experience', 'Ayurvedic Spa Sessions', 'Spice Plantation Visits'],
      image: '🌴',
      duration: '6D/5N'
    },
    {
      id: 'goa-experience',
      title: 'Goa Beach & Heritage',
      subtitle: '4 Days / 3 Nights',
      price: '₹12,999',
      originalPrice: '₹15,999',
      description: 'Perfect blend of sun-kissed beaches, Portuguese heritage, vibrant nightlife, and authentic Goan cuisine.',
      features: ['Beach Resort Experience', 'Heritage Walking Tours', 'Water Sports Activities', 'Sunset Cruise', 'Local Market Exploration', 'Authentic Goan Cuisine'],
      image: '🏖️',
      duration: '4D/3N'
    }
  ];

  const corporatePackages = [
    {
      id: 'corporate-travel',
      title: 'Executive Business Travel',
      subtitle: 'Customized Solutions',
      price: 'Custom Quote',
      description: 'Comprehensive corporate transportation solutions designed to meet your business travel requirements with professionalism and reliability.',
      features: ['Dedicated Account Manager', 'Priority Booking System', 'Flexible Fleet Options', 'Centralized Billing & Reporting', 'Employee Travel Management', '24/7 Customer Support'],
      benefits: ['Cost Optimization', 'Time Efficiency', 'Professional Service', 'Scalable Solutions']
    }
  ];

  const filterPackages = (category) => {
    setActiveFilter(category);
  };

  const getFilteredPackages = () => {
    switch (activeFilter) {
      case 'hourly': return hourlyPackages;
      case 'regional': return regionalPackages;
      case 'national': return nationalPackages;
      case 'corporate': return corporatePackages;
      default: return [...hourlyPackages, ...regionalPackages, ...nationalPackages];
    }
  };

  return (
    <div className="packages-container">
      {/* Hero Banner */}
      <div className="packages-hero">
        <div className="packages-hero-background">
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
        </div>
        <div className="container">
          <div className="row align-items-center min-vh-50 justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="packages-hero-title animate-on-scroll" id="hero-title">
                Discover Amazing
                <span className="text-gradient"> Travel Experiences</span>
              </h1>
              <p className="packages-hero-subtitle animate-on-scroll" id="hero-subtitle">
                From quick city rides to epic cross-country adventures, we've crafted the perfect travel packages for every journey you dream of taking.
              </p>
              <div className="packages-stats animate-on-scroll justify-content-center" id="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Happy Travelers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Destinations</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        {/* Filter Tabs */}
        <div className="packages-filter animate-on-scroll" id="filter-section">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="filter-tabs">
                {packageCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`filter-tab ${activeFilter === category.id ? 'active' : ''}`}
                    onClick={() => filterPackages(category.id)}
                  >
                    <i className={`bi ${category.icon} me-2`}></i>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Packages */}
        {(activeFilter === 'all' || activeFilter === 'hourly') && (
          <div className="packages-section animate-on-scroll" id="hourly-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="bi bi-clock me-3"></i>
                Hourly Rental Packages
              </h2>
              <p className="section-subtitle">
                Perfect for city exploration, business meetings, and short-distance travel with complete flexibility.
              </p>
            </div>
            <div className="row">
              {hourlyPackages.map((pkg, index) => (
                <div key={pkg.id} className="col-lg-4 col-md-6 mb-4">
                  <div className={`package-card hourly-card ${pkg.popular ? 'popular' : ''}`}
                       style={{ animationDelay: `${index * 0.2}s` }}>
                    {/* {pkg.popular && <div className="popular-badge">Most Popular</div>} */}
                    <div className="package-badge">{pkg.badge}</div>
                    <div className="package-header">
                      <h5 className="package-title">{pkg.title}</h5>
                      <h6 className="package-subtitle">{pkg.subtitle}</h6>
                      <div className="package-pricing">
                        <span className="current-price">{pkg.price}</span>
                        <span className="original-price">{pkg.originalPrice}</span>
                        <span className="discount">Save {Math.round(((parseInt(pkg.originalPrice.replace('₹', '').replace(',', '')) - parseInt(pkg.price.replace('₹', '').replace(',', ''))) / parseInt(pkg.originalPrice.replace('₹', '').replace(',', ''))) * 100)}%</span>
                      </div>
                    </div>
                    <div className="package-features">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="feature-item">
                          <i className="bi bi-check-circle-fill"></i>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button className="package-btn">
                      <span>Book Now</span>
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regional Packages */}
        {(activeFilter === 'all' || activeFilter === 'regional') && (
          <div className="packages-section animate-on-scroll" id="regional-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="bi bi-geo-alt me-3"></i>
                Maharashtra Heritage Tours
              </h2>
              <p className="section-subtitle">
                Explore the rich cultural heritage, spiritual destinations, and natural beauty of Maharashtra.
              </p>
            </div>
            <div className="row">
              {regionalPackages.map((pkg, index) => (
                <div key={pkg.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="package-card regional-card" style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className="package-image">
                      <div className="image-placeholder">{pkg.image}</div>
                      <div className="duration-badge">{pkg.duration}</div>
                    </div>
                    <div className="package-content">
                      <h5 className="package-title">{pkg.title}</h5>
                      <p className="package-description">{pkg.description}</p>
                      <div className="package-pricing">
                        <span className="current-price">{pkg.price}</span>
                        <span className="original-price">{pkg.originalPrice}</span>
                      </div>
                      <div className="package-features">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="feature-item">
                            <i className="bi bi-check-circle-fill"></i>
                            <span>{feature}</span>
                          </div>
                        ))}
                        <div className="feature-more">+{pkg.features.length - 3} more features</div>
                      </div>
                      <button className="package-btn">
                        <span>Explore Package</span>
                        <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* National Packages */}
        {(activeFilter === 'all' || activeFilter === 'national') && (
          <div className="packages-section animate-on-scroll" id="national-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="bi bi-map me-3"></i>
                All India Tour Packages
              </h2>
              <p className="section-subtitle">
                Discover the incredible diversity of India with our carefully curated national tour packages.
              </p>
            </div>
            <div className="row">
              {nationalPackages.map((pkg, index) => (
                <div key={pkg.id} className="col-lg-6 col-xl-3 mb-4">
                  <div className={`package-card national-card ${pkg.popular ? 'featured' : ''}`}
                       style={{ animationDelay: `${index * 0.1}s` }}>
                    {pkg.popular && <div className="featured-badge">Traveler's Choice</div>}
                    <div className="package-image">
                      <div className="image-placeholder">{pkg.image}</div>
                      <div className="duration-badge">{pkg.duration}</div>
                    </div>
                    <div className="package-content">
                      <h5 className="package-title">{pkg.title}</h5>
                      <p className="package-description">{pkg.description}</p>
                      <div className="package-pricing">
                        <span className="current-price">{pkg.price}</span>
                        <span className="original-price">{pkg.originalPrice}</span>
                      </div>
                      <div className="package-features">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="feature-item">
                            <i className="bi bi-star-fill"></i>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <button className="package-btn">
                        <span>Book Adventure</span>
                        <i className="bi bi-airplane"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Corporate Solutions */}
        {(activeFilter === 'all' || activeFilter === 'corporate') && (
          <div className="packages-section animate-on-scroll" id="corporate-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="bi bi-building me-3"></i>
                Corporate Travel Solutions
              </h2>
              <p className="section-subtitle">
                Professional transportation solutions tailored for modern businesses and their unique requirements.
              </p>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="corporate-card">
                  <div className="row align-items-center">
                    <div className="col-lg-6">
                      <div className="corporate-content">
                        <h3 className="corporate-title">Executive Business Travel</h3>
                        <p className="corporate-description">
                          Streamline your corporate travel with our comprehensive business solutions designed to enhance productivity and ensure seamless transportation for your team.
                        </p>
                        <div className="corporate-features">
                          {corporatePackages[0].features.map((feature, idx) => (
                            <div key={idx} className="corporate-feature">
                              <i className="bi bi-shield-check"></i>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <button className="corporate-btn">
                          <span>Get Custom Quote</span>
                          <i className="bi bi-briefcase"></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="corporate-benefits">
                        <h4>Why Choose Our Corporate Services?</h4>
                        {corporatePackages[0].benefits.map((benefit, idx) => (
                          <div key={idx} className="benefit-item">
                            <div className="benefit-icon">
                              <i className="bi bi-graph-up-arrow"></i>
                            </div>
                            <div className="benefit-text">{benefit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="packages-cta animate-on-scroll" id="cta-section">
          <div className="cta-background"></div>
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h3 className="cta-title">Ready to Start Your Journey?</h3>
              <p className="cta-description">
                Join thousands of satisfied travelers who have chosen IndiCab for their memorable journeys across India.
              </p>
              <div className="cta-buttons">
                <button className="cta-btn primary">
                  <i className="bi bi-telephone me-2"></i>
                  Call Now: +91 98765 43210
                </button>
                <button className="cta-btn secondary">
                  <i className="bi bi-whatsapp me-2"></i>
                  WhatsApp Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPackages;
