import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => {
  return (
    <div 
      className={`skeleton-base ${className}`} 
      style={{ 
        width: width || '100%', 
        height: height || '20px',
        borderRadius
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton height="150px" borderRadius="8px" />
    <div style={{ marginTop: '1rem' }}>
      <Skeleton width="60%" height="24px" />
      <Skeleton width="40%" height="16px" style={{ marginTop: '0.5rem' }} />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      <Skeleton height="40px" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="skeleton-table-row">
        <Skeleton height="30px" />
      </div>
    ))}
  </div>
);

export default Skeleton;
