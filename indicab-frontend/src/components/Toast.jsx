import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Wait for animation
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type] || 'ℹ';
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={() => {
          setIsVisible(false);
          if (onClose) {
            setTimeout(onClose, 300);
          }
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
