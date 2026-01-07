/**
 * @jest-environment jsdom
 * @module DiscoveryPage.test
 * @description Enterprise-grade tests for DiscoveryPage component
 *
 * Test coverage:
 * - Page rendering
 * - DiscoveryDashboard integration
 * - onNavigate callback
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscoveryPage } from './DiscoveryPage';
import type { DiscoveryView } from '@/hooks/useDiscoveryPlatform';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/litigation/discovery/dashboard/DiscoveryDashboard', () => {
  const MockDiscoveryDashboard = ({ onNavigate }: { onNavigate: (view: DiscoveryView, id?: string) => void }) => (
    <div data-testid="discovery-dashboard">
      <h1>Discovery Dashboard</h1>
      <div data-testid="discovery-content">
        <button onClick={() => onNavigate('overview')} data-testid="nav-overview">
          Overview
        </button>
        <button onClick={() => onNavigate('requests', 'req-123')} data-testid="nav-request">
          View Request
        </button>
        <button onClick={() => onNavigate('documents')} data-testid="nav-documents">
          Documents
        </button>
        <button onClick={() => onNavigate('custodians')} data-testid="nav-custodians">
          Custodians
        </button>
      </div>
    </div>
  );
  MockDiscoveryDashboard.displayName = 'DiscoveryDashboard';
  return MockDiscoveryDashboard;
});

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('DiscoveryPage', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders DiscoveryDashboard component', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('discovery-dashboard')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('discovery-dashboard'));
    });

    it('displays discovery dashboard heading', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Discovery Dashboard');
    });

    it('renders discovery content', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('discovery-content')).toBeInTheDocument();
    });
  });

  describe('onNavigate Callback', () => {
    it('passes onNavigate to DiscoveryDashboard', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('nav-overview')).toBeInTheDocument();
    });

    it('calls onNavigate with view only', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('nav-overview'));

      expect(mockOnNavigate).toHaveBeenCalledWith('overview');
    });

    it('calls onNavigate with view and id', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('nav-request'));

      expect(mockOnNavigate).toHaveBeenCalledWith('requests', 'req-123');
    });

    it('calls onNavigate for documents view', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('nav-documents'));

      expect(mockOnNavigate).toHaveBeenCalledWith('documents');
    });

    it('calls onNavigate for custodians view', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByTestId('nav-custodians'));

      expect(mockOnNavigate).toHaveBeenCalledWith('custodians');
    });

    it('does not call onNavigate on initial render', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(mockOnNavigate).not.toHaveBeenCalled();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(DiscoveryPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when onNavigate changes', () => {
      const { rerender } = render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      const newOnNavigate = jest.fn();
      rerender(<DiscoveryPage onNavigate={newOnNavigate} />);

      expect(screen.getByTestId('discovery-dashboard')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Navigation Buttons', () => {
    it('renders all navigation buttons', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('View Request')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Custodians')).toBeInTheDocument();
    });

    it('all buttons are clickable', async () => {
      const user = userEvent.setup();
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      await user.click(screen.getByText('Overview'));
      await user.click(screen.getByText('Documents'));
      await user.click(screen.getByText('Custodians'));

      expect(mockOnNavigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('renders heading element', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('all navigation buttons are accessible', () => {
      render(<DiscoveryPage onNavigate={mockOnNavigate} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });
  });
});
