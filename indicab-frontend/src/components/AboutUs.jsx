import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCity, FaCar, FaShieldAlt, FaHandshake, FaHeart, FaMapMarkedAlt, FaAward, FaUsersCog, FaLinkedin, FaTwitter, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const AboutUs = () => {
  const navigate = useNavigate();
  const [expandedTimeline, setExpandedTimeline] = useState(null);

  const stats = [
    { icon: <FaUsers />, value: '1M+', label: 'Rides Completed' },
    { icon: <FaCity />, value: '25+', label: 'Cities Served' },
    { icon: <FaCar />, value: '10K+', label: 'Drivers' },
  ];

  const values = [
    { icon: <FaShieldAlt />, title: 'Safety', description: 'Your well-being is our top priority. We ensure all our vehicles are regularly inspected and our drivers are trained to the highest standards.' },
    { icon: <FaHandshake />, title: 'Reliability', description: 'Count on us for punctual and dependable service. We get you to your destination on time, every time.' },
    { icon: <FaHeart />, title: 'Customer Satisfaction', description: 'We are committed to providing a seamless and enjoyable experience, from booking to arrival.' },
    { icon: <FaMapMarkedAlt />, title: 'Local Expertise', description: 'Our drivers are local experts who know the best routes to navigate India\'s diverse landscapes.' },
    { icon: <FaAward />, title: 'Quality Service', description: 'We believe in delivering exceptional service with a personal touch, making your journey comfortable and memorable.' },
    { icon: <FaUsersCog />, title: 'Community Focus', description: 'We are proud to be a part of the communities we serve, creating local jobs and contributing to regional growth.' },
  ];

  const timeline = [
    { year: '2015', event: 'Founded with vision to revolutionize intercity travel' },
    { year: '2017', event: 'Expanded to 10 cities, 100K+ rides' },
    { year: '2019', event: 'Launched mobile app' },
    { year: '2021', event: '1M rides milestone, premium fleet' },
    { year: '2024', event: '25+ cities, 10K+ drivers' },
  ];

  const leadership = [
    { name: 'Ravi Bade', title: 'Founder & CEO', image: 'https://media.licdn.com/dms/image/v2/D5603AQHmMRpgc-OYcg/profile-displayphoto-shrink_200_200/B56ZPze4ZtH0AY-/0/1734956780304?e=1756944000&v=beta&t=0Al0kIUfUNQgMwcfqINEcDY9DJpWjn6FCsRipIF98w8', social: { linkedin: '#', twitter: '#' } },
    { name: 'Prasad Bhumkar', title: 'Head of Technology', image: 'https://avatars.githubusercontent.com/u/182353409?v=4', social: { linkedin: '#', twitter: '#' } },
  ];

  const serviceCities = [
    { name: 'Delhi', position: [28.6139, 77.2090] },
    { name: 'Mumbai', position: [19.0760, 72.8777] },
    { name: 'Bengaluru', position: [12.9716, 77.5946] },
    { name: 'Chennai', position: [13.0827, 80.2707] },
    { name: 'Kolkata', position: [22.5726, 88.3639] },
  ];

  return (
    <div className="about-us">
      <section className="hero-banner" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1587614382346-4ec580c381a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)' }}>
        <div className="hero-overlay"></div>
        <motion.div
          className="hero-content text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.3 }
            }
          }}
        >
          <motion.h1 variants={{ hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } }}>
            About IndiCab
          </motion.h1>
          <motion.p className="lead" variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}>
            India&apos;s Trusted Intercity Cab Service Since 2015
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}>
            <button onClick={() => navigate('/')} className="btn btn-primary-custom mt-3">Book a Ride</button>
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-stats"
          style={{ display: "flex", justifyContent: "space-around" }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.3, delayChildren: 0.9 }
            }
          }}
        >
          {stats.map((stat, index) => (
            <motion.div key={index} className="stat-item-enhanced " variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="about-us-section bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="section-title">Our Values</h2>
            </div>
          </div>
          <div className="row">
            {values.map((value, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <motion.div
                  className="card values-card h-100"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="card-body">
                    <div className="icon">{value.icon}</div>
                    <h3 className="h5 fw-bold">{value.title}</h3>
                    <p className="text-muted">{value.description}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIQUE: Our Journey Section with Highway Animation */}
      <section className="about-journey-animated">
        <div className="journey-background">
          {/* Sky */}
          <div className="journey-sky"></div>

          {/* Highway Road */}
          <div className="journey-road">
            <div className="road-lane road-lane-1"></div>
            <div className="road-lane road-lane-2"></div>
            <div className="road-markings">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="road-mark"></div>
              ))}
            </div>
          </div>

          {/* Animated Cab */}
          <div className="journey-cab">
            <div className="cab-body">🚕</div>
          </div>

          {/* Timeline Container */}
          <div className="container timeline-journey-container">
            <div className="row">
              <div className="col-12 text-center">
                <h2 className="section-title journey-title">Our Journey</h2>
              </div>
            </div>

            <div className="timeline-journey">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className="journey-milestone"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div className="milestone-marker">
                    <div className="milestone-dot"></div>
                    <div className="milestone-pulse"></div>
                  </div>
                  <div className="milestone-content">
                    <div className="milestone-year">{item.year}</div>
                    <p className="milestone-event">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-us-section bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="section-title">Our Leadership</h2>
            </div>
          </div>
          <div className="row justify-content-center">
            {leadership.map((leader, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <div className="card leadership-card-enhanced">
                  <img src={leader.image} alt={leader.name} className="card-img-top" />
                  <div className="card-body text-center">
                    <h3 className="h5 fw-bold">{leader.name}</h3>
                    <p className="text-muted">{leader.title}</p>
                    <div className="social-links">
                      <a href={leader.social.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                      <a href={leader.social.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-us-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="section-title">Our Coverage</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '400px', width: '100%', borderRadius: '12px', boxShadow: 'var(--box-shadow-lg)' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {serviceCities.map((city, index) => (
                  <Marker key={index} position={city.position}>
                    <Popup>{city.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
