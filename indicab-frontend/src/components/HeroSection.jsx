import React, { useState } from 'react'
import BookingForm from './BookingForm'

const HeroSection = () => {
  return (
    <section className="hero-section" id="home">
      {/* Animated Background Elements */}
      <div className="hero-background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
        <div className="floating-shape shape-6"></div>
        <div className="animated-dots">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
          <div className="dot dot-4"></div>
          <div className="dot dot-5"></div>
        </div>
        <div className="animated-lines">
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
        </div>
      </div>

      <div className="container">
        <div className="row min-vh-100 align-items-center">
          <div className="col-lg-6">
            <div className="text-white">
              <h1 className="display-4 fw-bold mb-4" role="heading" aria-level="1">
                SERVICE OF TRUSTED<br />
                <span style={{ color: '#F59E0B' }}>INDIAN DRIVERS</span>
              </h1>
              <p className="lead mb-4">
                Book reliable and comfortable rides across India with our trusted network of professional drivers.
              </p>
              <div className="d-flex gap-3 mb-4">
                <button className="btn btn-outline-custom" aria-label="Call Now">
                  <i className="bi bi-telephone me-2"></i>
                  Call Now
                </button>
                <button className="btn btn-outline-custom" aria-label="WhatsApp">
                  <i className="bi bi-whatsapp me-2"></i>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
