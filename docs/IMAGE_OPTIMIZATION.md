# Image Optimization Guide

This guide explains how to use the image optimization system in Urbanomap for better performance.

## Overview

The project includes automatic WebP/AVIF image optimization with fallbacks to ensure compatibility across all browsers while delivering the best performance.

## Components

### OptimizedImage

The main component for displaying optimized images with automatic format detection.

```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

// Basic usage
<OptimizedImage
  src="/images/artwork.jpg"
  alt="Street art mural"
/>

// Hero image with high priority (for above-the-fold images)
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero banner"
  priority="high"
  sizes="100vw"
/>

// Responsive image with max width
<OptimizedImage
  src="/images/gallery/photo.jpg"
  alt="Gallery photo"
  sizes="(max-width: 768px) 100vw, 50vw"
  maxWidth={800}
/>
```

### LazyImage

Lower-level component with lazy loading and modern format support.

```tsx
import { LazyImage } from '@/components/LazyImage';

<LazyImage
  src="/images/photo.jpg"
  alt="Photo description"
  optimized={true}
  fetchPriority="high"
/>
```

## Image Formats

The system automatically generates and serves images in the following order:

1. **AVIF** - Best compression (~50% smaller than JPEG)
2. **WebP** - Good compression (~30% smaller than JPEG) 
3. **Original** - Fallback for older browsers

## File Structure

For local images, create your images in multiple formats:

```
public/images/
├── hero.avif          # AVIF version (best)
├── hero.webp          # WebP version (good)
└── hero.jpg           # Original (fallback)
```

The system will automatically detect and use the best format supported by the browser.

## Converting Images

### Using Online Tools

1. **AVIF**: https://avif.io/
2. **WebP**: https://developers.google.com/speed/webp/docs/using

### Using Command Line

```bash
# Install tools
brew install webp

# Convert to WebP
cwebp -q 80 input.jpg -o output.webp

# Convert to AVIF (requires avifenc)
avifenc -s 8 input.jpg output.avif
```

### Batch Conversion Script

```bash
#!/bin/bash
# Convert all JPG/PNG images in a directory to WebP and AVIF

for img in *.{jpg,jpeg,png}; do
  if [ -f "$img" ]; then
    base="${img%.*}"
    
    # Generate WebP
    cwebp -q 80 "$img" -o "${base}.webp"
    
    # Generate AVIF
    avifenc -s 8 "$img" "${base}.avif"
    
    echo "Converted: $img"
  fi
done
```

## Performance Best Practices

### 1. Image Sizing

Always specify appropriate sizes for responsive images:

```tsx
<OptimizedImage
  src="/large-image.jpg"
  alt="Large image"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
  maxWidth={800}
/>
```

### 2. Priority Loading

Use `priority="high"` for above-the-fold images to optimize LCP:

```tsx
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  priority="high"
  sizes="100vw"
/>
```

### 3. Lazy Loading

Images are lazy-loaded by default with a 50px margin. This is optimal for most cases.

### 4. External Images

For external images (from database/API), consider using an image CDN or the edge function:

```tsx
const optimizedUrl = `${supabase.functions.url}/optimize-image?url=${encodeURIComponent(imageUrl)}&format=webp&quality=80`;

<OptimizedImage
  src={optimizedUrl}
  alt="External image"
/>
```

## Edge Function Optimization

Use the `optimize-image` edge function for dynamic image optimization:

```typescript
// JavaScript/TypeScript
const optimizedUrl = new URL(`${SUPABASE_URL}/functions/v1/optimize-image`);
optimizedUrl.searchParams.set('url', imageUrl);
optimizedUrl.searchParams.set('format', 'webp');
optimizedUrl.searchParams.set('quality', '80');
optimizedUrl.searchParams.set('width', '800');

<img src={optimizedUrl.toString()} alt="Optimized" />
```

### Rate Limits

- **30 requests per minute** per IP
- **60 second block** if exceeded
- Responses are cached for 1 year

## Browser Support

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| AVIF   | 85+    | 93+     | 16+    | 85+  |
| WebP   | 23+    | 65+     | 14+    | 18+  |

The system automatically falls back to the original format for older browsers.

## Monitoring

Check format support in browser console:

```javascript
import { supportsImageFormat, getBestSupportedFormat } from '@/lib/images/optimization';

// Check specific format
const supportsAVIF = await supportsImageFormat('avif');
const supportsWebP = await supportsImageFormat('webp');

// Get best format
const bestFormat = await getBestSupportedFormat();
console.log('Best format:', bestFormat); // 'avif', 'webp', or null
```

## Checklist

- [ ] Convert all static images to WebP and AVIF
- [ ] Use `OptimizedImage` for all image components
- [ ] Specify `priority="high"` for hero/LCP images
- [ ] Configure appropriate `sizes` for responsive images
- [ ] Test images in different browsers
- [ ] Monitor Core Web Vitals (LCP should improve)
- [ ] Set up image CDN for production (optional)

## Future Improvements

Consider integrating with image CDN services:
- **Cloudinary** - Advanced transformations
- **imgix** - Real-time optimization
- **Cloudflare Images** - Edge-optimized delivery
