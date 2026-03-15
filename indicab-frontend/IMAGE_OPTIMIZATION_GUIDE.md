# Image Optimization Guide

## Overview

This guide covers best practices for optimizing images in the IndiCab frontend for better SEO and performance.

## Quick Start

### Use Lazy Loading Component

```jsx
import LazyImage from './components/LazyImage';

<LazyImage 
  src="/path/to/image.jpg" 
  alt="Description"
  placeholder="/path/to/placeholder.jpg"
/>
```

### Use Responsive Images with WebP

```jsx
import { ResponsiveImage } from './components/LazyImage';

<ResponsiveImage 
  webpSrc="/path/to/image.webp" 
  fallbackSrc="/path/to/image.jpg" 
  alt="Description"
/>
```

### Use Picture Elements for Multiple Formats

```jsx
import { PictureImage } from './components/LazyImage';

<PictureImage
  sources={[
    {
      srcSet: '/images/image-320w.webp',
      sizes: '(max-width: 640px) 100vw',
      type: 'image/webp',
    },
    {
      srcSet: '/images/image-640w.webp',
      sizes: '(min-width: 641px) and (max-width: 1024px) 50vw',
      type: 'image/webp',
    },
    {
      srcSet: '/images/image-1280w.webp',
      sizes: '(min-width: 1025px) 33vw',
      type: 'image/webp',
    },
  ]}
  fallbackSrc="/images/image.jpg"
  alt="Responsive image"
/>
```

## Image Format Guide

### Format Comparison

| Format | Use Case | Compression | Browser Support |
|--------|----------|-------------|-----------------|
| **WebP** | All images | Excellent (25-35% smaller) | Modern browsers |
| **JPEG** | Photos, high quality | Good | All browsers |
| **PNG** | Graphics, transparency | Fair | All browsers |
| **SVG** | Icons, logos, graphics | Excellent | Modern browsers |
| **AVIF** | Modern high-compression | Best (50%+ smaller) | Latest browsers |

### Recommended Sizes

- **Thumbnail**: 100x100px (max 15KB)
- **Small**: 200x200px (max 30KB)
- **Medium**: 400x400px (max 75KB)
- **Large**: 800x800px (max 150KB)
- **Hero Images**: 1200x600px (max 200KB)

## SEO Best Practices

### 1. Alt Text

```jsx
// Good
<LazyImage src="image.jpg" alt="Ride booking in Bangalore" />

// Bad
<LazyImage src="image.jpg" alt="image" />
```

### 2. Image Filenames

```
// Good
ride-booking-bangalore.jpg
airport-transfer-service.png

// Bad
img1.jpg
photo.png
```

### 3. Image Compression

Before uploading images:

```bash
# Using ImageOptim (macOS)
# Drag images to ImageOptim app

# Using FFmpeg (all platforms)
ffmpeg -i input.jpg -q:v 2 output.jpg

# Using ImageMagick
convert input.jpg -quality 85 -strip output.jpg
```

### 4. Responsive Images

Always provide multiple sizes:

```jsx
// Mobile: 100vw width
// Desktop: 50vw width
<ResponsiveImage
  webpSrc="/image-mobile.webp /image-desktop.webp"
  fallbackSrc="/image-mobile.jpg /image-desktop.jpg"
  alt="Description"
/>
```

### 5. Image Declarations

Always include:
- `src` - Image source
- `alt` - Descriptive alt text
- `width` & `height` - Prevent layout shift
- `loading="lazy"` - For non-critical images

```jsx
<LazyImage
  src="/image.jpg"
  alt="Taxi service in Delhi"
  style={{ width: '400px', height: '300px' }}
/>
```

## Performance Metrics

### Core Web Vitals Impact

- **LCP (Largest Contentful Paint)**: Lazy load above-fold images
- **CLS (Cumulative Layout Shift)**: Always specify width/height
- **FID (First Input Delay)**: Optimize image sizes

### Target Metrics

- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Image Load Time: < 2s

## WebP Conversion

### Manual Conversion

```bash
# Convert single image
cwebp input.jpg -o output.webp

# Convert with quality
cwebp -q 80 input.jpg -o output.webp

# Batch convert (macOS/Linux)
for file in *.jpg; do cwebp "$file" -o "${file%.jpg}.webp"; done
```

### Online Tools

- [CloudConvert](https://cloudconvert.com/)
- [Convertio](https://convertio.co/)
- [TinyPNG](https://tinypng.com/) - Also optimizes JPG/PNG

## Vite Configuration

Current optimization settings in `vite.config.js`:

```javascript
assetsInclude: ['**/*.webp', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
build: {
  assetsInlineLimit: 4096, // Inline images < 4KB
}
```

## Implementation Checklist

- [ ] Use `LazyImage` component for all images
- [ ] Provide alt text for every image
- [ ] Convert hero and product images to WebP
- [ ] Specify width/height attributes
- [ ] Use responsive images for different screen sizes
- [ ] Compress images before upload (< 200KB for hero)
- [ ] Use SVG for icons and logos
- [ ] Test Core Web Vitals with PageSpeed Insights
- [ ] Monitor image sizes in production builds

## Tools & Resources

### Image Optimization Tools

- [ImageOptim](https://imageoptim.com/) - macOS
- [FileOptimizer](https://nikkhokkho.sourceforge.io/) - Windows
- [Optimizilla](https://imagecompressor.com/) - Online
- [Squoosh](https://squoosh.app/) - Google's optimizer

### Testing Tools

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Documentation

- [MDN Web Docs - Images](https://developer.mozilla.org/en-US/docs/Web/Media/images)
- [Web.dev - Image Optimization](https://web.dev/image-optimization/)
- [WebP Documentation](https://developers.google.com/speed/webp)

## Common Issues & Solutions

### Issue: WebP Not Loading in Fallback Browsers

**Solution**: Use `ResponsiveImage` component which automatically detects browser support.

### Issue: Image Layout Shift

**Solution**: Always specify width and height, or use aspect-ratio CSS.

```css
.image-container {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
```

### Issue: Images Not Lazy Loading

**Solution**: Ensure images are below the fold or use explicit `threshold` prop.

```jsx
<LazyImage src="image.jpg" alt="test" threshold={0.5} />
```

## Monitoring

### Check Image Performance

```javascript
// In browser console
const images = document.querySelectorAll('img');
images.forEach(img => {
  const perfData = performance.getEntriesByName(img.src)[0];
  console.log(`${img.alt}: ${perfData.duration.toFixed(2)}ms`);
});
```

### Measure Impact

Use DevTools > Network tab to:
- Monitor image load times
- Check file sizes
- Verify format delivery

## Future Improvements

1. **Automatic WebP Generation** - Set up image processing pipeline
2. **CDN Integration** - Use Cloudinary or similar for on-the-fly optimization
3. **Responsive Images Plugin** - Generate multiple sizes automatically
4. **Image Caching** - Browser and server-side cache strategy
5. **Progressive JPG** - Render baseline first

## Support

For questions or optimization tips, refer to:
- Project Discord/Support Channel
- Web.dev Best Practices
- Google PageSpeed Insights recommendations
