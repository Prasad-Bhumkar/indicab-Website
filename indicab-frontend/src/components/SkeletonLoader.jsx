import React from 'react';
import './SkeletonLoader.css';

/**
 * Skeleton loader component for showing loading states
 * Props:
 * - type: 'card', 'table-row', 'list', 'text', 'avatar', 'paragraph' (default: 'card')
 * - count: number of skeleton items to render (default: 1)
 * - height: height of skeleton element (default: '20px')
 */
const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  height = '20px',
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card-container">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-content">
                  <div className="skeleton-text skeleton-title" />
                  <div className="skeleton-text" />
                  <div className="skeleton-text" style={{ width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'table-row':
        return (
          <div className="skeleton-table-container">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-table-row">
                <div className="skeleton-cell" />
                <div className="skeleton-cell" />
                <div className="skeleton-cell" />
                <div className="skeleton-cell" />
                <div className="skeleton-cell" style={{ width: '50px' }} />
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="skeleton-list-container">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-list-item">
                <div className="skeleton-avatar" />
                <div className="skeleton-list-content">
                  <div className="skeleton-text skeleton-text-sm" />
                  <div className="skeleton-text skeleton-text-xs" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="skeleton-text-container">
            {Array.from({ length: count }).map((_, i) => (
              <div 
                key={i} 
                className="skeleton-text" 
                style={{ height }}
              />
            ))}
          </div>
        );

      case 'avatar':
        return (
          <div className="skeleton-avatar-container">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-avatar" />
            ))}
          </div>
        );

      case 'paragraph':
        return (
          <div className="skeleton-paragraph-container">
            {Array.from({ length: count || 3 }).map((_, i) => (
              <div 
                key={i} 
                className="skeleton-text" 
                style={{ 
                  width: i === (count || 3) - 1 ? '60%' : '100%',
                  marginBottom: '8px',
                }}
              />
            ))}
          </div>
        );

      default:
        return <div className="skeleton-card" />;
    }
  };

  return (
    <div className={`skeleton-loader ${className}`}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;
