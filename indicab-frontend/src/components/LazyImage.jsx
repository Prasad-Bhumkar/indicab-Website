import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage Component
 * Provides lazy loading for images with fallback and error handling
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} placeholder - Placeholder image while loading
 * @param {string} className - CSS class name
 * @param {object} style - Inline styles
 * @param {number} threshold - Intersection observer threshold (0-1)
 */
const LazyImage = ({
  src,
  alt = '',
  placeholder = null,
  className = '',
  style = {},
  threshold = 0.1,
  onLoad = null,
  onError = null,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E');
  const imageRef = useRef(null);

  useEffect(() => {
    // Create Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is visible, load it
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              setHasError(false);
              if (onLoad) onLoad();
            };
            img.onerror = () => {
              setHasError(true);
              if (onError) onError();
            };
            
            // Stop observing this element
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src, threshold, onLoad, onError]);

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={`lazy-image ${isLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''} ${className}`}
      style={{
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.6,
        ...style,
      }}
    />
  );
};

export default LazyImage;

/**
 * Advanced LazyImage with WebP support
 * Automatically serves WebP images on supported browsers
 */
export const ResponsiveImage = ({
  webpSrc,
  fallbackSrc,
  alt = '',
  className = '',
  style = {},
  sizes = '',
  srcSet = '',
  ...rest
}) => {
  const [supportsWebP, setSupportsWebP] = useState(false);

  useEffect(() => {
    // Check WebP support
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    setSupportsWebP(
      canvas.toDataURL('image/webp').indexOf('image/webp') === 5
    );
  }, []);

  const imageSrc = supportsWebP && webpSrc ? webpSrc : fallbackSrc;

  return (
    <LazyImage
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
    />
  );
};

/**
 * Picture element wrapper for responsive images
 * Supports multiple formats and sizes
 */
export const PictureImage = ({
  sources = [], // Array of { srcSet, sizes, type, media }
  fallbackSrc,
  alt = '',
  className = '',
  style = {},
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = fallbackSrc;
            img.onload = () => {
              setIsLoaded(true);
              setHasError(false);
            };
            img.onerror = () => {
              setHasError(true);
            };
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [fallbackSrc]);

  return (
    <picture
      style={{
        display: 'block',
        opacity: isLoaded ? 1 : 0.6,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          sizes={source.sizes}
          type={source.type}
          media={source.media}
        />
      ))}
      <img
        ref={imageRef}
        src={fallbackSrc}
        alt={alt}
        className={`picture-image ${isLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''} ${className}`}
        style={{
          ...style,
          display: 'block',
          width: '100%',
          height: 'auto',
        }}
        {...rest}
      />
    </picture>
  );
};
