import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCity, FaCar, FaShieldAlt, FaHandshake, FaHeart, FaMapMarkedAlt, FaAward, FaUsersCog, FaLinkedin, FaTwitter, FaChevronDown, FaStar, FaQuoteLeft, FaCheckCircle, FaBullseye, FaLightbulb, FaRoad, FaRocket, FaPhoneAlt, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import { motion, useInView, useAnimation } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSEO } from '../hooks/useSEO';
import { API_BASE_URL } from '../config/apiConfig';
import axios from 'axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const AnimatedCounter = ({ target, suffix, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const CountUpStat = ({ icon, value, suffix, label, delay }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      className="about-stat-card"
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
      }}
    >
      <div className="about-stat-icon">{icon}</div>
      <div className="about-stat-value">
        <AnimatedCounter target={value} suffix={suffix} />
      </div>
      <div className="about-stat-label">{label}</div>
    </motion.div>
  );
};

const AboutUs = () => {
  useSEO({
    title: 'About IndiCab - India\'s Trusted Ride Booking Platform Since 2015',
    description: 'Discover the IndiCab story. 1M+ rides, 25+ cities, 10K+ drivers. We are on a mission to make intercity travel safe, affordable, and reliable for every Indian.',
    keywords: 'about indicab, ride booking service, trusted drivers, India, taxi service, mission, vision, team, values',
    image: 'https://img.icons8.com/color/96/taxi.png',
    type: 'website',
  });

  const navigate = useNavigate();
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.get(`${API_BASE_URL}/api/v1/admin/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setLiveStats(res.data)).catch(() => {});
    }
  }, []);

  const stats = liveStats ? [
    { icon: <FaCheckCircle />, value: liveStats.totalBookings || 1000000, suffix: '+', label: 'Rides Completed' },
    { icon: <FaCity />, value: 25, suffix: '+', label: 'Cities Served' },
    { icon: <FaUsers />, value: liveStats.totalUsers || 10000, suffix: '+', label: 'Happy Customers' },
    { icon: <FaCar />, value: liveStats.totalDrivers || 10000, suffix: '+', label: 'Trusted Drivers' },
  ] : [
    { icon: <FaCheckCircle />, value: 1000000, suffix: '+', label: 'Rides Completed' },
    { icon: <FaCity />, value: 25, suffix: '+', label: 'Cities Served' },
    { icon: <FaUsers />, value: 10000, suffix: '+', label: 'Happy Customers' },
    { icon: <FaCar />, value: 10000, suffix: '+', label: 'Trusted Drivers' },
  ];

  const values = [
    { icon: <FaShieldAlt />, title: 'Safety First', description: 'Every ride is verified — all vehicles inspected, all drivers background-checked, every trip trackable in real-time.', color: '#059669' },
    { icon: <FaHandshake />, title: 'Uncompromising Reliability', description: 'We arrive on time, every time. Our 99.7% on-time rate means you can book with complete confidence.', color: '#d97706' },
    { icon: <FaHeart />, title: 'Customer Obsession', description: 'From booking to arrival, we craft a seamless experience. Your comfort and satisfaction drive every decision we make.', color: '#dc2626' },
    { icon: <FaMapMarkedAlt />, title: 'Pan-India Expertise', description: 'Our drivers are local navigators who know every route, shortcut, and bypass from Ladakh to Kanyakumari.', color: '#2563eb' },
    { icon: <FaAward />, title: 'Quality Excellence', description: 'We set the standard for intercity travel — premium fleet, professional drivers, and a 4.8★ average rating across all rides.', color: '#7c3aed' },
    { icon: <FaUsersCog />, title: 'Community Impact', description: 'We have created 10K+ local jobs, connected small towns to cities, and contributed to India\'s mobility revolution.', color: '#0891b2' },
  ];

  const timeline = [
    { year: '2015', event: 'Founded with a vision to revolutionize intercity travel across India', icon: <FaRocket />, detail: 'Started in Pune with 5 drivers and a simple goal: make intercity cab travel reliable and affordable.' },
    { year: '2017', event: 'Expanded to 10 cities, crossed 100K rides', icon: <FaRoad />, detail: 'Launched operations in Mumbai, Delhi, Bengaluru, and Hyderabad. Built a trusted driver network of 500+.' },
    { year: '2019', event: 'Launched mobile app & introduced premium fleet', icon: <FaStar />, detail: 'Cross-platform app with real-time tracking, digital payments, and SOS features. Added luxury and SUV categories.' },
    { year: '2021', event: '1 million rides milestone with 99.7% satisfaction', icon: <FaAward />, detail: 'Despite the pandemic, our contactless travel options and sanitized fleet kept India moving safely.' },
    { year: '2024', event: '25+ cities, 10K+ drivers, $10M+ in driver earnings', icon: <FaUsersCog />, detail: 'Expanded to tier-2 and tier-3 cities. Driver partners earned over $10M collectively through the platform.' },
    { year: '2026', event: 'Pioneering sustainable travel & AI-powered routing', icon: <FaRocket />, detail: 'Introducing electric fleet in metro cities and AI-powered route optimization to reduce travel time by 20%.' },
  ];

  const leadership = [
    { name: 'Ravi Bade', title: 'Founder & CEO', image: 'https://media.licdn.com/dms/image/v2/D5603AQHmMRpgc-OYcg/profile-displayphoto-shrink_200_200/B56ZPze4ZtH0AY-/0/1734956780304?e=1756944000&v=beta&t=0Al0kIUfUNQgMwcfqINEcDY9DJpWjn6FCsRipIF98w8', social: { linkedin: 'https://linkedin.com', twitter: 'https://twitter.com' }, bio: '10+ years in mobility tech. Formerly at Uber and Ola. IIT Bombay alumnus.' },
    { name: 'Prasad Bhumkar', title: 'Head of Technology', image: 'https://avatars.githubusercontent.com/u/182353409?v=4', social: { linkedin: 'https://linkedin.com', twitter: 'https://twitter.com' }, bio: 'Architect of our AI-powered routing platform. Full-stack engineer with a passion for scalable systems.' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', location: 'Mumbai', text: 'IndiCab has transformed how I travel between cities. The drivers are professional, the cars are spotless, and the app is so easy to use. Highly recommend!', rating: 5 },
    { name: 'Rajesh Kumar', location: 'Delhi', text: 'I have been using IndiCab for my weekly Delhi-Jaipur trips for two years now. Never once have they been late. Truly reliable service.', rating: 5 },
    { name: 'Ananya Gupta', location: 'Bengaluru', text: 'As a woman traveling solo, safety is my biggest concern. IndiCab\'s SOS feature and driver verification give me complete peace of mind.', rating: 5 },
  ];

  const serviceCities = [
    { name: 'Delhi', position: [28.6139, 77.2090], region: 'North' },
    { name: 'Mumbai', position: [19.0760, 72.8777], region: 'West' },
    { name: 'Bengaluru', position: [12.9716, 77.5946], region: 'South' },
    { name: 'Chennai', position: [13.0827, 80.2707], region: 'South' },
    { name: 'Kolkata', position: [22.5726, 88.3639], region: 'East' },
    { name: 'Hyderabad', position: [17.3850, 78.4867], region: 'South' },
    { name: 'Pune', position: [18.5204, 73.8567], region: 'West' },
    { name: 'Ahmedabad', position: [23.0225, 72.5714], region: 'West' },
    { name: 'Jaipur', position: [26.9124, 75.7873], region: 'North' },
    { name: 'Lucknow', position: [26.8467, 80.9462], region: 'North' },
  ];

  return (
    <div className="about-us-page">
      {/* ========== HERO SECTION ========== */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <div className="about-hero-particle p1"></div>
          <div className="about-hero-particle p2"></div>
          <div className="about-hero-particle p3"></div>
          <div className="about-hero-particle p4"></div>
        </div>
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-7">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="about-hero-badge">Since 2015</span>
                <h1 className="about-hero-title">
                  We Are <span className="text-accent">IndiCab</span>
                </h1>
                <p className="about-hero-subtitle">
                  India's most trusted intercity cab service. Over <strong>1 million rides</strong> completed across <strong>25+ cities</strong> with a growing family of <strong>10,000+ driver partners</strong>.
                </p>
                <p className="about-hero-text">
                  Founded in 2015, our mission is simple: make intercity travel safe, affordable, and hassle-free for every Indian. We combine technology with a human touch to deliver the best ride experience in the country.
                </p>
                <div className="about-hero-actions">
                  <button onClick={() => navigate('/')} className="btn-about-primary">
                    <FaArrowRight className="me-2" /> Book a Ride
                  </button>
                  <button onClick={() => navigate('/contact')} className="btn-about-secondary">
                    Contact Us
                  </button>
                </div>
              </motion.div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <motion.div
                className="about-hero-image-wrapper"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="about-hero-image-glow"></div>
                <img
                  src="https://images.unsplash.com/photo-1587614382346-4ec580c381a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="IndiCab fleet" className="about-hero-image"
                />
                <div className="about-hero-floating-card fc-1">
                  <FaStar className="text-warning" /> 4.8★ Avg Rating
                </div>
                <div className="about-hero-floating-card fc-2">
                  <FaCheckCircle className="text-success" /> 99.7% On-Time
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS COUNTERS ========== */}
      <section className="about-stats-section">
        <div className="container">
          <div className="row justify-content-center">
            {stats.map((stat, i) => (
              <div key={i} className="col-lg-3 col-md-6 mb-4">
                <CountUpStat
                  icon={stat.icon}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  delay={i * 0.15}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== MISSION & VISION ========== */}
      <section className="about-mv-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <motion.div
                className="about-mv-card mission"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mv-icon"><FaBullseye /></div>
                <h3>Our Mission</h3>
                <p>To provide every Indian with safe, affordable, and dependable intercity travel by combining cutting-edge technology with a driver network that puts people first.</p>
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div
                className="about-mv-card vision"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mv-icon"><FaLightbulb /></div>
                <h3>Our Vision</h3>
                <p>To become India's most loved mobility platform — connecting every city, town, and village with reliable, sustainable, and accessible travel for all.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== VALUES ========== */}
      <section className="about-values-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="about-section-badge">What We Stand For</span>
            <h2 className="about-section-title">Our Core Values</h2>
            <p className="about-section-desc">Six principles that guide every ride, every decision, every day.</p>
          </motion.div>
          <div className="row g-4">
            {values.map((val, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <motion.div
                  className="about-value-card"
                  style={{ '--card-accent': val.color }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="value-icon-wrap" style={{ background: `${val.color}15`, color: val.color }}>
                    {val.icon}
                  </div>
                  <h4>{val.title}</h4>
                  <p>{val.description}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== OUR JOURNEY ========== */}
      <section className="about-journey-animated">
        <div className="journey-background">
          <div className="journey-sky"></div>
          <div className="journey-road">
            <div className="road-lane road-lane-1"></div>
            <div className="road-lane road-lane-2"></div>
            <div className="road-markings">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="road-mark"></div>
              ))}
            </div>
          </div>

          <div className="journey-cab">
            <div className="cab-body">🚕</div>
          </div>

          <div className="container timeline-journey-container">
            <div className="row">
              <div className="col-12 text-center">
                <h2 className="section-title journey-title">Our Journey</h2>
                <p className="journey-subtitle">From a small startup to India's trusted mobility partner — a decade of milestones.</p>
              </div>
            </div>
            <div className="timeline-journey">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className="journey-milestone"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                >
                  <div className="milestone-marker">
                    <div className="milestone-dot">{item.icon}</div>
                    <div className="milestone-pulse"></div>
                  </div>
                  <div className="milestone-content">
                    <div className="milestone-year">{item.year}</div>
                    <p className="milestone-event">{item.event}</p>
                    <p className="milestone-detail">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="about-testimonials-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="about-section-badge">Rider Love</span>
            <h2 className="about-section-title">What Our Customers Say</h2>
            <p className="about-section-desc">Real feedback from real riders across India.</p>
          </motion.div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="col-lg-4 col-md-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="about-testimonial-card">
                  <FaQuoteLeft className="testimonial-quote" />
                  <div className="testimonial-stars">
                    {[...Array(t.rating)].map((_, s) => <FaStar key={s} />)}
                  </div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.name[0]}</div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-location">{t.location}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== LEADERSHIP ========== */}
      <section className="about-leadership-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="about-section-badge">The Team</span>
            <h2 className="about-section-title">Our Leadership</h2>
            <p className="about-section-desc">Meet the people steering IndiCab toward a smarter mobility future.</p>
          </motion.div>
          <div className="row justify-content-center g-4">
            {leadership.map((leader, index) => (
              <motion.div
                key={index}
                className="col-lg-4 col-md-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="about-leader-card">
                  <div className="leader-image-wrap">
                    <img src={leader.image} alt={leader.name} />
                    <div className="leader-social">
                      <a href={leader.social.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                      <a href={leader.social.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                    </div>
                  </div>
                  <div className="leader-info">
                    <h4>{leader.name}</h4>
                    <span className="leader-title">{leader.title}</span>
                    <p className="leader-bio">{leader.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COVERAGE MAP ========== */}
      <section className="about-map-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="about-section-badge">Our Reach</span>
            <h2 className="about-section-title">Pan-India Coverage</h2>
            <p className="about-section-desc">From metro cities to emerging towns — we are everywhere you need to go.</p>
          </motion.div>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="about-map-wrapper">
                <MapContainer center={[22.5, 80.0]} zoom={5} style={{ height: '450px', width: '100%', borderRadius: '16px' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {serviceCities.map((city, index) => (
                    <Marker key={index} position={city.position}>
                      <Popup>
                        <strong>{city.name}</strong><br />
                        <span className="text-muted">{city.region} India</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="about-city-list">
                <h4>Cities We Serve</h4>
                <div className="city-list-grid">
                  {serviceCities.map((city, i) => (
                    <div key={i} className="city-list-item">
                      <span className="city-dot" style={{
                        background: city.region === 'North' ? '#059669' :
                                     city.region === 'South' ? '#2563eb' :
                                     city.region === 'West' ? '#d97706' : '#7c3aed'
                      }}></span>
                      <span>{city.name}</span>
                      <small className="text-muted">{city.region}</small>
                    </div>
                  ))}
                </div>
                <p className="city-list-more mt-3">+15 more cities launching soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="about-cta-section">
        <div className="container">
          <motion.div
            className="about-cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2>Ready to Ride with India's Most Trusted Cab Service?</h2>
                <p>Join 1M+ happy riders. Book your next intercity trip in under 30 seconds.</p>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <button onClick={() => navigate('/')} className="btn-about-cta">
                  Book Your Ride <FaArrowRight className="ms-2" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
