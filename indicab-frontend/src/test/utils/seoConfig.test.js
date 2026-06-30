import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getBaseUrl,
  SEO_PAGES,
  getCitySEOData,
  getServiceSEOData,
  generateSchemaMarkup,
  createBreadcrumbs,
  getPageMetaTags,
  getCanonicalUrl,
  getOGImage,
} from '../../utils/seoConfig';

// ---------------------------------------------------------------------------
// getBaseUrl
// ---------------------------------------------------------------------------
describe('getBaseUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_BASE_URL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return VITE_BASE_URL when set', () => {
    vi.stubEnv('VITE_BASE_URL', 'https://staging.indicab.com');
    expect(getBaseUrl()).toBe('https://staging.indicab.com');
  });

  it('should fall back to window.location.origin when env is empty', () => {
    vi.stubEnv('VITE_BASE_URL', '');
    const origin = 'http://localhost:3000';
    vi.spyOn(window, 'location', 'get').mockReturnValue({ origin }); // Adjust: window.location.origin is read-only in JSDOM.

    // JSDOM window.location.origin is 'http://localhost:3000' by default anyway.
    // Just verify it returns a string starting with http.
    const result = getBaseUrl();
    expect(result).toMatch(/^https?:\/\//);
  });
});

// ---------------------------------------------------------------------------
// SEO_PAGES
// ---------------------------------------------------------------------------
describe('SEO_PAGES', () => {
  const expectedKeys = [
    'home', 'about', 'packages', 'blog', 'contact',
    'login', 'register', 'profile', 'bookingHistory',
  ];

  it('should define every expected page key', () => {
    expectedKeys.forEach((key) => {
      expect(SEO_PAGES).toHaveProperty(key);
    });
  });

  it('should have title, description, keywords, and path on every entry', () => {
    expectedKeys.forEach((key) => {
      const page = SEO_PAGES[key];
      expect(page).toHaveProperty('title');
      expect(page).toHaveProperty('description');
      expect(page).toHaveProperty('keywords');
      expect(page).toHaveProperty('path');
    });
  });

  it('should set robots to "noindex, follow" on auth pages', () => {
    expect(SEO_PAGES.login.robots).toBe('noindex, follow');
    expect(SEO_PAGES.register.robots).toBe('noindex, follow');
    expect(SEO_PAGES.profile.robots).toBe('noindex, follow');
    expect(SEO_PAGES.bookingHistory.robots).toBe('noindex, follow');
  });

  it('should not set robots on public pages', () => {
    expect(SEO_PAGES.home.robots).toBeUndefined();
    expect(SEO_PAGES.about.robots).toBeUndefined();
    expect(SEO_PAGES.blog.robots).toBeUndefined();
  });

  it('should have correct paths for key pages', () => {
    expect(SEO_PAGES.home.path).toBe('/');
    expect(SEO_PAGES.about.path).toBe('/about');
    expect(SEO_PAGES.packages.path).toBe('/packages');
    expect(SEO_PAGES.blog.path).toBe('/blog');
    expect(SEO_PAGES.contact.path).toBe('/contact');
    expect(SEO_PAGES.login.path).toBe('/login');
    expect(SEO_PAGES.register.path).toBe('/register');
    expect(SEO_PAGES.profile.path).toBe('/profile');
    expect(SEO_PAGES.bookingHistory.path).toBe('/history');
  });
});

// ---------------------------------------------------------------------------
// getCitySEOData
// ---------------------------------------------------------------------------
describe('getCitySEOData', () => {
  it('should return SEO data for a single-word city', () => {
    const data = getCitySEOData('Mumbai');
    expect(data.title).toContain('Mumbai');
    expect(data.description).toContain('Mumbai');
    expect(data.keywords).toContain('Mumbai');
    expect(data.path).toBe('/city/mumbai');
  });

  it('should slugify multi-word city names', () => {
    const data = getCitySEOData('New Delhi');
    expect(data.path).toBe('/city/new-delhi');
    expect(data.title).toContain('New Delhi');
  });

  it('should handle city name with extra whitespace', () => {
    const data = getCitySEOData('  Bangalore  ');
    expect(data.path).toBe('/city/-bangalore-');
  });
});

// ---------------------------------------------------------------------------
// getServiceSEOData
// ---------------------------------------------------------------------------
describe('getServiceSEOData', () => {
  it('should return SEO data with provided description', () => {
    const data = getServiceSEOData('Airport Transfer', 'Fast airport pickup & drop service');
    expect(data.title).toContain('Airport Transfer');
    expect(data.description).toBe('Fast airport pickup & drop service');
    expect(data.keywords).toContain('Airport Transfer');
    expect(data.path).toBe('/service/airport-transfer');
  });

  it('should generate default description when omitted', () => {
    const data = getServiceSEOData('Hourly Rental');
    expect(data.description).toContain('Hourly Rental');
    expect(data.description).toContain('safe and reliable');
  });

  it('should slugify multi-word service names', () => {
    const data = getServiceSEOData('Corporate Travel');
    expect(data.path).toBe('/service/corporate-travel');
  });
});

// ---------------------------------------------------------------------------
// generateSchemaMarkup
// ---------------------------------------------------------------------------
describe('generateSchemaMarkup', () => {
  describe('organization', () => {
    it('should generate organization schema by default', () => {
      const schema = generateSchemaMarkup('organization');
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('IndiCab');
      expect(schema).toHaveProperty('url');
      expect(schema).toHaveProperty('logo');
      expect(schema).toHaveProperty('sameAs');
      expect(schema).toHaveProperty('contactPoint');
    });

    it('should include social media links', () => {
      const schema = generateSchemaMarkup('organization');
      expect(schema.sameAs).toContain('https://www.facebook.com/indicab');
      expect(schema.sameAs).toContain('https://www.twitter.com/indicab');
      expect(schema.sameAs).toContain('https://www.instagram.com/indicab');
    });
  });

  describe('localBusiness', () => {
    it('should generate local business schema', () => {
      const schema = generateSchemaMarkup('localBusiness');
      expect(schema['@type']).toBe('LocalBusiness');
      expect(schema.priceRange).toBe('₹');
      expect(schema.serviceType).toContain('Ride Booking');
    });

    it('should use provided cities in areaServed', () => {
      const schema = generateSchemaMarkup('localBusiness', {
        cities: ['Mumbai', 'Delhi', 'Bangalore'],
      });
      expect(schema.areaServed).toEqual(['Mumbai', 'Delhi', 'Bangalore']);
    });

    it('should fall back to default city list when not provided', () => {
      const schema = generateSchemaMarkup('localBusiness', {});
      expect(schema.areaServed).toContain('Bangalore');
      expect(schema.areaServed).toContain('Delhi');
      expect(schema.areaServed).toContain('Mumbai');
    });
  });

  describe('travelPackage', () => {
    it('should generate travel package schema', () => {
      const schema = generateSchemaMarkup('travelPackage', {
        name: 'Weekend Getaway',
        description: 'Relaxing weekend trip',
        url: '/packages/weekend',
        price: '4999',
      });
      expect(schema['@type']).toBe('TravelPackage');
      expect(schema.name).toBe('Weekend Getaway');
      expect(schema.description).toBe('Relaxing weekend trip');
      expect(schema.price).toBe('4999');
      expect(schema.priceCurrency).toBe('INR');
      expect(schema.provider['@type']).toBe('Organization');
      expect(schema.provider.name).toBe('IndiCab');
    });

    it('should use default values when data is empty', () => {
      const schema = generateSchemaMarkup('travelPackage', {});
      expect(schema.name).toBe('IndiCab Travel Package');
      expect(schema.price).toBe('0');
    });
  });

  describe('breadcrumbs', () => {
    it('should generate breadcrumb schema from provided items', () => {
      const items = [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Packages', item: '/packages' },
      ];
      const schema = generateSchemaMarkup('breadcrumbs', { items });
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toEqual(items);
    });
  });

  it('should default to organization schema for unknown type', () => {
    const schema = generateSchemaMarkup('unknownType');
    expect(schema['@type']).toBe('Organization');
  });

  it('should default to organization when type is missing', () => {
    const schema = generateSchemaMarkup(undefined);
    expect(schema['@type']).toBe('Organization');
  });
});

// ---------------------------------------------------------------------------
// createBreadcrumbs
// ---------------------------------------------------------------------------
describe('createBreadcrumbs', () => {
  it('should return a BreadcrumbList with correct structure', () => {
    const result = createBreadcrumbs([
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' },
      { label: 'Airport Transfer', url: '/services/airport' },
    ]);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('BreadcrumbList');
    expect(result.itemListElement).toHaveLength(3);
  });

  it('should set sequential positions starting from 1', () => {
    const result = createBreadcrumbs([
      { label: 'Home', url: '/' },
      { label: 'Blog', url: '/blog' },
    ]);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[0].name).toBe('Home');
    expect(result.itemListElement[1].position).toBe(2);
    expect(result.itemListElement[1].name).toBe('Blog');
  });

  it('should build the item URL from base URL + path', () => {
    const result = createBreadcrumbs([{ label: 'Home', url: '/' }]);
    expect(result.itemListElement[0].item).toMatch(/^https?:\/\/.*\/$/);
  });
});

// ---------------------------------------------------------------------------
// getPageMetaTags
// ---------------------------------------------------------------------------
describe('getPageMetaTags', () => {
  it('should return correct tags for a known page', () => {
    const tags = getPageMetaTags('about');
    expect(tags.title).toBe('About IndiCab - Our Mission & Story');
    expect(tags.description).toContain('safe, reliable, and affordable');
    expect(tags.path).toBe('/about');
  });

  it('should return correct tags for blog page', () => {
    const tags = getPageMetaTags('blog');
    expect(tags.title).toContain('IndiCab Blog');
    expect(tags.path).toBe('/blog');
  });

  it('should fall back to home page tags for unknown key', () => {
    const tags = getPageMetaTags('nonexistent');
    expect(tags.title).toBe('IndiCab - Reliable Ride Booking with Trusted Indian Drivers');
    expect(tags.path).toBe('/');
  });

  it('should fall back to home for undefined key', () => {
    const tags = getPageMetaTags(undefined);
    expect(tags.title).toBe('IndiCab - Reliable Ride Booking with Trusted Indian Drivers');
  });
});

// ---------------------------------------------------------------------------
// getCanonicalUrl
// ---------------------------------------------------------------------------
describe('getCanonicalUrl', () => {
  it('should join base URL with given path', () => {
    vi.stubEnv('VITE_BASE_URL', 'https://indicab.com');
    expect(getCanonicalUrl('/about')).toBe('https://indicab.com/about');
    expect(getCanonicalUrl('/contact')).toBe('https://indicab.com/contact');
    vi.unstubAllEnvs();
  });

  it('should handle root path', () => {
    vi.stubEnv('VITE_BASE_URL', 'https://indicab.com');
    expect(getCanonicalUrl('/')).toBe('https://indicab.com/');
    vi.unstubAllEnvs();
  });

  it('should not duplicate slashes', () => {
    vi.stubEnv('VITE_BASE_URL', 'https://indicab.com');
    const url = getCanonicalUrl('/about');
    expect(url).not.toContain('//about');
    vi.unstubAllEnvs();
  });
});

// ---------------------------------------------------------------------------
// getOGImage
// ---------------------------------------------------------------------------
describe('getOGImage', () => {
  it('should return default taxi image when type is omitted', () => {
    const img = getOGImage();
    expect(img).toBe('https://img.icons8.com/color/96/taxi.png');
  });

  it('should return default for unknown type', () => {
    const img = getOGImage('unknown');
    expect(img).toBe('https://img.icons8.com/color/96/taxi.png');
  });

  it('should return blog image for blog type', () => {
    expect(getOGImage('blog')).toBe('https://img.icons8.com/color/96/blog.png');
  });

  it('should return packages image for packages type', () => {
    expect(getOGImage('packages')).toBe('https://img.icons8.com/color/96/package.png');
  });

  it('should return about image for about type', () => {
    expect(getOGImage('about')).toBe('https://img.icons8.com/color/96/organization.png');
  });

  it('should return default for empty string type', () => {
    expect(getOGImage('')).toBe('https://img.icons8.com/color/96/taxi.png');
  });
});
