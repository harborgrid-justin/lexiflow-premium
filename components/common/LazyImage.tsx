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

import React, { useState, useEffect, useRef, useMemo, useCallback, ImgHTMLAttributes, ReactEventHandler } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

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
function decodeBlurHash(hash: string, width: number = 32, height: number = 32): string {
  // This is a placeholder implementation
  // In production, use: import { decode } from 'blurhash';
  // const pixels = decode(hash, width, height);
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

export const LazyImage: React.FC<LazyImageProps> = ({
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
}) => {
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
    } catch (err) {
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
        onError?.(new Error(`Failed to load image after ${maxRetries} retries`));
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
      className={cn(
        "relative overflow-hidden bg-slate-100 dark:bg-slate-800",
        className
      )}
      style={paddingBottom ? { paddingBottom } : undefined}
    >
      {/* Blur Placeholder */}
      {blurPlaceholder && loadingState !== 'loaded' && (
        <img
          src={blurPlaceholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-300"
          style={{
            opacity: loadingState === 'loading' ? 0.7 : 0.5,
          }}
        />
      )}

      {/* Loading Skeleton */}
      {showSkeleton && loadingState === 'loading' && (
        <div className="absolute inset-0 animate-pulse">
          <div className={cn(
            "w-full h-full",
            theme.surface.highlight
          )} />
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
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            loadingState === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error State */}
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          <AlertCircle className={cn("h-8 w-8", theme.status.error.text)} />
          <p className={cn("text-sm text-center", theme.text.secondary)}>
            Failed to load image
          </p>
          {retryCount >= maxRetries && (
            <button
              onClick={handleRetry}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors",
                theme.surface.input,
                theme.border.default,
                "border hover:bg-slate-100 dark:hover:bg-slate-700"
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
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            theme.surface.highlight
          )}
        >
          {showSkeleton && (
            <div className="w-full h-full animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
};

export default LazyImage;
