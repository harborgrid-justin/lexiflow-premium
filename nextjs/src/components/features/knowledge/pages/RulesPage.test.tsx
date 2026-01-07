/**
 * @jest-environment jsdom
 * @module RulesPage.test
 * @description Enterprise-grade tests for RulesPage component
 *
 * Test coverage:
 * - Page rendering
 * - RulesDashboard integration
 * - onNavigate callback
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RulesPage } from './RulesPage';
import type { RulesView } from '@/config/tabs.config';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/knowledge/rules/RulesDashboard', () => ({
  RulesDashboard: ({ onNavigate }: { onNavigate: (view: RulesView) => void }) => (
    <div data-testid="rules-dashboard">
      <h1>Rules Dashboard</h1>
      <div data-testid="rules-content">
        <nav data-testid="rules-nav">
          <button onClick={() => onNavigate('federal')} data-testid="federal-btn">
            Federal Rules
          </button>
          <button onClick={() => onNavigate('state')} data-testid="state-btn">
            State Rules
          </button>
          <button onClick={() => onNavigate('local')} data-testid="local-btn">
            Local Rules
          </button>
        </nav>
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

describe('RulesPage', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders RulesDashboard component', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('rules-dashboard')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('rules-dashboard'));
    });

    it('displays rules dashboard heading', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rules Dashboard');
    });

    it('renders rules navigation', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('rules-nav')).toBeInTheDocument();
    });
  });

  describe('onNavigate Callback', () => {
    it('passes onNavigate to RulesDashboard', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('federal-btn')).toBeInTheDocument();
    });

    it('calls onNavigate with "federal" when Federal button clicked', async () => {
      const user = userEvent.setup();
      render(<RulesPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('federal-btn'));

      expect(mockOnNavigate).toHaveBeenCalledWith('federal');
    });

    it('calls onNavigate with "state" when State button clicked', async () => {
      const user = userEvent.setup();
      render(<RulesPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('state-btn'));

      expect(mockOnNavigate).toHaveBeenCalledWith('state');
    });

    it('calls onNavigate with "local" when Local button clicked', async () => {
      const user = userEvent.setup();
      render(<RulesPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('local-btn'));

      expect(mockOnNavigate).toHaveBeenCalledWith('local');
    });

    it('does not call onNavigate on initial render', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(mockOnNavigate).not.toHaveBeenCalled();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(RulesPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when onNavigate changes', () => {
      const { rerender } = render(<RulesPage onNavigate={mockOnNavigate} />);

      const newOnNavigate = jest.fn();
      rerender(<RulesPage onNavigate={newOnNavigate} />);

      expect(screen.getByTestId('rules-dashboard')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Navigation Buttons', () => {
    it('renders all navigation buttons', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(screen.getByText('Federal Rules')).toBeInTheDocument();
      expect(screen.getByText('State Rules')).toBeInTheDocument();
      expect(screen.getByText('Local Rules')).toBeInTheDocument();
    });

    it('all buttons are clickable', async () => {
      const user = userEvent.setup();
      render(<RulesPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByText('Federal Rules'));
      await user.click(screen.getByText('State Rules'));
      await user.click(screen.getByText('Local Rules'));

      expect(mockOnNavigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders navigation element', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('all navigation buttons are accessible', () => {
      render(<RulesPage onNavigate={mockOnNavigate} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });
});
