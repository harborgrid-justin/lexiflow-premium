/**
 * RouteTransition.tsx
 * Page transition animations for route changes
 * Supports multiple transition types and customization
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// ============================================================================
// Types
// ============================================================================

export type TransitionType =
  | 'fade'
  | 'slide'
  | 'slideUp'
  | 'slideDown'
  | 'zoom'
  | 'flip'
  | 'none';

export interface RouteTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  enabled?: boolean;
}

// ============================================================================
// RouteTransition Component
// ============================================================================

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  enabled = true,
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (!enabled) {
      setDisplayLocation(location);
      return;
    }

    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exit');
    }
  }, [location, displayLocation, enabled]);

  useEffect(() => {
    if (!enabled) return;

    if (transitionStage === 'exit') {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [transitionStage, location, duration, enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  const style = getTransitionStyle(type, transitionStage, duration, delay);

  return (
    <div style={style} key={displayLocation.pathname}>
      {children}
    </div>
  );
};

// ============================================================================
// Transition Styles
// ============================================================================

function getTransitionStyle(
  type: TransitionType,
  stage: 'enter' | 'exit',
  duration: number,
  delay: number
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    transition: `all ${duration}ms ease-in-out ${delay}ms`,
  };

  const transitions: Record<TransitionType, Record<'enter' | 'exit', React.CSSProperties>> = {
    none: {
      enter: {},
      exit: {},
    },
    fade: {
      enter: {
        opacity: 1,
      },
      exit: {
        opacity: 0,
      },
    },
    slide: {
      enter: {
        transform: 'translateX(0)',
        opacity: 1,
      },
      exit: {
        transform: 'translateX(-100%)',
        opacity: 0,
      },
    },
    slideUp: {
      enter: {
        transform: 'translateY(0)',
        opacity: 1,
      },
      exit: {
        transform: 'translateY(-20px)',
        opacity: 0,
      },
    },
    slideDown: {
      enter: {
        transform: 'translateY(0)',
        opacity: 1,
      },
      exit: {
        transform: 'translateY(20px)',
        opacity: 0,
      },
    },
    zoom: {
      enter: {
        transform: 'scale(1)',
        opacity: 1,
      },
      exit: {
        transform: 'scale(0.95)',
        opacity: 0,
      },
    },
    flip: {
      enter: {
        transform: 'rotateY(0deg)',
        opacity: 1,
      },
      exit: {
        transform: 'rotateY(90deg)',
        opacity: 0,
      },
    },
  };

  return {
    ...baseStyle,
    ...transitions[type][stage],
  };
}

// ============================================================================
// useRouteTransition Hook
// ============================================================================

export function useRouteTransition(type: TransitionType = 'fade', duration: number = 300) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);

    const timeout = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);

    return () => clearTimeout(timeout);
  }, [location.pathname, duration]);

  return {
    isTransitioning,
    transitionStyle: getTransitionStyle(
      type,
      isTransitioning ? 'exit' : 'enter',
      duration,
      0
    ),
  };
}

// ============================================================================
// PageTransition Component (with framer-motion support)
// ============================================================================

export interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp';
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fade',
}) => {
  const location = useLocation();

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 },
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
    },
    slideUp: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
    },
  };

  // Simplified version without framer-motion
  const [style, setStyle] = useState(variants[variant].initial);

  useEffect(() => {
    setStyle(variants[variant].animate);
  }, [location.pathname, variant]);

  return (
    <div
      style={{
        ...style,
        transition: 'all 300ms ease-in-out',
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// TransitionGroup Component (for list transitions)
// ============================================================================

export interface TransitionGroupProps {
  children: ReactNode;
  duration?: number;
}

export const TransitionGroup: React.FC<TransitionGroupProps> = ({
  children,
  duration = 300,
}) => {
  return (
    <div
      style={{
        transition: `all ${duration}ms ease-in-out`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// ScrollToTop Component (scroll to top on route change)
// ============================================================================

export const ScrollToTop: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);

  return null;
};

// ============================================================================
// PreserveScroll Component (preserve scroll position)
// ============================================================================

export const PreserveScroll: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const scrollPositions = React.useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const currentPath = location.pathname;
    const savedPosition = scrollPositions.current.get(currentPath);

    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    }

    const handleScroll = () => {
      scrollPositions.current.set(currentPath, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  return <>{children}</>;
};

// ============================================================================
// RouteChangeListener Component
// ============================================================================

export interface RouteChangeListenerProps {
  onChange?: (pathname: string) => void;
  onEnter?: (pathname: string) => void;
  onLeave?: (pathname: string) => void;
}

export const RouteChangeListener: React.FC<RouteChangeListenerProps> = ({
  onChange,
  onEnter,
  onLeave,
}) => {
  const location = useLocation();
  const previousPath = React.useRef<string>();

  useEffect(() => {
    const currentPath = location.pathname;

    if (previousPath.current && previousPath.current !== currentPath) {
      onLeave?.(previousPath.current);
      onChange?.(currentPath);
    }

    onEnter?.(currentPath);
    previousPath.current = currentPath;
  }, [location.pathname, onChange, onEnter, onLeave]);

  return null;
};

export default RouteTransition;
