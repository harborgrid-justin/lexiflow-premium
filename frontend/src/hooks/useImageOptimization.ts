/**
 * @module hooks/useImageOptimization
 * @category Hooks - Performance
 *
 * Image loading and optimization hooks for better performance.
 * Includes lazy loading, progressive loading, responsive images, and format detection.
 *
 * @example
 * ```tsx
 * function ImageGallery({ images }: Props) {
 *   const { src, isLoading, error } = useProgressiveImage(
 *     images.thumbnail,
 *     images.full
 *   );
 *
 *   return (
 *     <img
 *       src={src}
 *       className={isLoading ? 'loading' : 'loaded'}
 *       alt="Gallery item"
 *     />
 *   );
 * }
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { IMAGE_OPTIMIZATION_DEFAULT_WIDTH, IMAGE_OPTIMIZATION_DEFAULT_HEIGHT } from '@/config/features/hooks.config';

/**
 * Image loading state
 */
export interface ImageLoadState {
  /** Current image source */
  src: string;
  /** Loading state */
  isLoading: boolean;
  /** Error if loading failed */
  error: Error | null;
  /** Load progress (0-100) */
  progress: number;
}

/**
 * Responsive image source
 */
export interface ResponsiveSource {
  /** Image URL */
  src: string;
  /** Media query condition */
  media?: string;
  /** Image width */
  width?: number;
  /** Pixel density */
  density?: number;
}

/**
 * Progressive image loading hook
 *
 * Loads low-quality placeholder first, then high-quality image.
 * Provides smooth loading experience.
 *
 * @param placeholderSrc - Low quality placeholder image
 * @param fullSrc - Full quality image
 * @param options - Loading options
 * @returns Image load state
 *
 * @example
 * ```tsx
 * function ProfilePicture({ user }: Props) {
 *   const { src, isLoading } = useProgressiveImage(
 *     user.avatarThumbnail, // 50x50 preview
 *     user.avatarFull,      // 400x400 full
 *     { crossOrigin: 'anonymous' }
 *   );
 *
 *   return (
 *     <div className="avatar">
 *       <img
 *         src={src}
 *         alt={user.name}
 *         className={isLoading ? 'blur' : ''}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useProgressiveImage(
  placeholderSrc: string,
  fullSrc: string,
  options: {
    crossOrigin?: 'anonymous' | 'use-credentials';
    onLoad?: () => void;
    onError?: (error: Error) => void;
  } = {},
): ImageLoadState {
  const [src, setSrc] = useState(placeholderSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const img = new Image();

    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin;
    }

    // Start with placeholder
    setSrc(placeholderSrc);
    setProgress(10);

    // Load full image
    img.onload = () => {
      setSrc(fullSrc);
      setIsLoading(false);
      setProgress(100);
      options.onLoad?.();
    };

    img.onerror = () => {
      const err = new Error('Failed to load image');
      setError(err);
      setIsLoading(false);
      options.onError?.(err);
    };

    setProgress(50);
    img.src = fullSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [placeholderSrc, fullSrc, options]);

  return { src, isLoading, error, progress };
}

/**
 * Lazy image loading hook
 *
 * Loads image only when it enters viewport using Intersection Observer.
 * Reduces initial page load and bandwidth usage.
 *
 * @param src - Image source URL
 * @param options - Loading options
 * @returns Load state and ref to attach to img element
 *
 * @example
 * ```tsx
 * function LazyImage({ src, alt }: Props) {
 *   const { imageSrc, ref, isLoading } = useLazyImage(src, {
 *     threshold: 0.1,
 *     rootMargin: '50px',
 *   });
 *
 *   return (
 *     <img
 *       ref={ref}
 *       src={imageSrc || placeholderDataUrl}
 *       alt={alt}
 *       loading="lazy"
 *     />
 *   );
 * }
 * ```
 */
export function useLazyImage(
  src: string,
  options: {
    threshold?: number;
    rootMargin?: string;
    placeholder?: string;
  } = {},
): {
  imageSrc: string | null;
  ref: React.RefObject<HTMLImageElement>;
  isLoading: boolean;
  error: Error | null;
} {
  const { threshold = 0.1, rootMargin = '50px', placeholder } = options;

  const [imageSrc, setImageSrc] = useState<string | null>(placeholder || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsLoading(true);

          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
          };
          img.onerror = () => {
            setError(new Error('Failed to load image'));
            setIsLoading(false);
          };
          img.src = src;

          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(imgElement);

    return () => {
      observer.disconnect();
    };
  }, [src, threshold, rootMargin]);

  return { imageSrc, ref: imgRef as React.RefObject<HTMLImageElement>, isLoading, error };
}

/**
 * Responsive image hook
 *
 * Selects appropriate image source based on viewport size and pixel density.
 * Optimizes bandwidth and loading performance.
 *
 * @param sources - Array of responsive image sources
 * @param fallback - Fallback image source
 * @returns Optimal image source
 *
 * @example
 * ```tsx
 * function ResponsiveImage() {
 *   const src = useResponsiveImage([
 *     { src: '/image-400.jpg', width: 400 },
 *     { src: '/image-800.jpg', width: 800 },
 *     { src: '/image-1200.jpg', width: 1200 },
 *     { src: '/image-800@2x.jpg', width: 800, density: 2 },
 *   ], '/image-400.jpg');
 *
 *   return <img src={src} alt="Responsive" />;
 * }
 * ```
 */
export function useResponsiveImage(
  sources: ResponsiveSource[],
  fallback: string,
): string {
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    const updateSource = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const viewportWidth = window.innerWidth;

      // Find best match
      let bestMatch = sources.find(source => {
        // Check media query
        if (source.media && !window.matchMedia(source.media).matches) {
          return false;
        }

        // Check density
        if (source.density && source.density !== devicePixelRatio) {
          return false;
        }

        // Check width
        if (source.width && source.width < viewportWidth) {
          return false;
        }

        return true;
      });

      // Fallback to smallest source if no match
      if (!bestMatch) {
        bestMatch = sources.reduce((prev, curr) =>
          (curr.width || 0) < (prev.width || 0) ? curr : prev
        );
      }

      setSrc(bestMatch?.src || fallback);
    };

    updateSource();

    window.addEventListener('resize', updateSource);
    return () => window.removeEventListener('resize', updateSource);
  }, [sources, fallback]);

  return src;
}

/**
 * Image preload hook
 *
 * Preloads images in the background for smoother UX.
 * Useful for image carousels, galleries, and next page prefetching.
 *
 * @param urls - Array of image URLs to preload
 * @returns Preload state
 *
 * @example
 * ```tsx
 * function ImageCarousel({ images }: Props) {
 *   const [currentIndex, setCurrentIndex] = useState(0);
 *
 *   // Preload next 3 images
 *   const nextImages = images
 *     .slice(currentIndex + 1, currentIndex + 4)
 *     .map(img => img.url);
 *
 *   const { progress, loaded } = useImagePreload(nextImages);
 *
 *   return (
 *     <div>
 *       <img src={images[currentIndex].url} />
 *       <div>Prefetch: {progress}%</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useImagePreload(
  urls: string[],
): {
  progress: number;
  loaded: number;
  total: number;
  isComplete: boolean;
} {
  const [loaded, setLoaded] = useState(0);
  const [total] = useState(urls.length);

  useEffect(() => {
    if (urls.length === 0) return;

    let loadedCount = 0;

    const promises = urls.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoaded(loadedCount);
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          setLoaded(loadedCount);
          resolve(); // Still resolve to not block other images
        };
        img.src = url;
      });
    });

    void Promise.all(promises);
  }, [urls]);

  return {
    progress: total > 0 ? (loaded / total) * 100 : 0,
    loaded,
    total,
    isComplete: loaded === total,
  };
}

/**
 * Image format detection hook
 *
 * Detects browser support for modern image formats (WebP, AVIF)
 * and returns appropriate source.
 *
 * @param sources - Image sources in different formats
 * @returns Best supported image source
 *
 * @example
 * ```tsx
 * function OptimizedImage() {
 *   const src = useImageFormat({
 *     avif: '/image.avif',   // Best quality, smallest size
 *     webp: '/image.webp',   // Good quality, small size
 *     jpeg: '/image.jpg',    // Fallback
 *   });
 *
 *   return <img src={src} alt="Optimized" />;
 * }
 * ```
 */
export function useImageFormat(sources: {
  avif?: string;
  webp?: string;
  jpeg?: string;
  png?: string;
}): string {
  const [src, setSrc] = useState(sources.jpeg || sources.png || '');

  useEffect(() => {
    const checkFormat = async () => {
      // Check AVIF support
      if (sources.avif && (await supportsFormat('image/avif'))) {
        setSrc(sources.avif);
        return;
      }

      // Check WebP support
      if (sources.webp && (await supportsFormat('image/webp'))) {
        setSrc(sources.webp);
        return;
      }

      // Fallback
      setSrc(sources.jpeg || sources.png || '');
    };

    void checkFormat();
  }, [sources]);

  return src;
}

/**
 * Blurhash placeholder hook
 *
 * Generates blurhash placeholder for smooth image loading.
 * Requires blurhash library.
 *
 * @param hash - Blurhash string
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @returns Data URL for placeholder
 */
export function useBlurhashPlaceholder(
  hash: string | undefined,
  width: number = IMAGE_OPTIMIZATION_DEFAULT_WIDTH,
  height: number = IMAGE_OPTIMIZATION_DEFAULT_HEIGHT,
): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) return;

    try {
      // Note: This would require blurhash library
      // For now, returning a simple gradient placeholder
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        setDataUrl(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Failed to generate blurhash:', error);
    }
  }, [hash, width, height]);

  return dataUrl;
}

/**
 * Optimized image component props hook
 *
 * Generates optimized props for img element including srcset, sizes, and loading.
 *
 * @param src - Base image source
 * @param options - Optimization options
 * @returns Optimized img props
 */
export function useOptimizedImageProps(
  src: string,
  options: {
    widths?: number[];
    sizes?: string;
    lazy?: boolean;
    aspectRatio?: number;
  } = {},
): React.ImgHTMLAttributes<HTMLImageElement> {
  const {
    widths = [400, 800, 1200, 1600],
    sizes = '100vw',
    lazy = true,
    aspectRatio,
  } = options;

  const generateSrcSet = useCallback(() => {
    return widths
      .map(width => `${src}?w=${width} ${width}w`)
      .join(', ');
  }, [src, widths]);

  const props: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    srcSet: generateSrcSet(),
    sizes,
    loading: lazy ? 'lazy' : 'eager',
    decoding: 'async',
  };

  if (aspectRatio) {
    props.style = {
      aspectRatio: aspectRatio.toString(),
      objectFit: 'cover',
    };
  }

  return props;
}

// Helper function to check image format support
async function supportsFormat(mimeType: string): Promise<boolean> {
  if (!('createImageBitmap' in window)) {
    return false;
  }

  const testImage = `data:${mimeType};base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=`;

  try {
    const blob = await fetch(testImage).then(r => r.blob());
    await createImageBitmap(blob);
    return true;
  } catch (error) {
    console.error('Image format support check failed:', error);
    return false;
  }
}