import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { incrementDownloadCount } from '../features/appSection/appSectionSlice'

const AppSection = () => {
  const dispatch = useDispatch()
  const { downloadCount } = useSelector((state) => state.appSection)

  const handleDownloadClick = () => {
    dispatch(incrementDownloadCount())
  }

  return (
    <section className="app-section" id="app-section">
      {/* Moving Background Animations */}
      <div className="app-background-animation">
        {/* Floating Shapes */}
        <div className="app-floating-shape app-shape-1"></div>
        <div className="app-floating-shape app-shape-2"></div>
        <div className="app-floating-shape app-shape-3"></div>
        <div className="app-floating-shape app-shape-4"></div>
        <div className="app-floating-shape app-shape-5"></div>

        {/* Moving Particles */}
        <div className="app-particles">
          <div className="app-particle app-particle-1"></div>
          <div className="app-particle app-particle-2"></div>
          <div className="app-particle app-particle-3"></div>
          <div className="app-particle app-particle-4"></div>
          <div className="app-particle app-particle-5"></div>
          <div className="app-particle app-particle-6"></div>
        </div>

        {/* Flowing Lines */}
        <div className="app-flowing-lines">
          <div className="app-line app-line-1"></div>
          <div className="app-line app-line-2"></div>
          <div className="app-line app-line-3"></div>
        </div>

        {/* Pulsing Circles */}
        <div className="app-pulsing-circles">
          <div className="app-circle app-circle-1"></div>
          <div className="app-circle app-circle-2"></div>
          <div className="app-circle app-circle-3"></div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <h2 className="fw-bold mb-3">IndiCab Mobile App</h2>
            <p className="lead mb-4">
              Book your rides on the go with our easy-to-use mobile application
            </p>
          </div>
        </div>

        <div className="app-features">
          <div className="app-feature">
            <i className="bi bi-phone"></i>
            <h5>Book</h5>
            <p>Easy booking process</p>
          </div>
          <div className="app-feature">
            <i className="bi bi-star"></i>
            <h5>Rate</h5>
            <p>Rate your experience</p>
          </div>
          <div className="app-feature">
            <i className="bi bi-geo-alt"></i>
            <h5>Track</h5>
            <p>Real-time tracking</p>
          </div>
        </div>

        <div className="row">
          <div className="col-12 text-center">
            <h4 className="mb-4">Download Now ({downloadCount} downloads)</h4>
            <div className="download-buttons">
              <a href="#" className="download-btn" onClick={handleDownloadClick}>
                <i className="bi bi-apple"></i>
                <div>
                  <div style={{ fontSize: '0.8rem' }}>Download on the</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>App Store</div>
                </div>
              </a>
              <a href="#" className="download-btn" onClick={handleDownloadClick}>
                <i className="bi bi-google-play"></i>
                <div>
                  <div style={{ fontSize: '0.8rem' }}>GET IT ON</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppSection
