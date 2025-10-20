/**
 * Image optimization utilities for WebP/AVIF formats
 * Provides helpers for generating optimized image URLs and detecting format support
 */

/**
 * Supported modern image formats in order of preference
 */
export const MODERN_FORMATS = ['avif', 'webp'] as const;
export type ModernFormat = typeof MODERN_FORMATS[number];

/**
 * Check if browser supports a specific image format
 */
export const supportsImageFormat = async (format: ModernFormat): Promise<boolean> => {
  // Check if already cached
  const cacheKey = `image-format-${format}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached !== null) {
    return cached === 'true';
  }

  // Test format support
  const testImages = {
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    webp: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
  };

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const supported = img.width > 0 && img.height > 0;
      sessionStorage.setItem(cacheKey, String(supported));
      resolve(supported);
    };
    img.onerror = () => {
      sessionStorage.setItem(cacheKey, 'false');
      resolve(false);
    };
    img.src = testImages[format];
  });
};

/**
 * Get the best supported image format for the browser
 */
export const getBestSupportedFormat = async (): Promise<ModernFormat | null> => {
  for (const format of MODERN_FORMATS) {
    if (await supportsImageFormat(format)) {
      return format;
    }
  }
  return null;
};

/**
 * Generate optimized image URL variants for different formats
 * For external URLs, returns the original URL with format conversion if available
 * For local images, generates the expected path for pre-converted images
 */
export const generateImageVariants = (src: string): {
  avif?: string;
  webp?: string;
  original: string;
} => {
  if (!src) {
    return { original: src };
  }

  // If it's an external URL, return as-is (could be enhanced with image CDN)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return { original: src };
  }

  // For local images, generate variant paths
  const extension = src.substring(src.lastIndexOf('.'));
  const basePath = src.substring(0, src.lastIndexOf('.'));

  return {
    avif: `${basePath}.avif`,
    webp: `${basePath}.webp`,
    original: src,
  };
};

/**
 * Get responsive image srcset for different sizes
 */
export const generateSrcSet = (src: string, sizes: number[]): string => {
  if (!src || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  const extension = src.substring(src.lastIndexOf('.'));
  const basePath = src.substring(0, src.lastIndexOf('.'));

  return sizes
    .map((size) => `${basePath}-${size}w${extension} ${size}w`)
    .join(', ');
};

/**
 * Calculate optimal image sizes based on viewport
 */
export const getImageSizes = (
  maxWidth?: number,
  breakpoints: { [key: string]: number } = {}
): string => {
  const defaultBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    ...breakpoints,
  };

  if (!maxWidth) {
    return '100vw';
  }

  const entries = Object.entries(defaultBreakpoints)
    .sort(([, a], [, b]) => b - a)
    .map(([, width]) => {
      const imageSize = Math.min(maxWidth, width);
      return `(max-width: ${width}px) ${imageSize}px`;
    });

  return [...entries, `${maxWidth}px`].join(', ');
};

/**
 * Preload critical images with modern formats
 */
export const preloadImage = (
  src: string,
  options: {
    as?: 'image';
    type?: string;
    fetchPriority?: 'high' | 'low' | 'auto';
  } = {}
) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = options.as || 'image';
  link.href = src;
  
  if (options.type) {
    link.type = options.type;
  }
  
  if (options.fetchPriority) {
    link.setAttribute('fetchpriority', options.fetchPriority);
  }

  document.head.appendChild(link);
};

/**
 * Get MIME type for image format
 */
export const getMimeType = (format: ModernFormat | 'jpg' | 'jpeg' | 'png'): string => {
  const mimeTypes: Record<string, string> = {
    avif: 'image/avif',
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  return mimeTypes[format] || 'image/jpeg';
};
