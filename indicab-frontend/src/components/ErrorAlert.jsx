import React from 'react';
import './ErrorAlert.css';

/**
 * Reusable error alert component
 * Props:
 * - error: string or error object
 * - onDismiss: callback function when alert is closed
 * - dismissible: boolean (default: true)
 * - type: 'danger', 'warning', 'info' (default: 'danger')
 */
const ErrorAlert = ({ error, onDismiss = null, dismissible = true, type = 'danger' }) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';

  return (
    <div className={`alert alert-${type} error-alert`} role="alert">
      <div className="alert-content">
        <i className={`bi bi-${type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}`}></i>
        <span>{errorMessage}</span>
      </div>
      {dismissible && (
        <button
          type="button"
          className="btn-close alert-close"
          onClick={onDismiss}
          aria-label="Close"
        />
      )}
    </div>
  );
};

export default ErrorAlert;
