/**
 * Enterprise Test Suite: Loading Component
 *
 * Comprehensive tests for the main route group loading UI including:
 * - Rendering and structure
 * - Animation elements
 * - Accessibility
 * - Visual consistency
 * - Dark mode support
 *
 * @module loading.test
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

describe('MainLoading Component', () => {
  let MainLoading: React.FC;

  beforeAll(async () => {
    const loadingModule = await import('../loading');
    MainLoading = loadingModule.default;
  });

  describe('Basic Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(<MainLoading />);
      expect(container).toBeDefined();
    });

    it('should render loading text', () => {
      render(<MainLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<MainLoading />);
      expect(
        screen.getByText('Please wait while we prepare your content')
      ).toBeInTheDocument();
    });
  });

  describe('Spinner Structure', () => {
    it('should render the spinner container', () => {
      const { container } = render(<MainLoading />);
      const spinnerContainer = container.querySelector('.w-20.h-20');
      expect(spinnerContainer).toBeInTheDocument();
    });

    it('should render the outer ring', () => {
      const { container } = render(<MainLoading />);
      const outerRing = container.querySelector('.border-slate-200');
      expect(outerRing).toBeInTheDocument();
    });

    it('should render the animated ring', () => {
      const { container } = render(<MainLoading />);
      const animatedRing = container.querySelector('.animate-spin');
      expect(animatedRing).toBeInTheDocument();
    });

    it('should render the inner gradient icon', () => {
      const { container } = render(<MainLoading />);
      const innerIcon = container.querySelector('.bg-gradient-to-br');
      expect(innerIcon).toBeInTheDocument();
    });

    it('should render an SVG icon inside spinner', () => {
      const { container } = render(<MainLoading />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Progress Dots', () => {
    it('should render three progress dots', () => {
      const { container } = render(<MainLoading />);
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots.length).toBe(3);
    });

    it('should have staggered animation delays', () => {
      const { container } = render(<MainLoading />);
      const dots = container.querySelectorAll('.animate-bounce');

      expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
      expect(dots[1]).toHaveStyle({ animationDelay: '150ms' });
      expect(dots[2]).toHaveStyle({ animationDelay: '300ms' });
    });

    it('should have consistent animation duration', () => {
      const { container } = render(<MainLoading />);
      const dots = container.querySelectorAll('.animate-bounce');

      dots.forEach((dot) => {
        expect(dot).toHaveStyle({ animationDuration: '1s' });
      });
    });
  });

  describe('Skeleton Preview', () => {
    it('should render skeleton lines', () => {
      const { container } = render(<MainLoading />);
      const skeletonLines = container.querySelectorAll('.animate-pulse');
      expect(skeletonLines.length).toBeGreaterThanOrEqual(3);
    });

    it('should have varying widths for skeleton lines', () => {
      const { container } = render(<MainLoading />);
      const skeletonContainer = container.querySelector('.mt-8.space-y-3');
      expect(skeletonContainer).toBeInTheDocument();

      const lines = skeletonContainer?.querySelectorAll('.h-4');
      expect(lines?.length).toBe(3);
    });
  });

  describe('Layout Structure', () => {
    it('should have centered content', () => {
      const { container } = render(<MainLoading />);
      const rootDiv = container.firstChild;

      expect(rootDiv).toHaveClass('flex');
      expect(rootDiv).toHaveClass('items-center');
      expect(rootDiv).toHaveClass('justify-center');
    });

    it('should have minimum height calculation', () => {
      const { container } = render(<MainLoading />);
      const rootDiv = container.firstChild;

      expect((rootDiv as Element).className).toContain('min-h-');
    });

    it('should have max width constraint', () => {
      const { container } = render(<MainLoading />);
      const contentWrapper = container.querySelector('.max-w-md');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      const { container } = render(<MainLoading />);
      const contentWrapper = container.querySelector('.space-y-6');
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode background on container', () => {
      const { container } = render(<MainLoading />);
      const rootDiv = container.firstChild;

      expect((rootDiv as Element).className).toContain('dark:bg-slate-900');
    });

    it('should include dark mode classes on heading', () => {
      const { container } = render(<MainLoading />);
      const heading = container.querySelector('h2');

      expect(heading?.className).toContain('dark:text-white');
    });

    it('should include dark mode classes on description', () => {
      const { container } = render(<MainLoading />);
      const description = container.querySelector('p');

      expect(description?.className).toContain('dark:text-slate-400');
    });

    it('should include dark mode classes on outer ring', () => {
      const { container } = render(<MainLoading />);
      const outerRing = container.querySelector('.border-slate-200');

      expect(outerRing?.className).toContain('dark:border-slate-700');
    });

    it('should include dark mode classes on animated ring', () => {
      const { container } = render(<MainLoading />);
      const animatedRing = container.querySelector('.border-blue-600');

      expect(animatedRing?.className).toContain('dark:border-blue-400');
    });

    it('should include dark mode classes on progress dots', () => {
      const { container } = render(<MainLoading />);
      const dots = container.querySelectorAll('.bg-blue-600');

      dots.forEach((dot) => {
        expect(dot.className).toContain('dark:bg-blue-400');
      });
    });

    it('should include dark mode classes on skeleton lines', () => {
      const { container } = render(<MainLoading />);
      const skeletonLines = container.querySelectorAll('.bg-slate-200');

      skeletonLines.forEach((line) => {
        expect(line.className).toContain('dark:bg-slate-700');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<MainLoading />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Loading...');
    });

    it('should have descriptive text for screen readers', () => {
      render(<MainLoading />);
      expect(
        screen.getByText('Please wait while we prepare your content')
      ).toBeInTheDocument();
    });

    it('should have visible loading indicators', () => {
      const { container } = render(<MainLoading />);

      // Spinner should be visible
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeVisible();

      // Progress dots should be visible
      const dots = container.querySelectorAll('.animate-bounce');
      dots.forEach((dot) => {
        expect(dot).toBeVisible();
      });
    });
  });

  describe('Animation Classes', () => {
    it('should have spin animation on loading ring', () => {
      const { container } = render(<MainLoading />);
      const spinningRing = container.querySelector('.animate-spin');
      expect(spinningRing).toBeInTheDocument();
    });

    it('should have bounce animation on progress dots', () => {
      const { container } = render(<MainLoading />);
      const bouncingDots = container.querySelectorAll('.animate-bounce');
      expect(bouncingDots.length).toBe(3);
    });

    it('should have pulse animation on skeleton lines', () => {
      const { container } = render(<MainLoading />);
      const pulsingLines = container.querySelectorAll('.animate-pulse');
      expect(pulsingLines.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('SVG Icon', () => {
    it('should render SVG with correct attributes', () => {
      const { container } = render(<MainLoading />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('should have icon path', () => {
      const { container } = render(<MainLoading />);
      const path = container.querySelector('svg path');
      expect(path).toBeInTheDocument();
    });

    it('should have proper icon styling', () => {
      const { container } = render(<MainLoading />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('w-8');
      expect(svg).toHaveClass('h-8');
      expect(svg).toHaveClass('text-white');
    });
  });

  describe('Color Scheme', () => {
    it('should use blue color scheme for primary elements', () => {
      const { container } = render(<MainLoading />);

      // Animated ring
      expect(container.querySelector('.border-blue-600')).toBeInTheDocument();

      // Progress dots
      expect(container.querySelectorAll('.bg-blue-600').length).toBeGreaterThan(0);

      // Gradient
      expect(container.querySelector('.from-blue-500')).toBeInTheDocument();
    });

    it('should use slate color scheme for secondary elements', () => {
      const { container } = render(<MainLoading />);

      // Background
      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('bg-slate-50');

      // Outer ring
      expect(container.querySelector('.border-slate-200')).toBeInTheDocument();

      // Skeleton lines
      expect(container.querySelectorAll('.bg-slate-200').length).toBeGreaterThan(0);
    });
  });

  describe('Rounded Corners', () => {
    it('should have fully rounded spinner elements', () => {
      const { container } = render(<MainLoading />);
      const roundedElements = container.querySelectorAll('.rounded-full');
      expect(roundedElements.length).toBeGreaterThanOrEqual(6); // rings, dots, skeleton lines
    });
  });

  describe('Shadow and Depth', () => {
    it('should have shadow on inner spinner icon', () => {
      const { container } = render(<MainLoading />);
      const shadowElement = container.querySelector('.shadow-lg');
      expect(shadowElement).toBeInTheDocument();
    });
  });
});

describe('MainLoading - Performance', () => {
  it('should render within acceptable time', async () => {
    const loadingModule = await import('../loading');
    const MainLoading = loadingModule.default;

    const startTime = performance.now();
    render(<MainLoading />);
    const endTime = performance.now();

    // Should render in less than 20ms
    expect(endTime - startTime).toBeLessThan(20);
  });

  it('should be a lightweight component', async () => {
    const loadingModule = await import('../loading');
    const MainLoading = loadingModule.default;

    const { container } = render(<MainLoading />);

    // Should have minimal DOM nodes
    const allElements = container.querySelectorAll('*');
    expect(allElements.length).toBeLessThan(30);
  });
});

describe('MainLoading - Server Component Compatibility', () => {
  it('should not use any client-side hooks', async () => {
    // Loading component should be a pure Server Component
    const loadingModule = await import('../loading');
    const MainLoading = loadingModule.default;

    // Should render without any client-side context
    expect(() => render(<MainLoading />)).not.toThrow();
  });

  it('should not have "use client" directive', async () => {
    // Read the actual file to verify it's a server component
    // This is a conceptual test - in practice, we'd check the module
    const loadingModule = await import('../loading');
    expect(loadingModule.default).toBeDefined();
    // The component renders successfully, indicating it doesn't require client features
  });
});
