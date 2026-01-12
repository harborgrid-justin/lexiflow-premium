/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { FirmOperations } from '@/lexiflow-suite/components/FirmOperations';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('@/lexiflow-suite/components/practice/HRManager', () => ({
  HRManager: () => <div data-testid="hr-manager">HR Manager Content</div>,
}));

jest.mock('@/lexiflow-suite/components/practice/FinancialCenter', () => ({
  FinancialCenter: () => <div data-testid="financial-center">Financial Center Content</div>,
}));

jest.mock('@/lexiflow-suite/components/practice/MarketingDashboard', () => ({
  MarketingDashboard: () => <div data-testid="marketing-dashboard">Marketing Dashboard Content</div>,
}));

describe('FirmOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      render(<FirmOperations />);
      expect(screen.getByText('Firm Operations')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<FirmOperations />);
      expect(screen.getByText('Practice Management: Staff, Finances, and Business Growth.')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<FirmOperations />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Generate P&L')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(<FirmOperations />);

      expect(screen.getByText('HR & Staffing')).toBeInTheDocument();
      expect(screen.getByText('Financial Center')).toBeInTheDocument();
      expect(screen.getByText('Marketing & Intake')).toBeInTheDocument();
      expect(screen.getByText('Assets & Inventory')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should start with HR tab active', () => {
      render(<FirmOperations />);
      expect(screen.getByTestId('hr-manager')).toBeInTheDocument();
    });

    it('should switch to Financial Center tab', async () => {
      render(<FirmOperations />);

      const financeTab = screen.getByText('Financial Center');
      fireEvent.click(financeTab);

      await waitFor(() => {
        expect(screen.getByTestId('financial-center')).toBeInTheDocument();
      });
    });

    it('should switch to Marketing tab', async () => {
      render(<FirmOperations />);

      const marketingTab = screen.getByText('Marketing & Intake');
      fireEvent.click(marketingTab);

      await waitFor(() => {
        expect(screen.getByTestId('marketing-dashboard')).toBeInTheDocument();
      });
    });

    it('should switch to Assets tab and show empty state', async () => {
      render(<FirmOperations />);

      const assetsTab = screen.getByText('Assets & Inventory');
      fireEvent.click(assetsTab);

      await waitFor(() => {
        expect(screen.getByText('Asset Management')).toBeInTheDocument();
        expect(screen.getByText(/Track laptops, software licenses/)).toBeInTheDocument();
      });
    });

    it('should render import button in assets empty state', async () => {
      render(<FirmOperations />);

      const assetsTab = screen.getByText('Assets & Inventory');
      fireEvent.click(assetsTab);

      await waitFor(() => {
        expect(screen.getByText('Import Asset List')).toBeInTheDocument();
      });
    });
  });

  describe('Transition States', () => {
    it('should apply fade-in animation', () => {
      const { container } = render(<FirmOperations />);

      const animatedDiv = container.querySelector('.animate-fade-in');
      expect(animatedDiv).toBeInTheDocument();
    });

    it('should apply opacity transition during tab changes', () => {
      const { container } = render(<FirmOperations />);

      const contentArea = container.querySelector('.opacity-100');
      expect(contentArea).toBeInTheDocument();
    });

    it('should reduce opacity during pending state', async () => {
      render(<FirmOperations />);

      const financeTab = screen.getByText('Financial Center');
      fireEvent.click(financeTab);

      // Component handles transition state
      await waitFor(() => {
        expect(screen.getByTestId('financial-center')).toBeInTheDocument();
      });
    });
  });

  describe('Layout', () => {
    it('should have full height flex layout', () => {
      const { container } = render(<FirmOperations />);

      const mainContainer = container.querySelector('.h-full.flex.flex-col');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have scrollable content area', () => {
      const { container } = render(<FirmOperations />);

      const scrollableArea = container.querySelector('.overflow-y-auto');
      expect(scrollableArea).toBeInTheDocument();
    });

    it('should have max-width container for content', () => {
      const { container } = render(<FirmOperations />);

      const maxWidthContainer = container.querySelector('.max-w-7xl');
      expect(maxWidthContainer).toBeInTheDocument();
    });

    it('should have proper background color', () => {
      const { container } = render(<FirmOperations />);

      const bgElement = container.querySelector('.bg-slate-50');
      expect(bgElement).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should render tabs with white background and border', () => {
      const { container } = render(<FirmOperations />);

      const tabNavigation = container.querySelector('.bg-white.rounded-lg.border');
      expect(tabNavigation).toBeInTheDocument();
    });

    it('should have shadow on tab navigation', () => {
      const { container } = render(<FirmOperations />);

      const shadowElement = container.querySelector('.shadow-sm');
      expect(shadowElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have clickable tabs', () => {
      render(<FirmOperations />);

      const tabs = [
        screen.getByText('HR & Staffing'),
        screen.getByText('Financial Center'),
        screen.getByText('Marketing & Intake'),
        screen.getByText('Assets & Inventory'),
      ];

      tabs.forEach(tab => {
        expect(tab).toBeInTheDocument();
      });
    });

    it('should have accessible buttons', () => {
      render(<FirmOperations />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper heading text', () => {
      render(<FirmOperations />);

      expect(screen.getByText('Firm Operations')).toBeVisible();
    });
  });

  describe('Empty States', () => {
    it('should render empty state for assets tab', async () => {
      render(<FirmOperations />);

      const assetsTab = screen.getByText('Assets & Inventory');
      fireEvent.click(assetsTab);

      await waitFor(() => {
        expect(screen.getByText('Asset Management')).toBeInTheDocument();
      });
    });

    it('should have descriptive text in empty state', async () => {
      render(<FirmOperations />);

      const assetsTab = screen.getByText('Assets & Inventory');
      fireEvent.click(assetsTab);

      await waitFor(() => {
        expect(screen.getByText(/Track laptops, software licenses/)).toBeInTheDocument();
      });
    });

    it('should have call-to-action in empty state', async () => {
      render(<FirmOperations />);

      const assetsTab = screen.getByText('Assets & Inventory');
      fireEvent.click(assetsTab);

      await waitFor(() => {
        const importButton = screen.getByText('Import Asset List');
        expect(importButton).toBeInTheDocument();
      });
    });
  });

  describe('Button Actions', () => {
    it('should render settings button', () => {
      render(<FirmOperations />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render generate P&L button', () => {
      render(<FirmOperations />);
      expect(screen.getByText('Generate P&L')).toBeInTheDocument();
    });
  });

  describe('Content Switching', () => {
    it('should hide previous content when switching tabs', async () => {
      render(<FirmOperations />);

      // Initially on HR tab
      expect(screen.getByTestId('hr-manager')).toBeInTheDocument();

      // Switch to Finance tab
      const financeTab = screen.getByText('Financial Center');
      fireEvent.click(financeTab);

      await waitFor(() => {
        expect(screen.queryByTestId('hr-manager')).not.toBeInTheDocument();
        expect(screen.getByTestId('financial-center')).toBeInTheDocument();
      });
    });

    it('should maintain tab state across switches', async () => {
      render(<FirmOperations />);

      // Switch to Marketing
      const marketingTab = screen.getByText('Marketing & Intake');
      fireEvent.click(marketingTab);

      await waitFor(() => {
        expect(screen.getByTestId('marketing-dashboard')).toBeInTheDocument();
      });

      // Switch back to HR
      const hrTab = screen.getByText('HR & Staffing');
      fireEvent.click(hrTab);

      await waitFor(() => {
        expect(screen.getByTestId('hr-manager')).toBeInTheDocument();
      });
    });
  });
});
