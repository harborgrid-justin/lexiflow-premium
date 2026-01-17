/**
 * @module hooks/useElasticScroll
 * @category Hooks - Scroll
 *
 * Physics-based elastic scrolling with momentum and boundaries.
 * Provides smooth anchor navigation and scroll shadows.
 *
 * @example
 * ```tsx
 * const {
 *   scrollState,
 *   scrollToAnchor,
 *   containerRef,
 *   topShadowStyle,
 *   bottomShadowStyle
 * } = useElasticScroll({
 *   friction: 0.9,
 *   elasticity: 0.4,
 *   showShadows: true
 * });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

import type React from "react";

/**
 * Scroll physics configuration
 */
export interface ElasticScrollConfig {
  friction?: number; // 0-1, higher = more friction (0.95 = light, 0.85 = heavy)
  elasticity?: number; // Elastic bounce at boundaries (0.3 = subtle, 0.6 = bouncy)
  minVelocity?: number; // Minimum velocity to continue momentum
  maxVelocity?: number; // Maximum velocity cap
  scrollPadding?: number; // Padding when scrolling to anchors
  snapToAnchors?: boolean; // Snap to anchor points
  showShadows?: boolean; // Show scroll shadows at boundaries
}

/**
 * Scroll state
 */
export interface ScrollState {
  position: number;
  velocity: number;
  isScrolling: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;
  progress: number; // 0-1
}

/**
 * Hook return type
 */
export interface UseElasticScrollReturn {
  scrollState: ScrollState;
  scrollTo: (position: number, smooth?: boolean) => void;
  scrollToAnchor: (anchorId: string, smooth?: boolean) => void;
  scrollBy: (delta: number) => void;
  resetScroll: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  topShadowStyle: React.CSSProperties;
  bottomShadowStyle: React.CSSProperties;
}

/**
 * Elastic Scroll Hook
 *
 * Provides physics-based scrolling with:
 * - Momentum and friction
 * - Elastic boundaries
 * - Smooth anchor navigation
 * - Scroll shadows
 * - Progress tracking
 *
 * @example
 * ```tsx
 * const {
 *   scrollState,
 *   scrollToAnchor,
 *   containerRef,
 *   topShadowStyle,
 *   bottomShadowStyle
 * } = useElasticScroll({
 *   friction: 0.9,
 *   elasticity: 0.4,
 *   showShadows: true
 * });
 *
 * return (
 *   <div style={{ position: 'relative' }}>
 *     <div style={topShadowStyle} />
 *     <div ref={containerRef}>
 *       {content}
 *     </div>
 *     <div style={bottomShadowStyle} />
 *   </div>
 * );
 * ```
 */
export function useElasticScroll(
  config: ElasticScrollConfig = {}
): UseElasticScrollReturn {
  const {
    friction = 0.92,
    elasticity = 0.4,
    minVelocity = 0.1,
    maxVelocity = 50,
    scrollPadding = 20,
    snapToAnchors: _snapToAnchors = false,
    showShadows = true,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const velocityRef = useRef(0);
  const lastTouchRef = useRef<{ y: number; time: number } | null>(null);
  const isMomentumScrolling = useRef(false);

  const [scrollState, setScrollState] = useState<ScrollState>({
    position: 0,
    velocity: 0,
    isScrolling: false,
    isAtTop: true,
    isAtBottom: false,
    progress: 0,
  });

  /**
   * Calculate scroll boundaries
   */
  const getScrollBounds = useCallback(() => {
    if (!containerRef.current) return { min: 0, max: 0, height: 0 };

    const element = containerRef.current;
    const maxScroll = element.scrollHeight - element.clientHeight;

    return {
      min: 0,
      max: Math.max(0, maxScroll),
      height: element.clientHeight,
    };
  }, []);

  /**
   * Apply elastic bounce at boundaries
   */
  const applyElasticity = useCallback(
    (position: number): number => {
      const bounds = getScrollBounds();

      if (position < bounds.min) {
        // Bounce at top
        const overflow = bounds.min - position;
        return bounds.min - overflow * elasticity;
      }

      if (position > bounds.max) {
        // Bounce at bottom
        const overflow = position - bounds.max;
        return bounds.max + overflow * elasticity;
      }

      return position;
    },
    [getScrollBounds, elasticity]
  );

  /**
   * Update scroll position with physics
   */
  const updateScroll = useCallback(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    const bounds = getScrollBounds();
    let currentVelocity = velocityRef.current;

    // Apply friction
    currentVelocity *= friction;

    // Stop if velocity too low
    if (Math.abs(currentVelocity) < minVelocity) {
      currentVelocity = 0;
      isMomentumScrolling.current = false;
    }

    // Apply velocity to position
    let newPosition = element.scrollTop + currentVelocity;

    // Apply elasticity at boundaries
    newPosition = applyElasticity(newPosition);

    // Clamp to bounds (hard limit)
    newPosition = Math.max(bounds.min, Math.min(bounds.max, newPosition));

    // Update scroll position
    element.scrollTop = newPosition;

    // Calculate state
    const progress = bounds.max > 0 ? newPosition / bounds.max : 0;
    const isAtTop = newPosition <= 0;
    const isAtBottom = newPosition >= bounds.max - 1; // -1 for floating point tolerance

    setScrollState({
      position: newPosition,
      velocity: currentVelocity,
      isScrolling: isMomentumScrolling.current,
      isAtTop,
      isAtBottom,
      progress,
    });

    velocityRef.current = currentVelocity;

    // Continue animation if scrolling
    if (isMomentumScrolling.current) {
      animationFrameRef.current = requestAnimationFrame(updateScroll);
    }
  }, [getScrollBounds, friction, minVelocity, applyElasticity]);

  /**
   * Handle wheel events
   */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // Start momentum
      isMomentumScrolling.current = true;

      // Add velocity (cap at max)
      const deltaVelocity = e.deltaY * 0.3; // Scale factor
      velocityRef.current = Math.max(
        -maxVelocity,
        Math.min(maxVelocity, velocityRef.current + deltaVelocity)
      );

      // Start animation if not already running
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateScroll);
      }
    },
    [maxVelocity, updateScroll]
  );

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      lastTouchRef.current = {
        y: e.touches[0]!.clientY,
        time: Date.now(),
      };
    }

    // Stop current momentum
    velocityRef.current = 0;
    isMomentumScrolling.current = false;
  }, []);

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (
      !lastTouchRef.current ||
      !containerRef.current ||
      e.touches.length === 0
    )
      return;

    const currentY = e.touches[0]!.clientY;
    const currentTime = Date.now();

    const deltaY = lastTouchRef.current.y - currentY;
    const deltaTime = currentTime - lastTouchRef.current.time;

    // Update scroll directly (no momentum during drag)
    containerRef.current.scrollTop += deltaY;

    // Calculate velocity for momentum on release
    if (deltaTime > 0) {
      velocityRef.current = (deltaY / deltaTime) * 16; // Convert to pixels per frame (60fps)
    }

    lastTouchRef.current = {
      y: currentY,
      time: currentTime,
    };
  }, []);

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(() => {
    if (!lastTouchRef.current) return;

    // Start momentum with calculated velocity
    isMomentumScrolling.current = Math.abs(velocityRef.current) > minVelocity;

    if (isMomentumScrolling.current) {
      animationFrameRef.current = requestAnimationFrame(updateScroll);
    }

    lastTouchRef.current = null;
  }, [minVelocity, updateScroll]);

  /**
   * Scroll to specific position
   */
  const scrollTo = useCallback(
    (position: number, smooth = true) => {
      if (!containerRef.current) return;

      if (smooth) {
        // Calculate velocity needed to reach target
        const currentPos = containerRef.current.scrollTop;
        const distance = position - currentPos;

        velocityRef.current = distance * 0.1; // Ease into target
        isMomentumScrolling.current = true;

        animationFrameRef.current = requestAnimationFrame(updateScroll);
      } else {
        // Immediate scroll
        containerRef.current.scrollTop = position;
        velocityRef.current = 0;
      }
    },
    [updateScroll]
  );

  /**
   * Scroll to anchor element
   */
  const scrollToAnchor = useCallback(
    (anchorId: string, smooth = true) => {
      if (!containerRef.current) return;

      const anchorElement = document.getElementById(anchorId);
      if (!anchorElement) return;

      // Calculate position relative to container
      const containerRect = containerRef.current.getBoundingClientRect();
      const anchorRect = anchorElement.getBoundingClientRect();

      const relativeTop =
        anchorRect.top - containerRect.top + containerRef.current.scrollTop;
      const targetPosition = relativeTop - scrollPadding;

      scrollTo(targetPosition, smooth);
    },
    [scrollTo, scrollPadding]
  );

  /**
   * Scroll by delta amount
   */
  const scrollBy = useCallback(
    (delta: number) => {
      if (!containerRef.current) return;

      const currentPos = containerRef.current.scrollTop;
      scrollTo(currentPos + delta, true);
    },
    [scrollTo]
  );

  /**
   * Reset scroll to top
   */
  const resetScroll = useCallback(() => {
    scrollTo(0, false);
  }, [scrollTo]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Passive: false to allow preventDefault
    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  /**
   * Calculate shadow styles
   */
  const topShadowStyle: React.CSSProperties = showShadows
    ? {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "20px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)",
        opacity: scrollState.isAtTop
          ? 0
          : Math.min(1, scrollState.position / 100),
        pointerEvents: "none",
        transition: "opacity 0.2s ease",
        zIndex: 10,
      }
    : {};

  const bottomShadowStyle: React.CSSProperties = showShadows
    ? {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "20px",
        background: "linear-gradient(to top, rgba(0,0,0,0.1), transparent)",
        opacity: scrollState.isAtBottom ? 0 : 1 - scrollState.progress,
        pointerEvents: "none",
        transition: "opacity 0.2s ease",
        zIndex: 10,
      }
    : {};

  return {
    scrollState,
    scrollTo,
    scrollToAnchor,
    scrollBy,
    resetScroll,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    topShadowStyle,
    bottomShadowStyle,
  };
}

export default useElasticScroll;
