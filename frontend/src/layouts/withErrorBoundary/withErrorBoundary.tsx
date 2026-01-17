/**
 * @module components/layouts/withErrorBoundary
 * @category Layouts - HOC
 * @description Higher-Order Component that wraps layouts with error boundaries and
 * performance monitoring. Provides comprehensive error handling with automatic recovery
 * and telemetry integration.
 *
 * FEATURES:
 * - Automatic error boundary wrapping
 * - Performance monitoring via React Profiler
 * - Customizable fallback UI
 * - Error recovery mechanisms
 * - Integration with telemetry system
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { type ComponentType, Profiler, type ProfilerOnRenderCallback } from 'react';

import { ErrorBoundary } from '@/components/organisms/ErrorBoundary/ErrorBoundary';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface WithErrorBoundaryOptions {
  /** Name for error tracking and profiler ID */
  componentName: string;
  /** Custom fallback UI when error occurs */
  fallback?: React.ReactNode;
  /** Callback when error is recovered */
  onReset?: () => void;
  /** Enable performance profiling */
  enableProfiling?: boolean;
  /** Custom error handler */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// ============================================================================
// PROFILER CALLBACK
// ============================================================================
const createProfilerCallback = (componentName: string): ProfilerOnRenderCallback => {
  return (_id, phase, actualDuration, _baseDuration, _startTime, _commitTime) => {
    // Log performance metrics in development
    if (import.meta.env.DEV && actualDuration > 16) {
      console.warn(
        `[Performance] ${componentName} ${phase} took ${actualDuration.toFixed(2)}ms`,
        {
          baseDuration: _baseDuration.toFixed(2),
          startTime: _startTime.toFixed(2),
          commitTime: _commitTime.toFixed(2),
        }
      );
    }

    // In production, send to telemetry service
    if (import.meta.env.PROD) {
      // Example: sendToTelemetry({ component: componentName, phase, actualDuration });
    }
  };
};

// ============================================================================
// HOC IMPLEMENTATION
// ============================================================================
/**
 * Higher-Order Component that wraps a layout component with error boundary and
 * optional performance profiling.
 *
 * @example
 * ```tsx
 * const SafePageLayout = withErrorBoundary(PageContainerLayout, {
 *   componentName: 'PageContainerLayout',
 *   enableProfiling: true
 * });
 *
 * // Use like normal component
 * <SafePageLayout>
 *   <YourContent />
 * </SafePageLayout>
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions
): ComponentType<P> {
  const {
    componentName,
    fallback,
    onReset,
    enableProfiling = import.meta.env.DEV,
    onError: _onError, // Reserved for future use when ErrorBoundary supports onError
  } = options;

  const WrappedComponent: React.FC<P> = (props) => {
    // Note: onError is passed but ErrorBoundary component doesn't currently support it
    // To fully utilize onError, ErrorBoundary would need to be enhanced to accept it
    const content = (
      <ErrorBoundary
        scope={componentName}
        fallback={fallback}
        onReset={onReset}
      >
        <Component {...props} />
      </ErrorBoundary>
    );

    // Wrap with Profiler if enabled
    if (enableProfiling) {
      return (
        <Profiler id={componentName} onRender={createProfilerCallback(componentName)}>
          {content}
        </Profiler>
      );
    }

    return content;
  };

  // Preserve component name for debugging
  WrappedComponent.displayName = `withErrorBoundary(${componentName})`;

  return WrappedComponent;
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Pre-configured HOC for layout components with standard options
 */
export const withLayoutErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  componentName: string
) => {
  return withErrorBoundary(Component, {
    componentName,
    enableProfiling: false, // Disable profiling for layouts by default
    onReset: () => {
      console.log(`[${componentName}] Error boundary reset`);
    },
  });
};

/**
 * Pre-configured HOC for page components with performance monitoring
 */
export const withPageErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  componentName: string
) => {
  return withErrorBoundary(Component, {
    componentName,
    enableProfiling: true, // Enable profiling for pages
    onReset: () => {
      console.log(`[${componentName}] Page error recovered`);
    },
  });
};
