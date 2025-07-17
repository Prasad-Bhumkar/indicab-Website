import React from 'react';

const TravelPackages = () => {
  return (
    <div className="container my-5">
      <h1 className="text-center mb-5" style={{ fontWeight: 'bold' }}>Our Travel Packages</h1>

      {/* Hourly Rental Packages */}
      <div className="mb-5">
        <h2 className="mb-4" style={{ fontSize: '2.2rem' }}>Hourly Rental Packages</h2>
        <p className="text-muted mb-4">Flexible and convenient hourly rental packages for your city travel needs.</p>
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">4 Hours</h5>
                <h6 className="card-subtitle mb-2 text-muted">40 km limit</h6>
                <p className="card-text fs-4 fw-bold">₹1,299</p>
                <ul className="list-unstyled mt-3 mb-4">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Sedan/SUV/Premium</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Professional Chauffeur</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Water Bottles & Snacks</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Free Cancellation</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Multi-stop Flexibility</li>
                </ul>
                <button className="btn btn-primary mt-auto">Book Now</button>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">8 Hours</h5>
                <h6 className="card-subtitle mb-2 text-muted">80 km limit</h6>
                <p className="card-text fs-4 fw-bold">₹2,199</p>
                <ul className="list-unstyled mt-3 mb-4">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Sedan/SUV/Premium</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Professional Chauffeur</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Water Bottles & Snacks</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Free Cancellation</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Multi-stop Flexibility</li>
                </ul>
                <button className="btn btn-primary mt-auto">Book Now</button>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">12 Hours</h5>
                <h6 className="card-subtitle mb-2 text-muted">120 km limit</h6>
                <p className="card-text fs-4 fw-bold">₹2,999</p>
                <ul className="list-unstyled mt-3 mb-4">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Sedan/SUV/Premium</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Professional Chauffeur</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Water Bottles & Snacks</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Free Cancellation</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Multi-stop Flexibility</li>
                </ul>
                <button className="btn btn-primary mt-auto">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maharashtra Tour Packages */}
      <div className="mb-5">
        <h2 className="mb-4" style={{ fontSize: '2.2rem' }}>Maharashtra Tour Packages</h2>
        <p className="text-muted mb-4">Explore the rich heritage and stunning landscapes of Maharashtra with our curated tours.</p>
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Ashtavinayak Darshan</h5>
                <h6 className="card-subtitle mb-2 text-muted">2 Days / 1 Night</h6>
                <p className="card-text">Embark on a spiritual journey to the eight holy Ganesh temples. Price starts from ₹7,999.</p>
                <ul className="list-unstyled mt-3 mb-4">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Comfortable Sedan/SUV</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Includes Driver, Toll & Parking</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Customizable Itinerary</li>
                </ul>
                <button className="btn btn-primary mt-auto">Plan Your Darshan</button>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Mahabaleshwar & Panchgani Tour</h5>
                <h6 className="card-subtitle mb-2 text-muted">2 Days / 1 Night</h6>
                <p className="card-text">Discover the breathtaking viewpoints and strawberry farms of these twin hill stations. Price starts from ₹6,499.</p>
                <ul className="list-unstyled mt-3 mb-4">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>AC Sedan/SUV Vehicle</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Local Sightseeing Included</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Flexible Pickup & Drop</li>
                </ul>
                <button className="btn btn-primary mt-auto">Explore Hill Stations</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All India Tour Packages */}
      <div className="mb-5">
        <h2 className="mb-4" style={{ fontSize: '2.2rem' }}>All India Tour Packages</h2>
        <p className="text-muted mb-4">Discover the beauty and diversity of India with our expertly crafted tour packages.</p>
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Golden Triangle Tour</h5>
                <h6 className="card-subtitle mb-2 text-muted">5 Days / 4 Nights</h6>
                <p className="card-text">Explore the iconic cities of Delhi, Agra, and Jaipur. Price starts from ₹14,999.</p>
                <ul className="list-unstyled mt-3 mb-4">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>AC Vehicle with Professional Driver</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Accommodation Assistance</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Sightseeing and Monument Visits</li>
                </ul>
                <button className="btn btn-primary mt-auto">Discover the Triangle</button>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Royal Rajasthan Tour</h5>
                <h6 className="card-subtitle mb-2 text-muted">7 Days / 6 Nights</h6>
                <p className="card-text">Experience the majestic forts, palaces, and deserts of Rajasthan. Price starts from ₹19,999.</p>
                <ul className="list-unstyled mt-3 mb-4">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Explore Jodhpur, Udaipur & Jaisalmer</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Camel Safari in the Desert</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Cultural Evening with Folk Music</li>
                </ul>
                <button className="btn btn-primary mt-auto">Experience Royalty</button>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Kerala Backwaters Escape</h5>
                <h6 className="card-subtitle mb-2 text-muted">6 Days / 5 Nights</h6>
                <p className="card-text">Relax and unwind in the serene backwaters of Kerala. Price starts from ₹17,999.</p>
                <ul className="list-unstyled mt-3 mb-4">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Houseboat Stay in Alleppey</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Visit Munnar's Tea Gardens</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Explore the Beaches of Kovalam</li>
                </ul>
                <button className="btn btn-primary mt-auto">Unwind in Kerala</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Solutions */}
      <div>
        <h2 className="mb-4" style={{ fontSize: '2.2rem' }}>Corporate Solutions</h2>
        <p className="text-muted mb-4">Reliable and professional transportation solutions for your business needs.</p>
        <div className="card shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="card-body">
            <h5 className="card-title">Business Travel</h5>
            <p className="card-text">We offer a range of corporate services to ensure your team travels in comfort and style, with dedicated account management and flexible billing options.</p>
            <ul className="list-unstyled mt-3">
              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Dedicated Account Managers</li>
              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Scalable Fleet for Any Group Size</li>
              <li><i className="bi bi-check-circle-fill text-success me-2"></i>Centralized Corporate Billing</li>
            </ul>
            <button className="btn btn-primary mt-3">Inquire Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPackages;

