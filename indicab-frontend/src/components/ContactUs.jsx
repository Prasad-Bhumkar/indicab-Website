import React, { useState } from 'react';
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ContactUs = () => {
  const position = [12.9716, 77.5946]; // Bangalore coordinates
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setIsSubmitted(true);
      // Here you would typically send the form data to a server
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      }, 3000);
    }
  };

  return (
    <div className="container my-5" style={{ backgroundColor: '#f8f9fa', padding: '2rem', borderRadius: '15px' }}>
      <h1 className="text-center mb-5" style={{ fontSize: '3rem', fontWeight: 'bold' }}>Contact Us</h1>
      <div className="row">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="p-4 h-100" style={{ backgroundColor: 'white', borderRadius: '15px' }}>
            <h2 className="mb-4" style={{ fontSize: '2.2rem' }}>Get in Touch</h2>
            <p className="mb-4">
              For bookings, inquiries, or support, please don't hesitate to reach out to us. Our team is available to assist you 24/7.
            </p>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-center">
                <i className="bi bi-telephone-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                <div>
                  <strong>24/7 Phone Support:</strong><br />
                  <a href="tel:+919876543210" className="text-decoration-none">+91 9876 543 210</a>
                </div>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="bi bi-envelope-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                <div>
                  <strong>Email:</strong><br />
                  <a href="mailto:info@indicab.com" className="text-decoration-none">info@indicab.com</a> (Response within 24 hours)
                </div>
              </li>
              <li className="d-flex align-items-center">
                <i className="bi bi-geo-alt-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                <div>
                  <strong>Head Office:</strong><br />
                  123 Transport Plaza, MG Road, Bangalore, Karnataka 560001
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="p-4" style={{ backgroundColor: 'white', borderRadius: '15px' }}>
            <h2 className="mb-4" style={{ fontSize: '2.2rem' }}>Send Us a Message</h2>
            {isSubmitted && (
              <div className="alert alert-success" role="alert">
                Thank you for your message! We will get back to you shortly.
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-label="Your Name"
                  required
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-label="Your Email"
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  aria-label="Your Phone Number"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject <span className="text-danger">*</span></label>
                <select
                  className={`form-select ${errors.subject ? 'is-invalid' : ''}`}
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  aria-label="Message Subject"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="support">Support Request</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="message" className="form-label">Message <span className="text-danger">*</span></label>
                <textarea
                  className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                  id="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  aria-label="Your Message"
                  required
                ></textarea>
                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary w-100" style={{ padding: '0.75rem', fontSize: '1.1rem' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="text-center mb-4" style={{ fontSize: '2.2rem' }}>Our Location</h3>
          <div style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '400px' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  123 Transport Plaza, MG Road, <br /> Bangalore, Karnataka 560001
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="text-center mb-4" style={{ fontSize: '2.2rem' }}>Frequently Asked Questions (FAQ)</h3>
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item" style={{ marginBottom: '1rem', border: 'none', borderRadius: '10px' }}>
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" style={{ borderRadius: '10px' }}>
                  How can I book a ride?
                </button>
              </h2>
              <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  You can book a ride through our website, our mobile app, or by calling our 24/7 support line at +91 9876 543 210.
                </div>
              </div>
            </div>
            <div className="accordion-item" style={{ marginBottom: '1rem', border: 'none', borderRadius: '10px' }}>
              <h2 className="accordion-header" id="headingThree">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" style={{ borderRadius: '10px' }}>
                  What is your cancellation policy?
                </button>
              </h2>
              <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  You can cancel your booking free of charge up to one hour before your scheduled pickup time.
                </div>
              </div>
            </div>
            <div className="accordion-item" style={{ border: 'none', borderRadius: '10px' }}>
              <h2 className="accordion-header" id="headingFour">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour" style={{ borderRadius: '10px' }}>
                  How do you ensure driver and passenger safety?
                </button>
              </h2>
              <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  All our drivers undergo thorough background checks and receive extensive training to ensure your safety and comfort.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
