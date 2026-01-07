/**
 * @jest-environment jsdom
 * @module CalendarPage.test
 * @description Enterprise-grade tests for CalendarPage component
 *
 * Test coverage:
 * - Page rendering
 * - CalendarMaster integration
 * - PageContainerLayout wrapper
 * - React.memo optimization
 * - Props handling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CalendarPage } from './CalendarPage';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/cases/components/calendar/CalendarMaster', () => ({
  CalendarMaster: () => (
    <div data-testid="calendar-master">
      <h1>Calendar Master</h1>
      <div data-testid="calendar-grid">Calendar Grid</div>
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

describe('CalendarPage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CalendarPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders CalendarMaster component', () => {
      render(<CalendarPage />);

      expect(screen.getByTestId('calendar-master')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<CalendarPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('calendar-master'));
    });

    it('renders calendar grid', () => {
      render(<CalendarPage />);

      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts optional caseId prop', () => {
      expect(() => render(<CalendarPage caseId="case-123" />)).not.toThrow();
    });

    it('works without caseId prop', () => {
      expect(() => render(<CalendarPage />)).not.toThrow();
    });

    it('handles undefined caseId', () => {
      render(<CalendarPage caseId={undefined} />);

      expect(screen.getByTestId('calendar-master')).toBeInTheDocument();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      // Verify component is wrapped with React.memo
      expect(CalendarPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when props change', () => {
      const { rerender } = render(<CalendarPage caseId="case-1" />);

      rerender(<CalendarPage caseId="case-2" />);

      expect(screen.getByTestId('calendar-master')).toBeInTheDocument();
    });

    it('does not crash on multiple re-renders', () => {
      const { rerender } = render(<CalendarPage />);

      for (let i = 0; i < 5; i++) {
        rerender(<CalendarPage caseId={`case-${i}`} />);
      }

      expect(screen.getByTestId('calendar-master')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<CalendarPage />);

      // PageContainerLayout should be the outer wrapper
      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<CalendarPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<CalendarPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Calendar Master');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string caseId', () => {
      render(<CalendarPage caseId="" />);

      expect(screen.getByTestId('calendar-master')).toBeInTheDocument();
    });

    it('handles special characters in caseId', () => {
      render(<CalendarPage caseId="case-123-special!@#" />);

      expect(screen.getByTestId('calendar-master')).toBeInTheDocument();
    });
  });
});
