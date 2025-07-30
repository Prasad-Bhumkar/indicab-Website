import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/apiConfig';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiClient.get('/api/bookings', { timeout: 3000 });
        if (!isOnline) {
          setIsOnline(true);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } catch (error) {
        if (isOnline) {
          setIsOnline(false);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
        }
      }
    };

    // Initial check
    checkConnection();

    // Check every 15 seconds
    const interval = setInterval(checkConnection, 15000);

    return () => clearInterval(interval);
  }, [isOnline]);

  if (!showNotification) return null;

  return (
    <div className={`position-fixed top-0 start-50 translate-middle-x mt-3 alert ${isOnline ? 'alert-success' : 'alert-warning'} alert-dismissible fade show`} 
         style={{ zIndex: 1050, minWidth: '300px' }}
         role="alert">
      <div className="d-flex align-items-center">
        <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-2`}></i>
        <div>
          <strong>{isOnline ? 'Connected!' : 'Connection Lost'}</strong>
          <div className="small">
            {isOnline 
              ? 'Backend connection restored. All features available.' 
              : 'Using offline mode. Some features may be limited.'
            }
          </div>
        </div>
      </div>
      <button 
        type="button" 
        className="btn-close" 
        onClick={() => setShowNotification(false)}
        aria-label="Close"
      ></button>
    </div>
  );
};

export default ConnectionStatus;
