import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  getPageMetaTags,
  getCanonicalUrl,
  getOGImage,
  generateSchemaMarkup,
} from '../utils/seoConfig';

/**
 * SEOHead Component
 * Manages dynamic meta tags, canonical URLs, and schema markup for each page
 * 
 * @param {string} pageKey - Key from SEO_PAGES config (e.g., 'home', 'about')
 * @param {object} customMeta - Override default meta tags
 * @param {object} schemaMarkup - Custom schema markup
 * @param {array} breadcrumbs - Breadcrumb items for schema
 */
const SEOHead = ({
  pageKey,
  customMeta = {},
  schemaMarkup = null,
  breadcrumbs = null,
  title = null,
  description = null,
  keywords = null,
  path = null,
}) => {
  const defaultMeta = getPageMetaTags(pageKey);
  
  // Merge defaults with overrides
  const meta = {
    title: title || customMeta.title || defaultMeta.title,
    description: description || customMeta.description || defaultMeta.description,
    keywords: keywords || customMeta.keywords || defaultMeta.keywords,
    path: path || customMeta.path || defaultMeta.path,
    robots: customMeta.robots || defaultMeta.robots || 'index, follow',
  };

  const canonicalUrl = getCanonicalUrl(meta.path);
  const ogImage = customMeta.ogImage || getOGImage();

  // Default schema markup if not provided
  const schema = schemaMarkup || generateSchemaMarkup('organization');

  // Generate breadcrumb schema if provided
  const breadcrumbSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': getCanonicalUrl(item.url),
    })),
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta name="robots" content={meta.robots} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Additional Meta Tags */}
      {customMeta.author && <meta name="author" content={customMeta.author} />}
      {customMeta.publishDate && (
        <meta property="article:published_time" content={customMeta.publishDate} />
      )}
      {customMeta.modifiedDate && (
        <meta property="article:modified_time" content={customMeta.modifiedDate} />
      )}
    </Helmet>
  );
};

export default SEOHead;
