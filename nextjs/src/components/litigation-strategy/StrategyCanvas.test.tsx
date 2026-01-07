/**
 * @fileoverview Enterprise-grade tests for StrategyCanvas component
 * @module components/litigation-strategy/StrategyCanvas.test
 *
 * Tests placeholder rendering, styling, and dark mode support.
 */

import { render, screen } from '@testing-library/react';
import { StrategyCanvas } from './StrategyCanvas';

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('StrategyCanvas', () => {
  describe('Basic Rendering', () => {
    it('renders the Strategy Canvas title', () => {
      render(<StrategyCanvas />);
      expect(screen.getByText('Strategy Canvas')).toBeInTheDocument();
    });

    it('renders the coming soon message', () => {
      render(<StrategyCanvas />);
      expect(screen.getByText('Visual strategy builder coming soon...')).toBeInTheDocument();
    });

    it('renders container div', () => {
      const { container } = render(<StrategyCanvas />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ============================================================================
  // STYLING TESTS
  // ============================================================================

  describe('Styling', () => {
    it('applies minimum height to container', () => {
      const { container } = render(<StrategyCanvas />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('min-h-[500px]');
    });

    it('applies full width and height', () => {
      const { container } = render(<StrategyCanvas />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('h-full', 'w-full');
    });

    it('centers content with flexbox', () => {
      const { container } = render(<StrategyCanvas />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('applies background color', () => {
      const { container } = render(<StrategyCanvas />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-slate-50');
    });

    it('applies border', () => {
      const { container } = render(<StrategyCanvas />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('border', 'border-slate-200');
    });

    it('applies rounded corners', () => {
      const { container } = render(<StrategyCanvas />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('rounded-lg');
    });

    it('title has medium font weight', () => {
      render(<StrategyCanvas />);
      const title = screen.getByText('Strategy Canvas');
      expect(title).toHaveClass('font-medium');
    });

    it('title has large text size', () => {
      render(<StrategyCanvas />);
      const title = screen.getByText('Strategy Canvas');
      expect(title).toHaveClass('text-lg');
    });

    it('message has small text size', () => {
      render(<StrategyCanvas />);
      const message = screen.getByText('Visual strategy builder coming soon...');
      expect(message).toHaveClass('text-sm');
    });

    it('content uses text-center alignment', () => {
      render(<StrategyCanvas />);
      const title = screen.getByText('Strategy Canvas');
      const contentContainer = title.parentElement;
      expect(contentContainer).toHaveClass('text-center');
    });

    it('content has slate-400 text color', () => {
      render(<StrategyCanvas />);
      const title = screen.getByText('Strategy Canvas');
      const contentContainer = title.parentElement;
      expect(contentContainer).toHaveClass('text-slate-400');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode background', () => {
      const { container } = render(<StrategyCanvas />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('dark:bg-slate-900');
    });

    it('applies dark mode border color', () => {
      const { container } = render(<StrategyCanvas />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('dark:border-slate-700');
    });
  });

  // ============================================================================
  // STRUCTURE TESTS
  // ============================================================================

  describe('Structure', () => {
    it('has correct DOM structure', () => {
      const { container } = render(<StrategyCanvas />);

      // Main container > text container > p elements
      const mainContainer = container.firstChild;
      expect(mainContainer?.childNodes.length).toBe(1);

      const textContainer = mainContainer?.firstChild;
      expect(textContainer?.childNodes.length).toBe(2);
    });

    it('title has margin-bottom', () => {
      render(<StrategyCanvas />);
      const title = screen.getByText('Strategy Canvas');
      expect(title).toHaveClass('mb-2');
    });
  });

  // ============================================================================
  // CONTENT TESTS
  // ============================================================================

  describe('Content', () => {
    it('mentions visual strategy builder', () => {
      render(<StrategyCanvas />);
      expect(screen.getByText(/visual strategy builder/i)).toBeInTheDocument();
    });

    it('indicates feature is coming soon', () => {
      render(<StrategyCanvas />);
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SNAPSHOT TEST
  // ============================================================================

  describe('Snapshot', () => {
    it('matches snapshot', () => {
      const { container } = render(<StrategyCanvas />);
      expect(container).toMatchSnapshot();
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('renders consistently across multiple renders', () => {
      const { container: container1 } = render(<StrategyCanvas />);
      const { container: container2 } = render(<StrategyCanvas />);

      expect(container1.innerHTML).toBe(container2.innerHTML);
    });

    it('does not throw when rendered', () => {
      expect(() => render(<StrategyCanvas />)).not.toThrow();
    });
  });
});
