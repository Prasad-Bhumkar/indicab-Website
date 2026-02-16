import React, { useState, useEffect } from 'react';
import { offlineQueue } from '../config/apiConfig';

const OfflineIndicator = () => {
  const [queueStatus, setQueueStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Get initial queue status
    const status = offlineQueue.getQueueStatus();
    setQueueStatus(status);

    // Subscribe to queue changes
    const unsubscribe = offlineQueue.subscribe((event) => {
      const updatedStatus = offlineQueue.getQueueStatus();
      setQueueStatus(updatedStatus);

      // Auto-hide after sync completes
      if (event.type === 'sync_complete' && updatedStatus.pending === 0) {
        setTimeout(() => {
          setShowDetails(false);
        }, 3000);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!queueStatus) {
    return null;
  }

  // Don't show if online and no pending items
  if (queueStatus.isOnline && queueStatus.pending === 0) {
    return null;
  }

  const statusColor = queueStatus.isOnline ? '#10b981' : '#ef4444';
  const statusText = queueStatus.isOnline ? 'Online' : 'Offline';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#ffffff',
      border: `2px solid ${statusColor}`,
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      maxWidth: '300px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: queueStatus.total > 0 ? 'pointer' : 'default',
        }}
        onClick={() => queueStatus.total > 0 && setShowDetails(!showDetails)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColor,
              animation: !queueStatus.isOnline ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
            {statusText}
          </span>
          {queueStatus.pending > 0 && (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              {queueStatus.pending} pending
            </span>
          )}
        </div>
        {queueStatus.total > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#6b7280',
              padding: '0',
            }}
          >
            {showDetails ? '▼' : '▶'}
          </button>
        )}
      </div>

      {showDetails && queueStatus.total > 0 && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px' }}>
            <p style={{ margin: '4px 0' }}>
              <strong>Total:</strong> {queueStatus.total} {queueStatus.total === 1 ? 'booking' : 'bookings'}
            </p>
            {queueStatus.pending > 0 && (
              <p style={{ margin: '4px 0', color: '#ef4444' }}>
                <strong>Pending:</strong> {queueStatus.pending}
              </p>
            )}
            {queueStatus.syncing > 0 && (
              <p style={{ margin: '4px 0', color: '#f59e0b' }}>
                <strong>Syncing:</strong> {queueStatus.syncing}
              </p>
            )}
            {queueStatus.failed > 0 && (
              <p style={{ margin: '4px 0', color: '#ef4444' }}>
                <strong>Failed:</strong> {queueStatus.failed}
              </p>
            )}
            {queueStatus.completed > 0 && (
              <p style={{ margin: '4px 0', color: '#10b981' }}>
                <strong>Completed:</strong> {queueStatus.completed}
              </p>
            )}
          </div>
          {!queueStatus.isOnline && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '8px 0 0 0' }}>
              ⚠️ Bookings will sync when you reconnect
            </p>
          )}
          {queueStatus.isOnline && queueStatus.pending > 0 && (
            <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '8px 0 0 0' }}>
              ✓ Syncing your bookings...
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default OfflineIndicator;
