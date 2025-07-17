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
