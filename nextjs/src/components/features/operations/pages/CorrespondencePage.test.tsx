/**
 * @jest-environment jsdom
 * @module CorrespondencePage.test
 * @description Enterprise-grade tests for CorrespondencePage component
 *
 * Test coverage:
 * - Page rendering
 * - CorrespondenceManager integration
 * - caseId prop handling
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CorrespondencePage } from './CorrespondencePage';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/operations/correspondence/CorrespondenceManager', () => ({
  CorrespondenceManager: () => (
    <div data-testid="correspondence-manager">
      <h1>Correspondence Management</h1>
      <div data-testid="correspondence-content">
        <section data-testid="emails-section">
          <h2>Emails</h2>
          <p>Email tracking and management</p>
        </section>
        <section data-testid="letters-section">
          <h2>Letters</h2>
          <p>Letter correspondence tracking</p>
        </section>
        <section data-testid="communications-section">
          <h2>All Communications</h2>
          <p>Complete communication history</p>
        </section>
      </div>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('CorrespondencePage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CorrespondencePage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders CorrespondenceManager component', () => {
      render(<CorrespondencePage />);

      expect(screen.getByTestId('correspondence-manager')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<CorrespondencePage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('correspondence-manager'));
    });

    it('displays correspondence management heading', () => {
      render(<CorrespondencePage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Correspondence Management');
    });

    it('renders correspondence content', () => {
      render(<CorrespondencePage />);

      expect(screen.getByTestId('correspondence-content')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts optional caseId prop', () => {
      expect(() => render(<CorrespondencePage caseId="case-123" />)).not.toThrow();
    });

    it('works without caseId prop', () => {
      expect(() => render(<CorrespondencePage />)).not.toThrow();
    });

    it('handles undefined caseId', () => {
      render(<CorrespondencePage caseId={undefined} />);

      expect(screen.getByTestId('correspondence-manager')).toBeInTheDocument();
    });
  });

  describe('CorrespondenceManager Integration', () => {
    it('renders emails section', () => {
      render(<CorrespondencePage />);

      expect(screen.getByTestId('emails-section')).toBeInTheDocument();
      expect(screen.getByText('Email tracking and management')).toBeInTheDocument();
    });

    it('renders letters section', () => {
      render(<CorrespondencePage />);

      expect(screen.getByTestId('letters-section')).toBeInTheDocument();
      expect(screen.getByText('Letter correspondence tracking')).toBeInTheDocument();
    });

    it('renders communications section', () => {
      render(<CorrespondencePage />);

      expect(screen.getByTestId('communications-section')).toBeInTheDocument();
      expect(screen.getByText('Complete communication history')).toBeInTheDocument();
    });

    it('renders all section headings', () => {
      render(<CorrespondencePage />);

      expect(screen.getByText('Emails')).toBeInTheDocument();
      expect(screen.getByText('Letters')).toBeInTheDocument();
      expect(screen.getByText('All Communications')).toBeInTheDocument();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(CorrespondencePage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when caseId changes', () => {
      const { rerender } = render(<CorrespondencePage caseId="case-1" />);

      rerender(<CorrespondencePage caseId="case-2" />);

      expect(screen.getByTestId('correspondence-manager')).toBeInTheDocument();
    });

    it('handles multiple re-renders', () => {
      const { rerender } = render(<CorrespondencePage />);

      for (let i = 0; i < 3; i++) {
        rerender(<CorrespondencePage caseId={`case-${i}`} />);
      }

      expect(screen.getByTestId('correspondence-manager')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<CorrespondencePage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<CorrespondencePage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('renders main heading element', () => {
      render(<CorrespondencePage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders section headings', () => {
      render(<CorrespondencePage />);

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements).toHaveLength(3);
    });

    it('has proper content structure', () => {
      render(<CorrespondencePage />);

      const sections = screen.getAllByRole('region');
      expect(sections).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty caseId', () => {
      render(<CorrespondencePage caseId="" />);

      expect(screen.getByTestId('correspondence-manager')).toBeInTheDocument();
    });

    it('handles special characters in caseId', () => {
      render(<CorrespondencePage caseId="case-123-ABC!@#" />);

      expect(screen.getByTestId('correspondence-manager')).toBeInTheDocument();
    });
  });
});
