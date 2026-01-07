/**
 * @fileoverview Enterprise-grade tests for PlaybookLibrary component
 * @module components/litigation-strategy/PlaybookLibrary.test
 *
 * Tests placeholder rendering, styling, and dark mode support.
 */

import { render, screen } from '@testing-library/react';
import { PlaybookLibrary } from './PlaybookLibrary';

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('PlaybookLibrary', () => {
  describe('Basic Rendering', () => {
    it('renders the Playbook Library title', () => {
      render(<PlaybookLibrary />);
      expect(screen.getByText('Playbook Library')).toBeInTheDocument();
    });

    it('renders the coming soon message', () => {
      render(<PlaybookLibrary />);
      expect(screen.getByText('Templates and playbooks coming soon...')).toBeInTheDocument();
    });

    it('renders container div', () => {
      const { container } = render(<PlaybookLibrary />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ============================================================================
  // STYLING TESTS
  // ============================================================================

  describe('Styling', () => {
    it('applies minimum height to container', () => {
      const { container } = render(<PlaybookLibrary />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('min-h-[500px]');
    });

    it('applies full width and height', () => {
      const { container } = render(<PlaybookLibrary />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('h-full', 'w-full');
    });

    it('centers content with flexbox', () => {
      const { container } = render(<PlaybookLibrary />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('applies background color', () => {
      const { container } = render(<PlaybookLibrary />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-slate-50');
    });

    it('applies border', () => {
      const { container } = render(<PlaybookLibrary />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('border', 'border-slate-200');
    });

    it('applies rounded corners', () => {
      const { container } = render(<PlaybookLibrary />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('rounded-lg');
    });

    it('title has medium font weight', () => {
      render(<PlaybookLibrary />);
      const title = screen.getByText('Playbook Library');
      expect(title).toHaveClass('font-medium');
    });

    it('title has large text size', () => {
      render(<PlaybookLibrary />);
      const title = screen.getByText('Playbook Library');
      expect(title).toHaveClass('text-lg');
    });

    it('message has small text size', () => {
      render(<PlaybookLibrary />);
      const message = screen.getByText('Templates and playbooks coming soon...');
      expect(message).toHaveClass('text-sm');
    });

    it('content uses text-center alignment', () => {
      render(<PlaybookLibrary />);
      const title = screen.getByText('Playbook Library');
      const contentContainer = title.parentElement;
      expect(contentContainer).toHaveClass('text-center');
    });

    it('content has slate-400 text color', () => {
      render(<PlaybookLibrary />);
      const title = screen.getByText('Playbook Library');
      const contentContainer = title.parentElement;
      expect(contentContainer).toHaveClass('text-slate-400');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode background', () => {
      const { container } = render(<PlaybookLibrary />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('dark:bg-slate-900');
    });

    it('applies dark mode border color', () => {
      const { container } = render(<PlaybookLibrary />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('dark:border-slate-700');
    });
  });

  // ============================================================================
  // STRUCTURE TESTS
  // ============================================================================

  describe('Structure', () => {
    it('has correct DOM structure', () => {
      const { container } = render(<PlaybookLibrary />);

      // Main container > text container > p elements
      const mainContainer = container.firstChild;
      expect(mainContainer?.childNodes.length).toBe(1);

      const textContainer = mainContainer?.firstChild;
      expect(textContainer?.childNodes.length).toBe(2);
    });

    it('title has margin-bottom', () => {
      render(<PlaybookLibrary />);
      const title = screen.getByText('Playbook Library');
      expect(title).toHaveClass('mb-2');
    });
  });

  // ============================================================================
  // CONTENT TESTS
  // ============================================================================

  describe('Content', () => {
    it('mentions templates', () => {
      render(<PlaybookLibrary />);
      expect(screen.getByText(/templates/i)).toBeInTheDocument();
    });

    it('mentions playbooks', () => {
      render(<PlaybookLibrary />);
      expect(screen.getByText(/playbooks/i)).toBeInTheDocument();
    });

    it('indicates feature is coming soon', () => {
      render(<PlaybookLibrary />);
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SNAPSHOT TEST
  // ============================================================================

  describe('Snapshot', () => {
    it('matches snapshot', () => {
      const { container } = render(<PlaybookLibrary />);
      expect(container).toMatchSnapshot();
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('renders consistently across multiple renders', () => {
      const { container: container1 } = render(<PlaybookLibrary />);
      const { container: container2 } = render(<PlaybookLibrary />);

      expect(container1.innerHTML).toBe(container2.innerHTML);
    });

    it('does not throw when rendered', () => {
      expect(() => render(<PlaybookLibrary />)).not.toThrow();
    });
  });
});
