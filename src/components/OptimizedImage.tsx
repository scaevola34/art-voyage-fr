import { LazyImage } from './LazyImage';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  /**
   * Responsive image sizes configuration
   * @example "(max-width: 768px) 100vw, 50vw"
   */
  sizes?: string;
  /**
   * Image loading priority for LCP optimization
   * Use 'high' for above-the-fold hero images
   */
  priority?: 'high' | 'low' | 'auto';
  /**
   * Maximum width for responsive images
   */
  maxWidth?: number;
  /**
   * Disable modern format optimization (WebP/AVIF)
   * @default false
   */
  disableOptimization?: boolean;
}

/**
 * Optimized image component with automatic WebP/AVIF support
 * Best practices built-in:
 * - Lazy loading by default
 * - Modern format support with fallbacks
 * - Responsive sizing
 * - Performance optimizations
 * 
 * @example
 * ```tsx
 * // Hero image with high priority
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   priority="high"
 *   sizes="100vw"
 * />
 * 
 * // Responsive gallery image
 * <OptimizedImage
 *   src="/gallery/image.jpg"
 *   alt="Gallery image"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   maxWidth={800}
 * />
 * ```
 */
export const OptimizedImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  sizes,
  priority = 'auto',
  maxWidth,
  disableOptimization = false,
  ...props
}: OptimizedImageProps) => {
  // Generate responsive sizes if maxWidth is provided
  const responsiveSizes = sizes || (maxWidth ? `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px` : undefined);

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('w-full h-auto', className)}
      placeholderClassName={placeholderClassName}
      optimized={!disableOptimization}
      sizes={responsiveSizes}
      fetchPriority={priority}
      {...props}
    />
  );
};
