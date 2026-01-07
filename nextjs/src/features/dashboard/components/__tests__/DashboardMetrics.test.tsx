/**
 * @fileoverview Enterprise-grade test suite for DashboardMetrics component
 * @module features/dashboard/components/__tests__/DashboardMetrics.test
 *
 * Tests cover:
 * - Rendering with various stat configurations
 * - Icon mapping based on label content
 * - Trend indicators (up/down/neutral)
 * - Color theming based on stat type
 * - Accessibility compliance
 * - Edge cases and error handling
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { DashboardMetrics } from '../DashboardMetrics';
import type { QuickStat } from '@/lib/dal/dashboard';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  TrendingUp: ({ className }: { className?: string }) => (
    <svg data-testid="trending-up-icon" className={className} />
  ),
  TrendingDown: ({ className }: { className?: string }) => (
    <svg data-testid="trending-down-icon" className={className} />
  ),
  Briefcase: ({ className }: { className?: string }) => (
    <svg data-testid="briefcase-icon" className={className} />
  ),
  FileText: ({ className }: { className?: string }) => (
    <svg data-testid="file-text-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <svg data-testid="clock-icon" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-triangle-icon" className={className} />
  ),
}));

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | boolean)[]) =>
    classes.filter(Boolean).join(' '),
}));

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createMockStat = (overrides: Partial<QuickStat> = {}): QuickStat => ({
  label: 'Active Cases',
  value: 42,
  change: 12,
  trend: 'up',
  ...overrides,
});

const createStandardDashboardStats = (): QuickStat[] => [
  { label: 'Active Cases', value: 42, change: 12, trend: 'up' },
  { label: 'Pending Motions', value: 8, change: -3, trend: 'down' },
  { label: 'Billable Hours', value: '156.5', change: 8, trend: 'up' },
  { label: 'High Risk Items', value: 3, change: 2, trend: 'up' },
];

// ============================================================================
// TEST SUITES
// ============================================================================

describe('DashboardMetrics Component', () => {
  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render all provided stats', () => {
      const stats = createStandardDashboardStats();

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('Active Cases')).toBeInTheDocument();
      expect(screen.getByText('Pending Motions')).toBeInTheDocument();
      expect(screen.getByText('Billable Hours')).toBeInTheDocument();
      expect(screen.getByText('High Risk Items')).toBeInTheDocument();
    });

    it('should render stat values correctly', () => {
      const stats = createStandardDashboardStats();

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('156.5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render empty when no stats provided', () => {
      const { container } = render(<DashboardMetrics stats={[]} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.children).toHaveLength(0);
    });

    it('should render single stat correctly', () => {
      const stats = [createMockStat()];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('Active Cases')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should use responsive grid layout', () => {
      const stats = createStandardDashboardStats();

      const { container } = render(<DashboardMetrics stats={stats} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
      expect(grid).toHaveClass('gap-6');
    });
  });

  // ==========================================================================
  // ICON MAPPING TESTS
  // ==========================================================================

  describe('Icon Mapping', () => {
    it('should render FileText icon for Motion labels', () => {
      const stats = [createMockStat({ label: 'Pending Motions' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    });

    it('should render Clock icon for Hours labels', () => {
      const stats = [createMockStat({ label: 'Billable Hours' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('should render AlertTriangle icon for Risk labels', () => {
      const stats = [createMockStat({ label: 'High Risk Items' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    it('should render Briefcase icon as default', () => {
      const stats = [createMockStat({ label: 'Active Cases' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
    });

    it('should handle case-insensitive label matching for icons', () => {
      const stats = [
        createMockStat({ label: 'MOTION Status' }),
        createMockStat({ label: 'Working HOURS' }),
        createMockStat({ label: 'RISK Assessment' }),
      ];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // TREND INDICATOR TESTS
  // ==========================================================================

  describe('Trend Indicators', () => {
    it('should render TrendingUp icon for positive trend', () => {
      const stats = [createMockStat({ trend: 'up', change: 15 })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    });

    it('should render TrendingDown icon for negative trend', () => {
      const stats = [createMockStat({ trend: 'down', change: -10 })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
    });

    it('should not render trend icon for neutral trend', () => {
      const stats = [createMockStat({ trend: 'neutral', change: 0 })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.queryByTestId('trending-up-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('trending-down-icon')).not.toBeInTheDocument();
    });

    it('should display absolute change value with percentage', () => {
      const stats = [createMockStat({ change: -15, trend: 'down' })];

      render(<DashboardMetrics stats={stats} />);

      // Should show absolute value (15) with %
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('should display "from last month" text', () => {
      const stats = createStandardDashboardStats();

      render(<DashboardMetrics stats={stats} />);

      const fromLastMonthTexts = screen.getAllByText('from last month');
      expect(fromLastMonthTexts.length).toBeGreaterThan(0);
    });

    it('should not render change section when change is undefined', () => {
      const stats = [createMockStat({ change: undefined, trend: undefined })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // COLOR THEMING TESTS
  // ==========================================================================

  describe('Color Theming', () => {
    it('should apply blue background for default (Briefcase) icon', () => {
      const stats = [createMockStat({ label: 'Active Cases' })];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const iconContainer = container.querySelector('.bg-blue-500');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply indigo background for Motion icon', () => {
      const stats = [createMockStat({ label: 'Pending Motions' })];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const iconContainer = container.querySelector('.bg-indigo-500');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply emerald background for Hours icon', () => {
      const stats = [createMockStat({ label: 'Billable Hours' })];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const iconContainer = container.querySelector('.bg-emerald-500');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply rose background for Risk icon', () => {
      const stats = [createMockStat({ label: 'High Risk Items' })];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const iconContainer = container.querySelector('.bg-rose-500');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply green text for upward trend', () => {
      const stats = [createMockStat({ trend: 'up', change: 10 })];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const trendText = container.querySelector('.text-green-600');
      expect(trendText).toBeInTheDocument();
    });

    it('should apply red text for downward trend', () => {
      const stats = [createMockStat({ trend: 'down', change: -10 })];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const trendText = container.querySelector('.text-red-600');
      expect(trendText).toBeInTheDocument();
    });

    it('should apply slate text for neutral trend', () => {
      const stats = [createMockStat({ trend: 'neutral', change: 0 })];

      const { container } = render(<DashboardMetrics stats={stats} />);

      // Neutral uses text-slate-500
      const trendContainer = container.querySelector('.text-slate-500');
      expect(trendContainer).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // CARD STYLING TESTS
  // ==========================================================================

  describe('Card Styling', () => {
    it('should render stat cards with proper styling', () => {
      const stats = [createMockStat()];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const card = container.querySelector('.rounded-xl');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('p-6');
      expect(card).toHaveClass('shadow-sm');
      expect(card).toHaveClass('ring-1');
      expect(card).toHaveClass('ring-slate-200');
    });

    it('should have dark mode styles', () => {
      const stats = [createMockStat()];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const card = container.querySelector('.rounded-xl');
      expect(card).toHaveClass('dark:bg-slate-900');
      expect(card).toHaveClass('dark:ring-slate-800');
    });

    it('should have relative positioning for potential overlays', () => {
      const stats = [createMockStat()];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const card = container.querySelector('.relative');
      expect(card).toBeInTheDocument();
    });

    it('should have overflow hidden for content containment', () => {
      const stats = [createMockStat()];

      const { container } = render(<DashboardMetrics stats={stats} />);

      const card = container.querySelector('.overflow-hidden');
      expect(card).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should use semantic HTML structure', () => {
      const stats = createStandardDashboardStats();

      render(<DashboardMetrics stats={stats} />);

      // Should use dl/dt/dd for definition lists
      const definitionLists = document.querySelectorAll('dl');
      expect(definitionLists.length).toBeGreaterThan(0);
    });

    it('should have accessible stat labels', () => {
      const stats = createStandardDashboardStats();

      render(<DashboardMetrics stats={stats} />);

      stats.forEach((stat) => {
        expect(screen.getByText(stat.label)).toBeVisible();
      });
    });

    it('should have accessible stat values', () => {
      const stats = createStandardDashboardStats();

      render(<DashboardMetrics stats={stats} />);

      stats.forEach((stat) => {
        expect(screen.getByText(String(stat.value))).toBeVisible();
      });
    });

    it('should use proper heading hierarchy within cards', () => {
      const stats = createStandardDashboardStats();

      render(<DashboardMetrics stats={stats} />);

      // Labels should be in dt elements (definition term)
      const dtElements = document.querySelectorAll('dt');
      expect(dtElements.length).toBe(stats.length);
    });

    it('should have sufficient color contrast', () => {
      const stats = createStandardDashboardStats();

      const { container } = render(<DashboardMetrics stats={stats} />);

      // Text elements should have appropriate contrast classes
      const primaryTexts = container.querySelectorAll('.text-slate-900');
      expect(primaryTexts.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // VALUE TYPES TESTS
  // ==========================================================================

  describe('Value Types', () => {
    it('should handle numeric values', () => {
      const stats = [createMockStat({ value: 42 })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should handle string values', () => {
      const stats = [createMockStat({ value: '156.5' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('156.5')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      const stats = [createMockStat({ value: 0 })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle large numeric values', () => {
      const stats = [createMockStat({ value: 1234567 })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('1234567')).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      const stats = [createMockStat({ value: '99.99' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('99.99')).toBeInTheDocument();
    });

    it('should handle formatted currency strings', () => {
      const stats = [createMockStat({ value: '$10,500.00' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('$10,500.00')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle very long labels', () => {
      const longLabel =
        'This is a very long stat label that might overflow the container';
      const stats = [createMockStat({ label: longLabel })];

      render(<DashboardMetrics stats={stats} />);

      const label = screen.getByText(longLabel);
      expect(label).toHaveClass('truncate');
    });

    it('should handle zero change value', () => {
      const stats = [createMockStat({ change: 0, trend: 'neutral' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle negative change with up trend', () => {
      // Edge case: negative change but labeled as up
      const stats = [createMockStat({ change: -5, trend: 'up' })];

      render(<DashboardMetrics stats={stats} />);

      // Should still show absolute value
      expect(screen.getByText('5%')).toBeInTheDocument();
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    });

    it('should handle empty label', () => {
      const stats = [createMockStat({ label: '' })];

      expect(() => render(<DashboardMetrics stats={stats} />)).not.toThrow();
    });

    it('should handle special characters in values', () => {
      const stats = [createMockStat({ value: '€1,000' })];

      render(<DashboardMetrics stats={stats} />);

      expect(screen.getByText('€1,000')).toBeInTheDocument();
    });

    it('should handle many stats without performance issues', () => {
      const stats = Array.from({ length: 20 }, (_, i) =>
        createMockStat({
          label: `Stat ${i + 1}`,
          value: i * 10,
        })
      );

      const startTime = performance.now();
      render(<DashboardMetrics stats={stats} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(500);
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for standard dashboard stats', () => {
      const stats = createStandardDashboardStats();

      const { container } = render(<DashboardMetrics stats={stats} />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for empty stats', () => {
      const { container } = render(<DashboardMetrics stats={[]} />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for single stat with all trend types', () => {
      const stats = [
        createMockStat({ label: 'Up Trend', trend: 'up', change: 15 }),
        createMockStat({ label: 'Down Trend', trend: 'down', change: -10 }),
        createMockStat({ label: 'Neutral', trend: 'neutral', change: 0 }),
      ];

      const { container } = render(<DashboardMetrics stats={stats} />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for all icon types', () => {
      const stats = [
        createMockStat({ label: 'Active Cases' }), // Briefcase
        createMockStat({ label: 'Pending Motions' }), // FileText
        createMockStat({ label: 'Billable Hours' }), // Clock
        createMockStat({ label: 'Risk Items' }), // AlertTriangle
      ];

      const { container } = render(<DashboardMetrics stats={stats} />);

      expect(container).toMatchSnapshot();
    });
  });
});
