import { cn } from '@/shared/lib/cn';
import { ImgHTMLAttributes, useState } from 'react';
import { Skeleton } from '../Skeleton';

export interface StableImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  width: number | string;
  height: number | string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * StableImage Component
 *
 * REQUIREMENTS ADDRESSED:
 * - ZERO LAYOUT SHIFT GUARANTEE: Images use fixed aspect ratios/dimensions
 * - DETERMINISTIC LOADING: Shows skeleton until loaded
 */
export function StableImage({
  src,
  alt,
  width,
  height,
  className,
  onLoad,
  style,
  ...props
}: StableImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Convert number to px string for style if needed,
  // but width/height generic types are usually passed to img directly or style?
  // Ideally, we force a container of that size.

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width, height, ...style }}
    >
      {!isLoaded && !hasError && (
        <Skeleton
          width="100%"
          height="100%"
          className="absolute inset-0 z-10"
        />
      )}

      <img
        src={src}
        alt={alt}
        width={width} // Pass strict dimensions to img tag as well for browser layout
        height={height}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={() => setHasError(true)}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
}
