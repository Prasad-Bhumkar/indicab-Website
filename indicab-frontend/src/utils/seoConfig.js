/**
 * SEO Configuration and Utilities
 * Manages meta tags, canonical URLs, and schema markup
 */

/**
 * Get base URL from environment
 * In development: uses VITE_BASE_URL or window.location.origin
 * In production: should be set via environment variables
 */
export const getBaseUrl = () => {
  // Try to use environment variable first
  if (import.meta.env.VITE_BASE_URL) {
    return import.meta.env.VITE_BASE_URL;
  }

  // Fall back to window origin if available
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Default to production domain
  return 'https://indicab.com';
};

// Page-specific SEO metadata
export const SEO_PAGES = {
  home: {
    title: 'IndiCab - Reliable Ride Booking with Trusted Indian Drivers',
    description: 'Book reliable rides with trusted Indian drivers across India. Easy booking, safe travel, affordable prices.',
    keywords: 'ride booking, taxi service, car rental, India, drivers, transportation',
    path: '/',
  },
  about: {
    title: 'About IndiCab - Our Mission & Story',
    description: 'Learn about IndiCab\'s mission to provide safe, reliable, and affordable ride-booking services across India.',
    keywords: 'about IndiCab, ride booking mission, trusted drivers, India transportation',
    path: '/about',
  },
  packages: {
    title: 'Travel Packages - Hourly Rental, Airport Transfer & Corporate Travel',
    description: 'Explore IndiCab\'s travel packages including hourly rentals, airport transfers, and corporate travel solutions.',
    keywords: 'travel packages, hourly rental, airport transfer, corporate travel, India',
    path: '/packages',
  },
  blog: {
    title: 'IndiCab Blog - Travel Tips, Safety, & Ride Booking Guides',
    description: 'Read latest articles on travel tips, safety guides, and ride-booking best practices on IndiCab blog.',
    keywords: 'travel blog, ride safety, travel guides, transportation tips',
    path: '/blog',
  },
  contact: {
    title: 'Contact IndiCab - Get in Touch',
    description: 'Have questions? Contact IndiCab customer support for reliable ride-booking assistance.',
    keywords: 'contact IndiCab, customer support, ride booking help',
    path: '/contact',
  },
  login: {
    title: 'Login - IndiCab Ride Booking',
    description: 'Login to your IndiCab account to book rides and manage bookings.',
    keywords: 'login, IndiCab account',
    path: '/login',
    robots: 'noindex, follow',
  },
  register: {
    title: 'Register - Join IndiCab',
    description: 'Create a new IndiCab account and start booking reliable rides today.',
    keywords: 'register, signup, IndiCab account',
    path: '/register',
    robots: 'noindex, follow',
  },
  profile: {
    title: 'My Profile - IndiCab',
    description: 'Manage your IndiCab profile, preferences, and account settings.',
    keywords: 'profile, account settings, IndiCab',
    path: '/profile',
    robots: 'noindex, follow',
  },
  bookingHistory: {
    title: 'Booking History - IndiCab',
    description: 'View your past bookings and ride history on IndiCab.',
    keywords: 'booking history, rides, IndiCab',
    path: '/history',
    robots: 'noindex, follow',
  },
};

// City-specific SEO metadata
export const getCitySEOData = (cityName) => ({
  title: `Ride Booking in ${cityName} - IndiCab Trusted Services`,
  description: `Book reliable rides in ${cityName} with IndiCab. Easy booking, safe travel, affordable prices across ${cityName}.`,
  keywords: `ride booking ${cityName}, taxi service ${cityName}, car rental ${cityName}, transportation ${cityName}`,
  path: `/city/${cityName.toLowerCase().replace(/\s+/g, '-')}`,
});

// Service-specific SEO metadata
export const getServiceSEOData = (serviceName, description) => ({
  title: `${serviceName} - IndiCab Ride Booking Services`,
  description: description || `Get ${serviceName} services with IndiCab. Book now for safe and reliable transportation.`,
  keywords: `${serviceName}, ride booking, IndiCab, transportation services`,
  path: `/service/${serviceName.toLowerCase().replace(/\s+/g, '-')}`,
});

/**
 * Generate JSON-LD schema markup
 */
export const generateSchemaMarkup = (type, data = {}) => {
  const baseUrl = getBaseUrl();

  const schemas = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'IndiCab',
      'url': baseUrl,
      'logo': `${baseUrl}/logo.png`,
      'description': 'Reliable ride-booking platform with trusted Indian drivers',
      'sameAs': [
        'https://www.facebook.com/indicab',
        'https://www.twitter.com/indicab',
        'https://www.instagram.com/indicab',
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-XXXXXXXXXX',
        'contactType': 'Customer Service',
      },
    },
    localBusiness: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'IndiCab',
      'image': `${baseUrl}/logo.png`,
      'description': 'Ride-booking service across major Indian cities',
      'url': baseUrl,
      'telephone': '+91-XXXXXXXXXX',
      'priceRange': '₹',
      'areaServed': data.cities || ['Bangalore', 'Delhi', 'Mumbai', 'Hyderabad'],
      'serviceType': ['Ride Booking', 'Taxi Service', 'Car Rental'],
    },
    travelPackage: {
      '@context': 'https://schema.org',
      '@type': 'TravelPackage',
      'name': data.name || 'IndiCab Travel Package',
      'description': data.description || 'Reliable ride-booking packages for various travel needs',
      'url': `${baseUrl}${data.url || '/packages'}`,
      'priceCurrency': 'INR',
      'price': data.price || '0',
      'provider': {
        '@type': 'Organization',
        'name': 'IndiCab',
      },
    },
    breadcrumbs: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': data.items || [],
    },
  };

  return schemas[type] || schemas.organization;
};

/**
 * Create breadcrumb schema
 */
export const createBreadcrumbs = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': `${getBaseUrl()}${item.url}`,
    })),
  };
};

/**
 * Get page-specific meta tags
 */
export const getPageMetaTags = (pageKey) => {
  return SEO_PAGES[pageKey] || SEO_PAGES.home;
};

/**
 * Canonical URL builder
 */
export const getCanonicalUrl = (path) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};

/**
 * Open Graph image URL
 */
export const getOGImage = (type = 'default') => {
  const images = {
    default: 'https://img.icons8.com/color/96/taxi.png',
    blog: 'https://img.icons8.com/color/96/blog.png',
    packages: 'https://img.icons8.com/color/96/package.png',
    about: 'https://img.icons8.com/color/96/organization.png',
  };
  return images[type] || images.default;
};
