/**
 * LazyRoute.tsx
 * Code-split route loading with suspense and error boundaries
 * Supports preloading, retry logic, and loading states
 */

import React, { Suspense, ComponentType, lazy, ReactNode } from 'react';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';

// ============================================================================
// Types
// ============================================================================

export interface LazyRouteProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  preload?: boolean;
  retryCount?: number;
  onError?: (error: Error) => void;
  componentProps?: Record<string, any>;
}

// ============================================================================
// Retry Logic for Failed Imports
// ============================================================================

function lazyWithRetry(
  loader: () => Promise<{ default: ComponentType<any> }>,
  retryCount: number = 3
) {
  return lazy(() => {
    return new Promise<{ default: ComponentType<any> }>((resolve, reject) => {
      let attempts = 0;

      const attemptLoad = async () => {
        try {
          const module = await loader();
          resolve(module);
        } catch (error) {
          attempts++;

          if (attempts >= retryCount) {
            console.error(`Failed to load component after ${retryCount} attempts:`, error);
            reject(error);
            return;
          }

          console.warn(`Retry loading component (attempt ${attempts}/${retryCount})`);

          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
          setTimeout(attemptLoad, delay);
        }
      };

      attemptLoad();
    });
  });
}

// ============================================================================
// LazyRoute Component
// ============================================================================

export const LazyRoute: React.FC<LazyRouteProps> = ({
  loader,
  fallback,
  errorFallback,
  preload = false,
  retryCount = 3,
  onError,
  componentProps = {},
}) => {
  const LazyComponent = React.useMemo(
    () => lazyWithRetry(loader, retryCount),
    [loader, retryCount]
  );

  // Preload component on mount
  React.useEffect(() => {
    if (preload) {
      loader().catch(err => {
        console.warn('Preload failed:', err);
      });
    }
  }, [preload, loader]);

  return (
    <GlobalErrorBoundary
      fallback={errorFallback}
      onError={onError}
    >
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>
        <LazyComponent {...componentProps} />
      </Suspense>
    </GlobalErrorBoundary>
  );
};

// ============================================================================
// Default Loading Fallback
// ============================================================================

const DefaultLoadingFallback: React.FC = () => {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Loading...</p>
    </div>
  );
};

// ============================================================================
// Custom Loading Fallback with Progress
// ============================================================================

export const ProgressLoadingFallback: React.FC<{ message?: string }> = ({
  message = 'Loading component...',
}) => {
  const [dots, setDots] = React.useState('');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.progressContainer}>
      <div style={styles.progressSpinner} />
      <p style={styles.progressText}>
        {message}{dots}
      </p>
    </div>
  );
};

// ============================================================================
// Skeleton Loading Fallback
// ============================================================================

export const SkeletonLoadingFallback: React.FC = () => {
  return (
    <div style={styles.skeletonContainer}>
      <div style={{ ...styles.skeleton, height: '40px', marginBottom: '16px' }} />
      <div style={{ ...styles.skeleton, height: '200px', marginBottom: '16px' }} />
      <div style={{ ...styles.skeleton, height: '20px', width: '60%', marginBottom: '8px' }} />
      <div style={{ ...styles.skeleton, height: '20px', width: '80%', marginBottom: '8px' }} />
      <div style={{ ...styles.skeleton, height: '20px', width: '40%' }} />
    </div>
  );
};

// ============================================================================
// Preload Helper Functions
// ============================================================================

const preloadedComponents = new Map<string, Promise<{ default: ComponentType<any> }>>();

export function preloadRoute(
  key: string,
  loader: () => Promise<{ default: ComponentType<any> }>
): void {
  if (!preloadedComponents.has(key)) {
    const promise = loader();
    preloadedComponents.set(key, promise);

    promise.catch(err => {
      console.error(`Failed to preload route ${key}:`, err);
      preloadedComponents.delete(key);
    });
  }
}

export function usePreloadRoute(
  key: string,
  loader: () => Promise<{ default: ComponentType<any> }>,
  trigger: 'mount' | 'hover' | 'visible' = 'mount'
) {
  const [shouldPreload, setShouldPreload] = React.useState(trigger === 'mount');

  React.useEffect(() => {
    if (shouldPreload) {
      preloadRoute(key, loader);
    }
  }, [shouldPreload, key, loader]);

  const onMouseEnter = React.useCallback(() => {
    if (trigger === 'hover') {
      setShouldPreload(true);
    }
  }, [trigger]);

  return { onMouseEnter };
}

// ============================================================================
// LazyRouteWithPreload Component
// ============================================================================

export interface LazyRouteWithPreloadProps extends LazyRouteProps {
  routeKey: string;
  preloadTrigger?: 'mount' | 'hover' | 'visible';
}

export const LazyRouteWithPreload: React.FC<LazyRouteWithPreloadProps> = ({
  routeKey,
  preloadTrigger = 'mount',
  ...props
}) => {
  const { onMouseEnter } = usePreloadRoute(routeKey, props.loader, preloadTrigger);

  return (
    <div onMouseEnter={preloadTrigger === 'hover' ? onMouseEnter : undefined}>
      <LazyRoute {...props} />
    </div>
  );
};

// ============================================================================
// createLazyRoute Helper
// ============================================================================

export function createLazyRoute(
  loader: () => Promise<{ default: ComponentType<any> }>,
  options: Partial<LazyRouteProps> = {}
) {
  return (props: any) => (
    <LazyRoute
      loader={loader}
      {...options}
      componentProps={props}
    />
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#6b7280',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    padding: '20px',
  },
  progressSpinner: {
    width: '48px',
    height: '48px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  progressText: {
    marginTop: '20px',
    fontSize: '16px',
    color: '#4b5563',
    fontWeight: '500',
  },
  skeletonContainer: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  skeleton: {
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

// Add keyframe animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}

export default LazyRoute;
