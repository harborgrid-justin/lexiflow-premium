/**
 * @jest-environment jsdom
 * @module EvidencePage.test
 * @description Enterprise-grade tests for EvidencePage component
 *
 * Test coverage:
 * - Page rendering
 * - EvidenceDashboard integration
 * - onNavigate callback
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EvidencePage } from './EvidencePage';
import type { ViewMode } from '@/hooks/useEvidenceManager';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/litigation/evidence/EvidenceDashboard', () => ({
  EvidenceDashboard: ({ onNavigate }: { onNavigate: (view: ViewMode) => void }) => (
    <div data-testid="evidence-dashboard">
      <h1>Evidence Vault</h1>
      <div data-testid="evidence-content">
        <button onClick={() => onNavigate('grid')} data-testid="nav-grid">
          Grid View
        </button>
        <button onClick={() => onNavigate('list')} data-testid="nav-list">
          List View
        </button>
        <button onClick={() => onNavigate('detail')} data-testid="nav-detail">
          Detail View
        </button>
      </div>
      <div data-testid="chain-of-custody">
        Chain of Custody Tracking
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

describe('EvidencePage', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders EvidenceDashboard component', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('evidence-dashboard')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('evidence-dashboard'));
    });

    it('displays evidence vault heading', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Evidence Vault');
    });

    it('renders evidence content', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('evidence-content')).toBeInTheDocument();
    });

    it('renders chain of custody section', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('chain-of-custody')).toBeInTheDocument();
      expect(screen.getByText('Chain of Custody Tracking')).toBeInTheDocument();
    });
  });

  describe('onNavigate Callback', () => {
    it('passes onNavigate to EvidenceDashboard', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('nav-grid')).toBeInTheDocument();
    });

    it('calls onNavigate with "grid" view', async () => {
      const user = userEvent.setup();
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('nav-grid'));

      expect(mockOnNavigate).toHaveBeenCalledWith('grid');
    });

    it('calls onNavigate with "list" view', async () => {
      const user = userEvent.setup();
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('nav-list'));

      expect(mockOnNavigate).toHaveBeenCalledWith('list');
    });

    it('calls onNavigate with "detail" view', async () => {
      const user = userEvent.setup();
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('nav-detail'));

      expect(mockOnNavigate).toHaveBeenCalledWith('detail');
    });

    it('does not call onNavigate on initial render', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(mockOnNavigate).not.toHaveBeenCalled();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(EvidencePage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when onNavigate changes', () => {
      const { rerender } = render(<EvidencePage onNavigate={mockOnNavigate} />);

      const newOnNavigate = jest.fn();
      rerender(<EvidencePage onNavigate={newOnNavigate} />);

      expect(screen.getByTestId('evidence-dashboard')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('View Mode Buttons', () => {
    it('renders all view mode buttons', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(screen.getByText('Grid View')).toBeInTheDocument();
      expect(screen.getByText('List View')).toBeInTheDocument();
      expect(screen.getByText('Detail View')).toBeInTheDocument();
    });

    it('all buttons are clickable', async () => {
      const user = userEvent.setup();
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByText('Grid View'));
      await user.click(screen.getByText('List View'));
      await user.click(screen.getByText('Detail View'));

      expect(mockOnNavigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('all view mode buttons are accessible', () => {
      render(<EvidencePage onNavigate={mockOnNavigate} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });
});
