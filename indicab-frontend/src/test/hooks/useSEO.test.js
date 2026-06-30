import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSEO } from '../../hooks/useSEO';

describe('useSEO', () => {
  beforeEach(() => {
    document.title = 'Default Title';
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set document.title from config', () => {
    renderHook(() => useSEO({ title: 'Test Page - IndiCab' }));
    expect(document.title).toBe('Test Page - IndiCab');
  });

  it('should use defaults when config is empty', () => {
    renderHook(() => useSEO({}));
    expect(document.title).toBe('IndiCab - Reliable Ride Booking Service');
  });

  it('should update description meta tag', () => {
    renderHook(() => useSEO({ description: 'Custom description' }));
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta.getAttribute('content')).toBe('Custom description');
  });

  it('should update keywords meta tag', () => {
    renderHook(() => useSEO({ keywords: 'test, seo, indicab' }));
    const meta = document.querySelector('meta[name="keywords"]');
    expect(meta).not.toBeNull();
    expect(meta.getAttribute('content')).toBe('test, seo, indicab');
  });

  it('should set author meta tag', () => {
    renderHook(() => useSEO({ author: 'IndiCab Team' }));
    const meta = document.querySelector('meta[name="author"]');
    expect(meta).not.toBeNull();
    expect(meta.getAttribute('content')).toBe('IndiCab Team');
  });

  it('should set default author when not provided', () => {
    renderHook(() => useSEO({}));
    const meta = document.querySelector('meta[name="author"]');
    expect(meta.getAttribute('content')).toBe('IndiCab');
  });

  describe('Open Graph tags', () => {
    it('should set og:title', () => {
      renderHook(() => useSEO({ title: 'OG Title' }));
      const meta = document.querySelector('meta[property="og:title"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('OG Title');
    });

    it('should set og:description', () => {
      renderHook(() => useSEO({ description: 'OG Desc' }));
      const meta = document.querySelector('meta[property="og:description"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('OG Desc');
    });

    it('should set og:image', () => {
      renderHook(() => useSEO({ image: 'https://example.com/img.png' }));
      const meta = document.querySelector('meta[property="og:image"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('https://example.com/img.png');
    });

    it('should set og:url', () => {
      renderHook(() => useSEO({ url: 'https://indicab.com/page' }));
      const meta = document.querySelector('meta[property="og:url"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('https://indicab.com/page');
    });

    it('should set og:type', () => {
      renderHook(() => useSEO({ type: 'article' }));
      const meta = document.querySelector('meta[property="og:type"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('article');
    });

    it('should set og:site_name', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[property="og:site_name"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('IndiCab');
    });
  });

  describe('Twitter Card tags', () => {
    it('should set twitter:card', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[name="twitter:card"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('summary_large_image');
    });

    it('should set twitter:title', () => {
      renderHook(() => useSEO({ title: 'Twitter Title' }));
      const meta = document.querySelector('meta[name="twitter:title"]');
      expect(meta.getAttribute('content')).toBe('Twitter Title');
    });

    it('should set twitter:description', () => {
      renderHook(() => useSEO({ description: 'Twitter Desc' }));
      const meta = document.querySelector('meta[name="twitter:description"]');
      expect(meta.getAttribute('content')).toBe('Twitter Desc');
    });

    it('should set twitter:image', () => {
      renderHook(() => useSEO({ image: 'https://example.com/twitter.png' }));
      const meta = document.querySelector('meta[name="twitter:image"]');
      expect(meta.getAttribute('content')).toBe('https://example.com/twitter.png');
    });
  });

  describe('additional SEO tags', () => {
    it('should set robots meta tag', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[name="robots"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('index, follow');
    });

    it('should set language meta tag', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[name="language"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('English');
    });

    it('should set viewport meta tag', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[name="viewport"]');
      expect(meta).not.toBeNull();
    });

    it('should set charset', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[name="charset"]');
      expect(meta).not.toBeNull();
      expect(meta.getAttribute('content')).toBe('UTF-8');
    });
  });

  describe('canonical URL', () => {
    it('should add canonical link element', () => {
      renderHook(() => useSEO({ url: 'https://indicab.com/about' }));
      const link = document.querySelector('link[rel="canonical"]');
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('https://indicab.com/about');
    });

    it('should update existing canonical element on re-render', () => {
      const { rerender } = renderHook(
        (config) => useSEO(config),
        { initialProps: { url: 'https://indicab.com/v1' } },
      );
      rerender({ url: 'https://indicab.com/v2' });
      const link = document.querySelector('link[rel="canonical"]');
      expect(link.getAttribute('href')).toBe('https://indicab.com/v2');
    });
  });

  describe('structured data (JSON-LD)', () => {
    it('should add JSON-LD script to document head', () => {
      renderHook(() => useSEO({}));
      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const data = JSON.parse(script.textContent);
      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('Organization');
      expect(data.name).toBe('IndiCab');
    });

    it('should use Article type when type is article', () => {
      renderHook(() => useSEO({ type: 'article', image: 'https://img.png' }));
      const script = document.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(script.textContent);
      expect(data['@type']).toBe('Article');
      expect(data.author).toBeDefined();
      expect(data.image).toBe('https://img.png');
    });

    it('should replace existing JSON-LD script on re-render', () => {
      renderHook(() => useSEO({}));
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts.length).toBe(1);
    });
  });

  describe('default config values', () => {
    it('should use default title when not provided', () => {
      renderHook(() => useSEO({ }));
      expect(document.title).toBe('IndiCab - Reliable Ride Booking Service');
    });

    it('should use default description when not provided', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[name="description"]');
      expect(meta.getAttribute('content')).toBe('Book reliable rides with trusted Indian drivers. Easy booking, safe travel, affordable prices.');
    });

    it('should use default keywords when not provided', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[name="keywords"]');
      expect(meta.getAttribute('content')).toBe('ride booking, taxi service, car rental, India, drivers');
    });

    it('should use default image when not provided', () => {
      renderHook(() => useSEO({}));
      const meta = document.querySelector('meta[property="og:image"]');
      expect(meta.getAttribute('content')).toBe('https://img.icons8.com/color/96/taxi.png');
    });
  });

  describe('updating existing tags', () => {
    it('should update existing meta tag content instead of creating duplicate', () => {
      renderHook(() => useSEO({ description: 'First' }));
      renderHook(() => useSEO({ description: 'Updated' }));
      const metas = document.querySelectorAll('meta[name="description"]');
      expect(metas.length).toBe(1);
      expect(metas[0].getAttribute('content')).toBe('Updated');
    });
  });
});
