/**
 * @module components/common/LazyImage
 * @category Common
 * @description Progressive image loading with blur-up placeholder and lazy loading.
 * 
 * FEATURES:
 * - Blurhash placeholders for instant preview
 * - Intersection Observer for lazy loading
 * - Progressive JPEG support
 * - Responsive image selection
 * - Retry mechanism for failed loads
 * - Loading skeleton with pulse animation
 */

import { useState, useEffect, useRef, useMemo, useCallback, ImgHTMLAttributes } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';
import { 
  containerStyles, 
  blurPlaceholderStyles, 
  skeletonContainerStyles, 
  skeletonInnerStyles, 
  imageStyles, 
  errorContainerStyles, 
  errorIconStyles, 
  errorTextStyles, 
  retryButtonStyles, 
  idleContainerStyles 
} from './LazyImage.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'onError'> {
  /** Image source URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Blurhash string for placeholder */
  blurHash?: string;
  /** Responsive image sources */
  srcSet?: string;
  /** Image sizes attribute */
  sizes?: string;
  /** Root margin for Intersection Observer */
  rootMargin?: string;
  /** Threshold for Intersection Observer */
  threshold?: number;
  /** Number of retry attempts on error */
  maxRetries?: number;
  /** Show loading skeleton */
  showSkeleton?: boolean;
  /** Aspect ratio (width/height) for skeleton */
  aspectRatio?: number;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: Error) => void;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Decode blurhash to data URL (simplified version)
 * In production, use the 'blurhash' npm package
 */
function decodeBlurHash(_hash: string, width: number = 32, height: number = 32): string {
  // This is a placeholder implementation
  // In production, use: import { decode } from 'blurhash';
  // const pixels = decode(_hash, width, height);
  // Then convert pixels to canvas and return as data URL

  // For now, return a simple gradient as placeholder
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Create a simple blur effect
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e2e8f0');
    gradient.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LazyImage({
  src,
  alt,
  blurHash,
  srcSet,
  sizes,
  rootMargin = '50px',
  threshold = 0.01,
  maxRetries = 3,
  showSkeleton = true,
  aspectRatio,
  onLoad,
  onError,
  className,
  ...props
}: LazyImageProps) {
  const { theme } = useTheme();
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate blur placeholder
  const blurPlaceholder = useMemo(() => {
    if (!blurHash) return null;
    try {
      return decodeBlurHash(blurHash);
    } catch (err: unknown) {
      console.warn('Failed to decode blurhash:', err);
      return null;
    }
  }, [blurHash]);

  /**
   * Load image
   */
  const loadImage = useCallback(() => {
    if (loadingState === 'loading' || loadingState === 'loaded') return;
    
    setLoadingState('loading');
    
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setLoadingState('loaded');
      onLoad?.();
    };
    
    img.onerror = () => {
      if (retryCount < maxRetries) {
        // Retry after exponential backoff
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadImage();
        }, delay);
      } else {
        setLoadingState('error');
        onError?.(new Error("Failed to load image after  retries"));
      }
    };
    
    // Start loading
    if (srcSet) {
      img.srcset = srcSet;
    }
    if (sizes) {
      img.sizes = sizes;
    }
    img.src = src;
  }, [src, srcSet, sizes, loadingState, retryCount, maxRetries, onLoad, onError]);

  /**
   * Setup Intersection Observer
   */
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && loadingState === 'idle') {
            loadImage();
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loadImage, loadingState, rootMargin, threshold]);

  /**
   * Handle manual retry
   */
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setLoadingState('idle');
    loadImage();
  }, [loadImage]);

  // Calculate padding for aspect ratio
  const paddingBottom = aspectRatio ? `${(1 / aspectRatio) * 100}%` : undefined;

  return (
    <div
      className={cn(containerStyles, className)}
      style={paddingBottom ? { paddingBottom } : undefined}
    >
      {/* Blur Placeholder */}
      {blurPlaceholder && loadingState !== 'loaded' && (
        <img
          src={blurPlaceholder}
          alt=""
          aria-hidden="true"
          className={blurPlaceholderStyles}
          style={{
            opacity: loadingState === 'loading' ? 0.7 : 0.5,
          }}
        />
      )}

      {/* Loading Skeleton */}
      {showSkeleton && loadingState === 'loading' && (
        <div className={skeletonContainerStyles}>
          <div className={cn(skeletonInnerStyles, theme.surface.highlight)} />
        </div>
      )}

      {/* Actual Image */}
      {imageSrc && loadingState === 'loaded' && (
        <img
          ref={imgRef}
          src={imageSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={imageStyles(loadingState === 'loaded')}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error State */}
      {loadingState === 'error' && (
        <div className={errorContainerStyles}>
          <AlertCircle className={cn(errorIconStyles, theme.status.error.text)} />
          <p className={cn(errorTextStyles, theme.text.secondary)}>
            Failed to load image
          </p>
          {retryCount >= maxRetries && (
            <button
              onClick={handleRetry}
              className={cn(
                retryButtonStyles,
                theme.surface.input,
                theme.border.default
              )}
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading Indicator (Placeholder) */}
      {loadingState === 'idle' && (
        <div
          ref={imgRef}
          className={cn(idleContainerStyles, theme.surface.highlight)}
        >
          {showSkeleton && (
            <div className="w-full h-full animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
}

export default LazyImage;
