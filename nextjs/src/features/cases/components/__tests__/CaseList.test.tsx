/**
 * @fileoverview Enterprise-grade test suite for CaseList component
 * @module features/cases/components/__tests__/CaseList.test
 *
 * Tests cover:
 * - Rendering with various data states (empty, single, multiple cases)
 * - Case status badge rendering and styling
 * - Navigation link generation
 * - Date formatting
 * - Accessibility compliance
 * - Edge cases and error boundaries
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseList } from '../CaseList';
import type { Case } from '@/lib/dal/cases';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  BriefcaseIcon: ({ className }: { className?: string }) => (
    <svg data-testid="briefcase-icon" className={className} />
  ),
  CalendarIcon: ({ className }: { className?: string }) => (
    <svg data-testid="calendar-icon" className={className} />
  ),
  ChevronRightIcon: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-right-icon" className={className} />
  ),
}));

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: 'default' | 'secondary';
  }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createMockCase = (overrides: Partial<Case> = {}): Case => ({
  id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Smith v. Jones',
  caseNumber: '2024-CV-12345',
  description: 'Commercial litigation matter',
  status: 'Active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createMockCases = (count: number): Case[] =>
  Array.from({ length: count }, (_, i) =>
    createMockCase({
      id: `case-${i + 1}`,
      title: `Case ${i + 1} - ${['Smith', 'Johnson', 'Williams'][i % 3]} v. ${['Corp', 'Inc', 'LLC'][i % 3]}`,
      caseNumber: `2024-CV-${10000 + i}`,
      status: (['Active', 'Closed', 'Pending'] as const)[i % 3],
      description: i % 2 === 0 ? `Description for case ${i + 1}` : null,
    })
  );

// ============================================================================
// TEST SUITES
// ============================================================================

describe('CaseList Component', () => {
  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    describe('Empty State', () => {
      it('should render empty state when no cases are provided', () => {
        render(<CaseList cases={[]} />);

        expect(screen.getByText('No cases')).toBeInTheDocument();
        expect(
          screen.getByText('Get started by creating a new case.')
        ).toBeInTheDocument();
        expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
      });

      it('should render empty state with proper styling', () => {
        const { container } = render(<CaseList cases={[]} />);

        const emptyStateContainer = container.firstChild as HTMLElement;
        expect(emptyStateContainer).toHaveClass('text-center');
        expect(emptyStateContainer).toHaveClass('border-dashed');
      });

      it('should not render list when empty', () => {
        render(<CaseList cases={[]} />);

        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
    });

    describe('Single Case', () => {
      it('should render a single case correctly', () => {
        const mockCase = createMockCase({
          title: 'Test Case Title',
          caseNumber: '2024-CV-99999',
        });

        render(<CaseList cases={[mockCase]} />);

        expect(screen.getByText('Test Case Title')).toBeInTheDocument();
        expect(screen.getByText('#2024-CV-99999')).toBeInTheDocument();
      });

      it('should render case status badge', () => {
        const mockCase = createMockCase({ status: 'Active' });

        render(<CaseList cases={[mockCase]} />);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveTextContent('Active');
        expect(badge).toHaveAttribute('data-variant', 'default');
      });

      it('should render secondary badge variant for non-active cases', () => {
        const mockCase = createMockCase({ status: 'Closed' });

        render(<CaseList cases={[mockCase]} />);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveTextContent('Closed');
        expect(badge).toHaveAttribute('data-variant', 'secondary');
      });
    });

    describe('Multiple Cases', () => {
      it('should render all provided cases', () => {
        const cases = createMockCases(5);

        render(<CaseList cases={cases} />);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(5);
      });

      it('should render cases in provided order', () => {
        const cases = [
          createMockCase({ id: '1', title: 'First Case' }),
          createMockCase({ id: '2', title: 'Second Case' }),
          createMockCase({ id: '3', title: 'Third Case' }),
        ];

        render(<CaseList cases={cases} />);

        const listItems = screen.getAllByRole('listitem');

        expect(within(listItems[0]).getByText('First Case')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('Second Case')).toBeInTheDocument();
        expect(within(listItems[2]).getByText('Third Case')).toBeInTheDocument();
      });

      it('should handle large datasets without performance issues', () => {
        const cases = createMockCases(100);

        const startTime = performance.now();
        render(<CaseList cases={cases} />);
        const endTime = performance.now();

        // Rendering should complete within 500ms
        expect(endTime - startTime).toBeLessThan(500);
        expect(screen.getAllByRole('listitem')).toHaveLength(100);
      });
    });
  });

  // ==========================================================================
  // CASE DETAILS TESTS
  // ==========================================================================

  describe('Case Details', () => {
    describe('Title and Case Number', () => {
      it('should display case title prominently', () => {
        const mockCase = createMockCase({
          title: 'Important Litigation',
          caseNumber: 'CASE-001',
        });

        render(<CaseList cases={[mockCase]} />);

        const title = screen.getByText('Important Litigation');
        expect(title).toHaveClass('font-medium');
        expect(title).toHaveClass('text-blue-600');
      });

      it('should display case number with hash prefix', () => {
        const mockCase = createMockCase({ caseNumber: 'ABC-12345' });

        render(<CaseList cases={[mockCase]} />);

        expect(screen.getByText('#ABC-12345')).toBeInTheDocument();
      });
    });

    describe('Description', () => {
      it('should display description when provided', () => {
        const mockCase = createMockCase({
          description: 'This is a test description',
        });

        render(<CaseList cases={[mockCase]} />);

        expect(screen.getByText('This is a test description')).toBeInTheDocument();
      });

      it('should display fallback text when description is null', () => {
        const mockCase = createMockCase({ description: null });

        render(<CaseList cases={[mockCase]} />);

        expect(screen.getByText('No description')).toBeInTheDocument();
      });

      it('should display fallback text when description is empty string', () => {
        const mockCase = createMockCase({ description: '' });

        render(<CaseList cases={[mockCase]} />);

        expect(screen.getByText('No description')).toBeInTheDocument();
      });
    });

    describe('Date Display', () => {
      it('should display formatted updated date', () => {
        const mockCase = createMockCase({
          updatedAt: '2024-06-15T10:30:00.000Z',
        });

        render(<CaseList cases={[mockCase]} />);

        // Date format depends on locale, so we check for presence of "Updated"
        expect(screen.getByText(/Updated/)).toBeInTheDocument();
        expect(screen.getByRole('time')).toBeInTheDocument();
      });

      it('should set datetime attribute on time element', () => {
        const mockCase = createMockCase({
          updatedAt: '2024-06-15T10:30:00.000Z',
        });

        render(<CaseList cases={[mockCase]} />);

        const timeElement = screen.getByRole('time');
        expect(timeElement).toHaveAttribute(
          'dateTime',
          '2024-06-15T10:30:00.000Z'
        );
      });
    });
  });

  // ==========================================================================
  // NAVIGATION TESTS
  // ==========================================================================

  describe('Navigation', () => {
    it('should generate correct link href for each case', () => {
      const mockCase = createMockCase({ id: 'test-case-id-123' });

      render(<CaseList cases={[mockCase]} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/cases/test-case-id-123');
    });

    it('should have correct link structure for all cases', () => {
      const cases = createMockCases(3);

      render(<CaseList cases={cases} />);

      const links = screen.getAllByRole('link');

      links.forEach((link, index) => {
        expect(link).toHaveAttribute('href', `/cases/case-${index + 1}`);
      });
    });

    it('should wrap entire case item in clickable link', async () => {
      const mockCase = createMockCase();
      const user = userEvent.setup();

      render(<CaseList cases={[mockCase]} />);

      const link = screen.getByRole('link');
      const caseTitle = screen.getByText(mockCase.title);

      // Title should be contained within the link
      expect(link).toContainElement(caseTitle);

      // Link should be clickable
      await user.click(link);
      // Note: In a real scenario with a router mock, we'd verify navigation
    });
  });

  // ==========================================================================
  // STATUS BADGE TESTS
  // ==========================================================================

  describe('Status Badges', () => {
    it.each([
      ['Active', 'default'],
      ['Closed', 'secondary'],
      ['Pending', 'secondary'],
      ['On Hold', 'secondary'],
    ] as const)(
      'should render %s status with %s badge variant',
      (status, expectedVariant) => {
        const mockCase = createMockCase({ status });

        render(<CaseList cases={[mockCase]} />);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveTextContent(status);
        expect(badge).toHaveAttribute('data-variant', expectedVariant);
      }
    );

    it('should display correct badge for each case in a mixed list', () => {
      const cases = [
        createMockCase({ id: '1', status: 'Active' }),
        createMockCase({ id: '2', status: 'Closed' }),
        createMockCase({ id: '3', status: 'Pending' }),
      ];

      render(<CaseList cases={cases} />);

      const badges = screen.getAllByTestId('badge');

      expect(badges[0]).toHaveTextContent('Active');
      expect(badges[0]).toHaveAttribute('data-variant', 'default');

      expect(badges[1]).toHaveTextContent('Closed');
      expect(badges[1]).toHaveAttribute('data-variant', 'secondary');

      expect(badges[2]).toHaveTextContent('Pending');
      expect(badges[2]).toHaveAttribute('data-variant', 'secondary');
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should use semantic list markup', () => {
      const cases = createMockCases(3);

      render(<CaseList cases={cases} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('should have accessible links', () => {
      const mockCase = createMockCase({ title: 'Accessible Case' });

      render(<CaseList cases={[mockCase]} />);

      const link = screen.getByRole('link');
      expect(link).toBeVisible();
    });

    it('should have proper heading hierarchy in empty state', () => {
      render(<CaseList cases={[]} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('No cases');
    });

    it('should use aria-hidden on decorative icons', () => {
      const mockCase = createMockCase();

      render(<CaseList cases={[mockCase]} />);

      // Icons should be present but calendar icon has aria-hidden
      const calendarIcons = screen.getAllByTestId('calendar-icon');
      calendarIcons.forEach((icon) => {
        expect(icon.closest('[aria-hidden="true"]')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // STYLING TESTS
  // ==========================================================================

  describe('Styling', () => {
    it('should apply container styling for list view', () => {
      const cases = createMockCases(3);

      const { container } = render(<CaseList cases={cases} />);

      const listContainer = container.firstChild as HTMLElement;
      expect(listContainer).toHaveClass('overflow-hidden');
      expect(listContainer).toHaveClass('shadow');
      expect(listContainer).toHaveClass('bg-white');
    });

    it('should apply hover styles to list items', () => {
      const mockCase = createMockCase();

      render(<CaseList cases={[mockCase]} />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('hover:bg-slate-50');
    });

    it('should have proper dark mode classes', () => {
      const cases = createMockCases(1);

      const { container } = render(<CaseList cases={cases} />);

      const listContainer = container.firstChild as HTMLElement;
      expect(listContainer).toHaveClass('dark:bg-slate-900');
    });

    it('should apply divider between list items', () => {
      const cases = createMockCases(3);

      render(<CaseList cases={cases} />);

      const list = screen.getByRole('list');
      expect(list).toHaveClass('divide-y');
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle case with very long title', () => {
      const longTitle =
        'This is a very long case title that might overflow the container and cause layout issues if not properly handled with truncation or wrapping';
      const mockCase = createMockCase({ title: longTitle });

      render(<CaseList cases={[mockCase]} />);

      const titleElement = screen.getByText(longTitle);
      expect(titleElement.closest('div')).toHaveClass('truncate');
    });

    it('should handle case with special characters in title', () => {
      const specialTitle = 'Case: Smith & Associates v. O\'Brien (No. 123)';
      const mockCase = createMockCase({ title: specialTitle });

      render(<CaseList cases={[mockCase]} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('should handle case with unicode characters', () => {
      const unicodeTitle = 'Müller v. Société Générale 中文测试';
      const mockCase = createMockCase({ title: unicodeTitle });

      render(<CaseList cases={[mockCase]} />);

      expect(screen.getByText(unicodeTitle)).toBeInTheDocument();
    });

    it('should handle invalid date gracefully', () => {
      const mockCase = createMockCase({ updatedAt: 'invalid-date' });

      // Should not throw
      expect(() => render(<CaseList cases={[mockCase]} />)).not.toThrow();
    });

    it('should handle HTML entities in description', () => {
      const mockCase = createMockCase({
        description: 'Terms &amp; Conditions apply <script>alert("xss")</script>',
      });

      render(<CaseList cases={[mockCase]} />);

      // XSS should be escaped/neutralized by React
      expect(screen.queryByText(/script/i)).toBeInTheDocument();
      expect(document.querySelector('script')).toBeNull();
    });
  });

  // ==========================================================================
  // PERFORMANCE TESTS
  // ==========================================================================

  describe('Performance', () => {
    it('should render efficiently with many items', () => {
      const cases = createMockCases(500);

      const startTime = performance.now();
      const { unmount } = render(<CaseList cases={cases} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(1000); // Should render within 1 second

      // Cleanup time
      const unmountStart = performance.now();
      unmount();
      const unmountTime = performance.now() - unmountStart;

      expect(unmountTime).toBeLessThan(500);
    });

    it('should update efficiently when cases change', () => {
      const initialCases = createMockCases(10);
      const { rerender } = render(<CaseList cases={initialCases} />);

      const newCases = createMockCases(15);

      const startTime = performance.now();
      rerender(<CaseList cases={newCases} />);
      const rerenderTime = performance.now() - startTime;

      expect(rerenderTime).toBeLessThan(100);
      expect(screen.getAllByRole('listitem')).toHaveLength(15);
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for empty state', () => {
      const { container } = render(<CaseList cases={[]} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for single case', () => {
      const mockCase = createMockCase({
        id: 'snapshot-case-1',
        title: 'Snapshot Test Case',
        caseNumber: 'SNAP-001',
        description: 'Test description',
        status: 'Active',
        updatedAt: '2024-01-15T12:00:00.000Z',
      });

      const { container } = render(<CaseList cases={[mockCase]} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for multiple cases with various statuses', () => {
      const cases = [
        createMockCase({
          id: 'snap-1',
          title: 'Active Case',
          status: 'Active',
          updatedAt: '2024-01-15T12:00:00.000Z',
        }),
        createMockCase({
          id: 'snap-2',
          title: 'Closed Case',
          status: 'Closed',
          updatedAt: '2024-01-14T12:00:00.000Z',
        }),
        createMockCase({
          id: 'snap-3',
          title: 'Pending Case',
          status: 'Pending',
          description: null,
          updatedAt: '2024-01-13T12:00:00.000Z',
        }),
      ];

      const { container } = render(<CaseList cases={cases} />);
      expect(container).toMatchSnapshot();
    });
  });
});
