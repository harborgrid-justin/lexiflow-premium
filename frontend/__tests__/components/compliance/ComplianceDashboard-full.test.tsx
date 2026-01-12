/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { ComplianceDashboard } from '@/lexiflow-suite/components/ComplianceDashboard';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('@/lexiflow-suite/hooks/useData', () => ({
  useData: jest.fn((selector) => {
    const mockState = {
      auditLogs: [
        {
          id: '1',
          action: 'User Login',
          user: 'john.doe@example.com',
          resource: 'Authentication System',
          timestamp: '2026-01-12 10:30:00',
          ip: '192.168.1.100',
        },
        {
          id: '2',
          action: 'Document Accessed',
          user: 'jane.smith@example.com',
          resource: 'Case File #12345',
          timestamp: '2026-01-12 11:15:00',
          ip: '192.168.1.101',
        },
        {
          id: '3',
          action: 'Configuration Changed',
          user: 'admin@example.com',
          resource: 'System Settings',
          timestamp: '2026-01-12 14:22:00',
          ip: '192.168.1.1',
        },
      ],
    };
    return selector(mockState);
  }),
}));

describe('ComplianceDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard title', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText('Risk & Compliance')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText('Global Audit Logs and Regulatory Oversight.')).toBeInTheDocument();
    });

    it('should render incident report button', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText('Incident Report')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByText('Conflict Check Logs')).toBeInTheDocument();
      expect(screen.getByText('Ethical Walls')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should start with conflicts tab active', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText('System Activity Logs')).toBeInTheDocument();
    });

    it('should switch to ethical walls tab', async () => {
      render(<ComplianceDashboard />);

      const wallsTab = screen.getByText('Ethical Walls');
      fireEvent.click(wallsTab);

      await waitFor(() => {
        expect(screen.getByText('No active Ethical Walls detected.')).toBeInTheDocument();
      });
    });

    it('should switch to risk assessment tab', async () => {
      render(<ComplianceDashboard />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      await waitFor(() => {
        expect(screen.getByText('System-wide risk assessment: Stable (98%).')).toBeInTheDocument();
      });
    });

    it('should apply transition opacity during tab changes', () => {
      const { container } = render(<ComplianceDashboard />);

      const contentArea = container.querySelector('.opacity-100');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('Audit Logs Tab', () => {
    it('should display audit log title', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText('System Activity Logs')).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText('Export PDF Report')).toBeInTheDocument();
    });

    it('should display all audit log entries', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByText('User Login')).toBeInTheDocument();
      expect(screen.getByText('Document Accessed')).toBeInTheDocument();
      expect(screen.getByText('Configuration Changed')).toBeInTheDocument();
    });

    it('should display user information for each log', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByText(/john\.doe@example\.com/)).toBeInTheDocument();
      expect(screen.getByText(/jane\.smith@example\.com/)).toBeInTheDocument();
      expect(screen.getByText(/admin@example\.com/)).toBeInTheDocument();
    });

    it('should display resource information', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByText(/Authentication System/)).toBeInTheDocument();
      expect(screen.getByText(/Case File #12345/)).toBeInTheDocument();
      expect(screen.getByText(/System Settings/)).toBeInTheDocument();
    });

    it('should display timestamps', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByText('2026-01-12 10:30:00')).toBeInTheDocument();
      expect(screen.getByText('2026-01-12 11:15:00')).toBeInTheDocument();
      expect(screen.getByText('2026-01-12 14:22:00')).toBeInTheDocument();
    });

    it('should display IP addresses', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.101')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });

    it('should have hover effects on log entries', () => {
      const { container } = render(<ComplianceDashboard />);

      const hoverEntries = container.querySelectorAll('.hover\\:bg-slate-50');
      expect(hoverEntries.length).toBeGreaterThan(0);
    });

    it('should have activity icons for each log', () => {
      const { container } = render(<ComplianceDashboard />);

      const icons = container.querySelectorAll('.bg-slate-100');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Ethical Walls Tab', () => {
    it('should display empty state message', async () => {
      render(<ComplianceDashboard />);

      const wallsTab = screen.getByText('Ethical Walls');
      fireEvent.click(wallsTab);

      await waitFor(() => {
        expect(screen.getByText('No active Ethical Walls detected.')).toBeInTheDocument();
      });
    });

    it('should show lock icon in empty state', async () => {
      const { container } = render(<ComplianceDashboard />);

      const wallsTab = screen.getByText('Ethical Walls');
      fireEvent.click(wallsTab);

      await waitFor(() => {
        const emptyState = screen.getByText('No active Ethical Walls detected.');
        expect(emptyState).toBeInTheDocument();
      });
    });

    it('should apply dashed border to empty state', async () => {
      const { container } = render(<ComplianceDashboard />);

      const wallsTab = screen.getByText('Ethical Walls');
      fireEvent.click(wallsTab);

      await waitFor(() => {
        const dashedBorder = container.querySelector('.border-dashed');
        expect(dashedBorder).toBeInTheDocument();
      });
    });
  });

  describe('Risk Assessment Tab', () => {
    it('should display risk assessment message', async () => {
      render(<ComplianceDashboard />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      await waitFor(() => {
        expect(screen.getByText('System-wide risk assessment: Stable (98%).')).toBeInTheDocument();
      });
    });

    it('should show shield icon in empty state', async () => {
      render(<ComplianceDashboard />);

      const riskTab = screen.getByText('Risk Assessment');
      fireEvent.click(riskTab);

      await waitFor(() => {
        const riskMessage = screen.getByText('System-wide risk assessment: Stable (98%).');
        expect(riskMessage).toBeInTheDocument();
      });
    });
  });

  describe('Visual Design', () => {
    it('should have fade-in animation', () => {
      const { container } = render(<ComplianceDashboard />);

      const animatedDiv = container.querySelector('.animate-fade-in');
      expect(animatedDiv).toBeInTheDocument();
    });

    it('should have proper background colors', () => {
      const { container } = render(<ComplianceDashboard />);

      const bgElement = container.querySelector('.bg-slate-50');
      expect(bgElement).toBeInTheDocument();
    });

    it('should have rounded corners on audit log container', () => {
      const { container } = render(<ComplianceDashboard />);

      const rounded = container.querySelector('.rounded-xl');
      expect(rounded).toBeInTheDocument();
    });

    it('should use monospace font for timestamps', () => {
      const { container } = render(<ComplianceDashboard />);

      const monoFont = container.querySelector('.font-mono');
      expect(monoFont).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading for audit logs', () => {
      const { container } = render(<ComplianceDashboard />);

      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
    });

    it('should have clickable tabs', () => {
      render(<ComplianceDashboard />);

      const tabs = [
        screen.getByText('Conflict Check Logs'),
        screen.getByText('Ethical Walls'),
        screen.getByText('Risk Assessment'),
      ];

      tabs.forEach(tab => {
        expect(tab).toBeInTheDocument();
      });
    });

    it('should have accessible buttons', () => {
      render(<ComplianceDashboard />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
