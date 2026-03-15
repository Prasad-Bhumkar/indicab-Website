import { useEffect } from 'react';

/**
 * Hook to manage SEO meta tags for each page
 * Updates document head with title, description, OG tags, and structured data
 */
export const useSEO = (config) => {
  useEffect(() => {
    const {
      title = 'IndiCab - Reliable Ride Booking Service',
      description = 'Book reliable rides with trusted Indian drivers. Easy booking, safe travel, affordable prices.',
      keywords = 'ride booking, taxi service, car rental, India, drivers',
      image = 'https://img.icons8.com/color/96/taxi.png',
      url = window.location.href,
      type = 'website',
      author = 'IndiCab',
    } = config;

    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`) || 
                document.querySelector(`meta[property="${name}"]`);
      
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        if (name.startsWith('og:')) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    // Core meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', author);
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');
    updateMeta('charset', 'UTF-8');

    // Open Graph tags
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', image);
    updateMeta('og:url', url);
    updateMeta('og:type', type);
    updateMeta('og:site_name', 'IndiCab');

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Additional SEO tags
    updateMeta('robots', 'index, follow');
    updateMeta('language', 'English');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Add structured data (JSON-LD)
    let script = document.querySelector('script[type="application/ld+json"]');
    if (script) {
      script.remove();
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'Organization',
      name: 'IndiCab',
      description: description,
      url: 'https://indicab.com',
      logo: 'https://img.icons8.com/color/96/taxi.png',
      sameAs: [
        'https://www.facebook.com/indicab',
        'https://www.twitter.com/indicab',
        'https://www.instagram.com/indicab',
      ],
    };

    if (type === 'article') {
      structuredData.author = {
        '@type': 'Organization',
        name: 'IndiCab',
      };
      structuredData.image = image;
    }

    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [config]);
};
