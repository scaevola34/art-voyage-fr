import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { generateImageVariants, getMimeType } from '@/lib/images/optimization';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  /**
   * Enable modern image format optimization (WebP/AVIF)
   * @default true
   */
  optimized?: boolean;
  /**
   * Responsive image sizes for srcset
   */
  sizes?: string;
  /**
   * Image loading priority
   */
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Lazy-loaded image component with intersection observer and modern format support
 * Improves page load performance and SEO by deferring off-screen images
 * Supports WebP/AVIF with automatic fallback to original format
 */
export const LazyImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  optimized = true,
  sizes,
  fetchPriority,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const pictureRef = useRef<HTMLPictureElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = pictureRef.current || imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading slightly before visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Generate optimized variants if enabled
  const variants = optimized ? generateImageVariants(src) : { original: src };
  const shouldUsePicture = optimized && (variants.avif || variants.webp);

  if (shouldUsePicture) {
    return (
      <div className="relative">
        {/* Placeholder */}
        {!isLoaded && (
          <div
            className={cn(
              'absolute inset-0 bg-muted animate-pulse',
              placeholderClassName
            )}
            aria-hidden="true"
          />
        )}

        {/* Picture element with modern format support */}
        <picture ref={pictureRef}>
          {/* AVIF source (best compression) */}
          {variants.avif && isInView && (
            <source
              srcSet={variants.avif}
              type={getMimeType('avif')}
              sizes={sizes}
            />
          )}

          {/* WebP source (good compression, wider support) */}
          {variants.webp && isInView && (
            <source
              srcSet={variants.webp}
              type={getMimeType('webp')}
              sizes={sizes}
            />
          )}

          {/* Fallback to original format */}
          <img
            ref={imgRef}
            src={isInView ? variants.original : undefined}
            alt={alt}
            loading="lazy"
            decoding="async"
            fetchPriority={fetchPriority}
            sizes={sizes}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
            onLoad={() => setIsLoaded(true)}
            {...props}
          />
        </picture>
      </div>
    );
  }

  // Fallback to simple img tag if optimization is disabled
  return (
    <div className="relative">
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            placeholderClassName
          )}
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        fetchPriority={fetchPriority}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};
