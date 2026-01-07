/**
 * @fileoverview Enterprise-grade tests for LitigationStrategyView component
 * @module components/litigation-strategy/LitigationStrategyView.test
 *
 * Tests header, tab navigation, action buttons, and sub-view rendering.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LitigationStrategyView } from './LitigationStrategyView';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Rocket: () => <svg data-testid="rocket-icon" />,
  Save: () => <svg data-testid="save-icon" />,
}));

// Mock Button component
jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// Mock Tabs component
jest.mock('@/components/ui/molecules/Tabs/Tabs', () => ({
  Tabs: ({ tabs, activeTab, onChange }: any) => (
    <div data-testid="tabs">
      {tabs.map((tab: any) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          data-active={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

// Mock child view components
jest.mock('./StrategyCanvas', () => ({
  StrategyCanvas: () => <div data-testid="strategy-canvas">Strategy Canvas Content</div>,
}));

jest.mock('./LitigationScheduleView', () => ({
  LitigationScheduleView: () => <div data-testid="litigation-schedule-view">Schedule View Content</div>,
}));

jest.mock('./PlaybookLibrary', () => ({
  PlaybookLibrary: () => <div data-testid="playbook-library">Playbook Library Content</div>,
}));

jest.mock('./OutcomeSimulator', () => ({
  OutcomeSimulator: () => <div data-testid="outcome-simulator">Outcome Simulator Content</div>,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('LitigationStrategyView', () => {
  describe('Header', () => {
    it('renders the Litigation Strategy title', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByRole('heading', { name: /litigation strategy/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByText(/design case lifecycles and visualize timelines/i)).toBeInTheDocument();
    });

    it('title has correct styling', () => {
      render(<LitigationStrategyView />);
      const title = screen.getByRole('heading', { name: /litigation strategy/i });
      expect(title).toHaveClass('text-2xl', 'font-bold');
    });
  });

  // ============================================================================
  // ACTION BUTTONS TESTS
  // ============================================================================

  describe('Action Buttons', () => {
    it('renders Save Draft button', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
    });

    it('renders Deploy Strategy button', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByRole('button', { name: /deploy strategy/i })).toBeInTheDocument();
    });

    it('Save Draft button has outline variant', () => {
      render(<LitigationStrategyView />);
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      expect(saveButton).toHaveAttribute('data-variant', 'outline');
    });

    it('renders Save icon', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByTestId('save-icon')).toBeInTheDocument();
    });

    it('renders Rocket icon', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('renders Tabs component', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('renders Strategy Canvas tab', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByRole('button', { name: /strategy canvas/i })).toBeInTheDocument();
    });

    it('renders Timeline tab', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByRole('button', { name: /timeline/i })).toBeInTheDocument();
    });

    it('renders Playbooks tab', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByRole('button', { name: /playbooks/i })).toBeInTheDocument();
    });

    it('renders Simulation tab', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByRole('button', { name: /simulation/i })).toBeInTheDocument();
    });

    it('Strategy Canvas tab is active by default', () => {
      render(<LitigationStrategyView />);
      const canvasTab = screen.getByRole('button', { name: /strategy canvas/i });
      expect(canvasTab).toHaveAttribute('data-active', 'true');
    });
  });

  // ============================================================================
  // TAB CONTENT TESTS
  // ============================================================================

  describe('Tab Content', () => {
    it('renders Strategy Canvas view by default', () => {
      render(<LitigationStrategyView />);
      expect(screen.getByTestId('strategy-canvas')).toBeInTheDocument();
    });

    it('switches to Timeline view when clicked', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /timeline/i }));

      expect(screen.getByTestId('litigation-schedule-view')).toBeInTheDocument();
    });

    it('switches to Playbooks view when clicked', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /playbooks/i }));

      expect(screen.getByTestId('playbook-library')).toBeInTheDocument();
    });

    it('switches to Simulation view when clicked', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /simulation/i }));

      expect(screen.getByTestId('outcome-simulator')).toBeInTheDocument();
    });

    it('hides Strategy Canvas when switching to Timeline', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /timeline/i }));

      expect(screen.queryByTestId('strategy-canvas')).not.toBeInTheDocument();
    });

    it('can switch back to Strategy Canvas', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /timeline/i }));
      await user.click(screen.getByRole('button', { name: /strategy canvas/i }));

      expect(screen.getByTestId('strategy-canvas')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB ACTIVE STATE TESTS
  // ============================================================================

  describe('Tab Active State', () => {
    it('updates active state when Timeline tab clicked', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /timeline/i }));

      const timelineTab = screen.getByRole('button', { name: /timeline/i });
      expect(timelineTab).toHaveAttribute('data-active', 'true');
    });

    it('updates active state when Playbooks tab clicked', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /playbooks/i }));

      const playbooksTab = screen.getByRole('button', { name: /playbooks/i });
      expect(playbooksTab).toHaveAttribute('data-active', 'true');
    });

    it('updates active state when Simulation tab clicked', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /simulation/i }));

      const simulationTab = screen.getByRole('button', { name: /simulation/i });
      expect(simulationTab).toHaveAttribute('data-active', 'true');
    });

    it('previous tab becomes inactive when new tab selected', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      await user.click(screen.getByRole('button', { name: /timeline/i }));

      const canvasTab = screen.getByRole('button', { name: /strategy canvas/i });
      expect(canvasTab).toHaveAttribute('data-active', 'false');
    });
  });

  // ============================================================================
  // STYLING TESTS
  // ============================================================================

  describe('Styling', () => {
    it('container has full height', () => {
      const { container } = render(<LitigationStrategyView />);
      expect(container.firstChild).toHaveClass('h-full');
    });

    it('container uses flex column layout', () => {
      const { container } = render(<LitigationStrategyView />);
      expect(container.firstChild).toHaveClass('flex', 'flex-col');
    });

    it('container has padding', () => {
      const { container } = render(<LitigationStrategyView />);
      expect(container.firstChild).toHaveClass('p-6');
    });

    it('container has vertical spacing', () => {
      const { container } = render(<LitigationStrategyView />);
      expect(container.firstChild).toHaveClass('space-y-6');
    });

    it('header uses flex justify-between', () => {
      render(<LitigationStrategyView />);
      const header = screen.getByRole('heading', { name: /litigation strategy/i }).closest('div.flex');
      expect(header).toHaveClass('justify-between', 'items-center');
    });

    it('action buttons container has gap', () => {
      render(<LitigationStrategyView />);
      const deployButton = screen.getByRole('button', { name: /deploy strategy/i });
      const buttonContainer = deployButton.parentElement;
      expect(buttonContainer).toHaveClass('gap-2');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<LitigationStrategyView />);
      const title = screen.getByRole('heading', { name: /litigation strategy/i });
      expect(title).toHaveClass('dark:text-slate-100');
    });

    it('applies dark mode classes to description', () => {
      render(<LitigationStrategyView />);
      const description = screen.getByText(/design case lifecycles/i);
      expect(description).toHaveClass('dark:text-slate-400');
    });
  });

  // ============================================================================
  // CONTENT AREA TESTS
  // ============================================================================

  describe('Content Area', () => {
    it('content area uses flex-1 for expansion', () => {
      render(<LitigationStrategyView />);
      const contentArea = screen.getByTestId('strategy-canvas').parentElement;
      expect(contentArea).toHaveClass('flex-1');
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration', () => {
    it('renders complete view with all elements', () => {
      render(<LitigationStrategyView />);

      // Header
      expect(screen.getByRole('heading', { name: /litigation strategy/i })).toBeInTheDocument();
      expect(screen.getByText(/design case lifecycles/i)).toBeInTheDocument();

      // Actions
      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deploy strategy/i })).toBeInTheDocument();

      // Tabs
      expect(screen.getByTestId('tabs')).toBeInTheDocument();

      // Content
      expect(screen.getByTestId('strategy-canvas')).toBeInTheDocument();
    });

    it('navigates through all tabs correctly', async () => {
      const user = userEvent.setup();
      render(<LitigationStrategyView />);

      // Start at Strategy Canvas
      expect(screen.getByTestId('strategy-canvas')).toBeInTheDocument();

      // Navigate to Timeline
      await user.click(screen.getByRole('button', { name: /timeline/i }));
      expect(screen.getByTestId('litigation-schedule-view')).toBeInTheDocument();

      // Navigate to Playbooks
      await user.click(screen.getByRole('button', { name: /playbooks/i }));
      expect(screen.getByTestId('playbook-library')).toBeInTheDocument();

      // Navigate to Simulation
      await user.click(screen.getByRole('button', { name: /simulation/i }));
      expect(screen.getByTestId('outcome-simulator')).toBeInTheDocument();

      // Navigate back to Strategy Canvas
      await user.click(screen.getByRole('button', { name: /strategy canvas/i }));
      expect(screen.getByTestId('strategy-canvas')).toBeInTheDocument();
    });
  });
});
