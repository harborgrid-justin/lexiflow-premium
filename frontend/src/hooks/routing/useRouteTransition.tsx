/**
 * Route Transition Hook
 *
 * Provides smooth transition effects between routes with:
 * - Fade transitions
 * - Slide transitions
 * - Scale transitions
 * - Custom transition configurations
 *
 * @module hooks/routing/useRouteTransition
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigation } from 'react-router';

export type TransitionType = 'fade' | 'slide' | 'scale' | 'none';
export type TransitionDirection = 'forward' | 'backward';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // milliseconds
  easing: string;
  direction?: TransitionDirection;
}

const DEFAULT_CONFIG: TransitionConfig = {
  type: 'fade',
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export interface RouteTransitionState {
  isTransitioning: boolean;
  transitionStage: 'entering' | 'entered' | 'exiting' | 'exited';
  transitionClass: string;
  config: TransitionConfig;
}

/**
 * Hook for managing route transitions
 */
export function useRouteTransition(
  config: Partial<TransitionConfig> = {}
): RouteTransitionState {
  const location = useLocation();
  const navigation = useNavigation();
  const [transitionStage, setTransitionStage] = useState<
    'entering' | 'entered' | 'exiting' | 'exited'
  >('entered');
  const previousLocation = useRef(location.pathname);
  const transitionTimer = useRef<number>();
  const isNavigating = navigation.state !== 'idle';

  // Apply configuration with navigation state awareness
  const fullConfig: TransitionConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
    // Reduce duration when actively navigating to improve perceived performance
    duration: isNavigating && config?.duration ? config.duration * 0.7 : (config?.duration || DEFAULT_CONFIG.duration),
  }), [config, isNavigating]);

  useEffect(() => {
    if (location.pathname !== previousLocation.current) {
      // Start exit transition
      setTransitionStage('exiting');

      // After exit animation completes, mark as exited
      transitionTimer.current = window.setTimeout(() => {
        setTransitionStage('exited');
        previousLocation.current = location.pathname;

        // Start enter transition
        setTransitionStage('entering');

        // After enter animation completes, mark as entered
        transitionTimer.current = window.setTimeout(() => {
          setTransitionStage('entered');
        }, fullConfig.duration);
      }, fullConfig.duration);
    }

    return () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, [location.pathname, fullConfig.duration]);

  const transitionClass = getTransitionClass(transitionStage, fullConfig);
  const isTransitioning = transitionStage === 'entering' || transitionStage === 'exiting';

  return {
    isTransitioning,
    transitionStage,
    transitionClass,
    config: fullConfig,
  };
}

/**
 * Get CSS class for current transition stage
 */
function getTransitionClass(
  stage: 'entering' | 'entered' | 'exiting' | 'exited',
  config: TransitionConfig
): string {
  const baseClass = 'route-transition';
  const typeClass = `route-transition--${config.type}`;
  const stageClass = `route-transition--${stage}`;

  return `${baseClass} ${typeClass} ${stageClass}`;
}

/**
 * Generate CSS for transitions
 */
export function generateTransitionCSS(config: TransitionConfig): string {
  const { type, duration, easing } = config;

  const baseStyles = `
    .route-transition {
      transition-duration: ${duration}ms;
      transition-timing-function: ${easing};
    }
  `;

  switch (type) {
    case 'fade':
      return `
        ${baseStyles}
        .route-transition--fade {
          transition-property: opacity;
        }
        .route-transition--fade.route-transition--entering {
          opacity: 0;
        }
        .route-transition--fade.route-transition--entered {
          opacity: 1;
        }
        .route-transition--fade.route-transition--exiting {
          opacity: 1;
        }
        .route-transition--fade.route-transition--exited {
          opacity: 0;
        }
      `;

    case 'slide':
      return `
        ${baseStyles}
        .route-transition--slide {
          transition-property: transform, opacity;
        }
        .route-transition--slide.route-transition--entering {
          transform: translateX(100%);
          opacity: 0;
        }
        .route-transition--slide.route-transition--entered {
          transform: translateX(0);
          opacity: 1;
        }
        .route-transition--slide.route-transition--exiting {
          transform: translateX(0);
          opacity: 1;
        }
        .route-transition--slide.route-transition--exited {
          transform: translateX(-100%);
          opacity: 0;
        }
      `;

    case 'scale':
      return `
        ${baseStyles}
        .route-transition--scale {
          transition-property: transform, opacity;
          transform-origin: center;
        }
        .route-transition--scale.route-transition--entering {
          transform: scale(0.95);
          opacity: 0;
        }
        .route-transition--scale.route-transition--entered {
          transform: scale(1);
          opacity: 1;
        }
        .route-transition--scale.route-transition--exiting {
          transform: scale(1);
          opacity: 1;
        }
        .route-transition--scale.route-transition--exited {
          transform: scale(1.05);
          opacity: 0;
        }
      `;

    default:
      return '';
  }
}

/**
 * Route Transition Wrapper Component
 */
export function RouteTransitionWrapper({
  children,
  config,
}: {
  children: React.ReactNode;
  config?: Partial<TransitionConfig>;
}) {
  const { transitionClass } = useRouteTransition(config);

  return (
    <div className={transitionClass}>
      {children}
    </div>
  );
}
