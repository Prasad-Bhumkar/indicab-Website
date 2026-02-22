import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/apiConfig';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [lastChecked, setLastChecked] = useState(null);

  const checkBackendStatus = async () => {
    setStatus('checking');
    try {
      // Use booking endpoint as health check since we don't have a dedicated health endpoint
      await apiClient.get('/v1/bookings', { timeout: 5000 });
      setStatus('online');
      setLastChecked(new Date());
    } catch (error) {
      setStatus('offline');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <i className="bi bi-wifi text-success"></i>;
      case 'offline':
        return <i className="bi bi-wifi-off text-danger"></i>;
      case 'checking':
        return <i className="bi bi-arrow-clockwise text-primary"></i>;
      default:
        return <i className="bi bi-question-circle text-secondary"></i>;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Backend Connected';
      case 'offline':
        return 'Backend Offline';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'offline':
        return 'text-danger';
      case 'checking':
        return 'text-primary';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div className="d-flex align-items-center">
      <span className={`me-2 ${getStatusClass()}`}>
        {getStatusIcon()}
      </span>
      <small className={getStatusClass()}>
        {getStatusText()}
        {lastChecked && status !== 'checking' && (
          <span className="text-muted ms-1">
            ({lastChecked.toLocaleTimeString()})
          </span>
        )}
      </small>
      {status === 'offline' && (
        <button 
          className="btn btn-sm btn-outline-secondary ms-2"
          onClick={checkBackendStatus}
          title="Retry connection"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      )}
    </div>
  );
};

export default BackendStatus;
