import React from 'react';
import './LoadingSpinner.css';

/**
 * Reusable loading spinner component
 * Props:
 * - size: 'sm', 'md', 'lg' (default: 'md')
 * - fullScreen: boolean (default: false)
 * - message: string (optional loading message)
 */
const LoadingSpinner = ({ size = 'md', fullScreen = false, message = null }) => {
  const sizeClass = `spinner-${size}`;
  
  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen">
        <div className={`loading-spinner ${sizeClass}`}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {message && <p className="loading-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner ${sizeClass}`}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
