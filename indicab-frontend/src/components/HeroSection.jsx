import React, { useState } from 'react'
import BookingForm from './BookingForm'

const HeroSection = () => {
  return (
    <section className="hero-section" id="home">
      <div className="container">
        <div className="row min-vh-100 align-items-center">
          <div className="col-lg-6">
            <div className="text-white">
              <h1 className="display-4 fw-bold mb-4">
                SERVICE OF TRUSTED<br />
                <span style={{ color: '#F59E0B' }}>INDIAN DRIVERS</span>
              </h1>
              <p className="lead mb-4">
                Book reliable and comfortable rides across India with our trusted network of professional drivers.
              </p>
              <div className="d-flex gap-3 mb-4">
                <button className="btn btn-outline-custom">
                  <i className="bi bi-telephone me-2"></i>
                  Call Now
                </button>
                <button className="btn btn-outline-custom">
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
