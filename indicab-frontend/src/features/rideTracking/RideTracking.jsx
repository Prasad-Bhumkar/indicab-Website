import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../config/apiConfig';
import { websocketService } from '../../services/websocketService';
import { motion } from 'framer-motion';
import './RideTracking.css';

const RideTracking = () => {
  const { rideId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useWebSocket, setUseWebSocket] = useState(true);

  useEffect(() => {
    let intervalId;
    let unsubscribe;

    const fetchTrackingInfo = async () => {
      try {
        const response = await apiClient.get(`/v1/ride/track/${rideId}`);
        setTracking(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tracking information.');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTrackingInfo();

    // Start tracking simulation if not active on backend
    const startTracking = async () => {
      try {
        await apiClient.post(`/v1/ride/start/${rideId}`);
      } catch (e) {
        console.warn('Could not start tracking on backend:', e.message);
      }
    };
    startTracking();

    // Try to establish WebSocket connection
    const setupWebSocket = async () => {
      try {
        await websocketService.connect();
        unsubscribe = websocketService.subscribeToRideTracking(rideId, (update) => {
          setTracking(update);
          setUseWebSocket(true);
        });
      } catch (wsError) {
        console.warn('WebSocket connection failed, falling back to polling:', wsError.message);
        setUseWebSocket(false);
        // Fall back to polling if WebSocket fails
        setupPolling();
      }
    };

    const setupPolling = () => {
      // Polling as a fallback for when WebSocket is unavailable
      intervalId = setInterval(async () => {
        try {
          // Simulate progress for demo purposes
          await apiClient.post(`/v1/ride/simulate/${rideId}`);
          const response = await apiClient.get(`/v1/ride/track/${rideId}`);
          setTracking(response.data);
        } catch (err) {
          console.warn('Polling error:', err);
        }
      }, 3000);
    };

    // Setup WebSocket with fallback
    setupWebSocket();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (unsubscribe) unsubscribe();
      // Don't disconnect on unmount, let other components use the connection
      // websocketService.disconnect();
    };
  }, [rideId]);

  if (loading) return <div className="tracking-container">Loading ride tracking...</div>;
  if (error) return <div className="tracking-container alert alert-danger">{error}</div>;
  if (!tracking) return <div className="tracking-container">Ride not found or not being tracked.</div>;

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h3>Ride Tracking: #{rideId}</h3>
        <span className={`badge status-${tracking.rideStatus?.toLowerCase()}`}>
          {tracking.rideStatus}
        </span>
      </div>

      <div className="tracking-info-grid">
        <div className="info-card">
          <label>Driver</label>
          <h4>{tracking.driverName}</h4>
          <p>⭐ {tracking.driverRating || '4.8'}</p>
        </div>
        <div className="info-card">
          <label>Estimated Arrival</label>
          <h4>{tracking.etaMinutes} mins</h4>
        </div>
        <div className="info-card">
          <label>Progress</label>
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${tracking.progressPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p>{tracking.progressPercentage}% completed</p>
        </div>
      </div>

      <div className="tracking-map-simulation">
        <div className="map-placeholder">
          <div className="route-line" />
          <motion.div 
            className="car-marker"
            animate={{ 
              left: `${tracking.progressPercentage}%`,
              opacity: 1
            }}
            initial={{ opacity: 0 }}
          >
            🚗
          </motion.div>
          <div className="destination-marker">📍</div>
        </div>
        <p className="map-note">Interactive map would go here (Leaflet/Google Maps)</p>
      </div>

      <div className="tracking-footer">
        <button className="btn btn-outline-primary" onClick={() => window.history.back()}>Back to Bookings</button>
        <button className="btn btn-primary" onClick={() => alert('Emergency alert sent to support team.')}>Help</button>
      </div>
    </div>
  );
};

export default RideTracking;
