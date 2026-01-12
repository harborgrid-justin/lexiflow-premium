/**
 * @jest-environment jsdom
 * MasterWorkflow Component Tests
 * Enterprise-grade tests for workflow automation management
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MasterWorkflow from './MasterWorkflow';

describe('MasterWorkflow', () => {
  describe('Rendering', () => {
    it('renders header with title', () => {
      render(<MasterWorkflow />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Workflow Automation');
    });

    it('renders subtitle', () => {
      render(<MasterWorkflow />);

      expect(screen.getByText(/Automate case processes/)).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<MasterWorkflow />);

      expect(screen.getByText('Sync Engine')).toBeInTheDocument();
      expect(screen.getByText('Run Automation')).toBeInTheDocument();
    });

    it('renders parent navigation tabs', () => {
      render(<MasterWorkflow />);

      expect(screen.getByText('Management')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
    });
  });

  describe('Case Workflows Tab', () => {
    it('renders Case Workflows by default', () => {
      render(<MasterWorkflow />);

      expect(screen.getByText('Active Case Workflows')).toBeInTheDocument();
    });

    it('displays workflow items', () => {
      render(<MasterWorkflow />);

      expect(screen.getByText(/Smith v. Jones - Discovery Phase/)).toBeInTheDocument();
    });

    it('shows workflow progress', () => {
      render(<MasterWorkflow />);

      expect(screen.getByText(/Progress: 45%/)).toBeInTheDocument();
    });

    it('shows Active badge', () => {
      render(<MasterWorkflow />);

      expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    });
  });

  describe('Firm Processes Tab', () => {
    it('switches to Firm Processes when clicked', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByText('Firm Processes'));

      expect(screen.getByText('Firm Processes')).toBeInTheDocument();
      expect(screen.getByText('New Client Onboarding')).toBeInTheDocument();
    });

    it('shows process trigger information', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByText('Firm Processes'));

      expect(screen.getByText(/Trigger: Client Created/)).toBeInTheDocument();
    });

    it('shows Enabled badge', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByText('Firm Processes'));

      expect(screen.getAllByText('Enabled').length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Tab', () => {
    it('switches to Analytics parent tab', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /analytics/i }));

      expect(screen.getByText('Workflow Analytics')).toBeInTheDocument();
    });

    it('displays metrics', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /analytics/i }));

      expect(screen.getByText('Active Workflows')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Tasks Due Today')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays automations ran count', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /analytics/i }));

      expect(screen.getByText('Automations Ran')).toBeInTheDocument();
      expect(screen.getByText('142')).toBeInTheDocument();
    });

    it('displays efficiency gain', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /analytics/i }));

      expect(screen.getByText('Efficiency Gain')).toBeInTheDocument();
      expect(screen.getByText('+24%')).toBeInTheDocument();
    });

    it('displays chart placeholder', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /analytics/i }));

      expect(screen.getByText('Chart Placeholder')).toBeInTheDocument();
    });
  });

  describe('Library Tab', () => {
    it('switches to Library parent tab', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /library/i }));

      expect(screen.getByText('Template Library')).toBeInTheDocument();
    });

    it('displays New Template button', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /library/i }));

      expect(screen.getByText('New Template')).toBeInTheDocument();
    });

    it('displays template cards', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /library/i }));

      expect(screen.getByText('Litigation Standard 1')).toBeInTheDocument();
      expect(screen.getByText(/Standard workflow for civil litigation/)).toBeInTheDocument();
    });

    it('shows multiple templates', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /library/i }));

      const templates = screen.getAllByText(/Litigation Standard/);
      expect(templates.length).toBeGreaterThan(1);
    });
  });

  describe('Detail View', () => {
    it('shows detail view when workflow clicked', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByText(/Smith v. Jones - Discovery Phase/));

      expect(screen.getByText('Case Workflow Detail')).toBeInTheDocument();
      expect(screen.getByText(/Details for case ID:/)).toBeInTheDocument();
    });

    it('shows Back button in detail view', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByText(/Smith v. Jones - Discovery Phase/));

      expect(screen.getByText(/← Back/)).toBeInTheDocument();
    });

    it('returns to list when Back clicked', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByText(/Smith v. Jones - Discovery Phase/));
      expect(screen.getByText('Case Workflow Detail')).toBeInTheDocument();

      await user.click(screen.getByText(/← Back/));

      expect(screen.getByText('Active Case Workflows')).toBeInTheDocument();
    });

    it('shows workflow visualizer placeholder', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByText(/Smith v. Jones - Discovery Phase/));

      expect(screen.getByText('Workflow Visualizer Placeholder')).toBeInTheDocument();
    });
  });

  describe('Builder View', () => {
    it('shows builder when New Template clicked', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /library/i }));
      await user.click(screen.getByText('New Template'));

      expect(screen.getByText('Workflow Builder')).toBeInTheDocument();
    });

    it('shows drag and drop canvas placeholder', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /library/i }));
      await user.click(screen.getByText('New Template'));

      expect(screen.getByText('Drag and Drop Canvas Placeholder')).toBeInTheDocument();
    });

    it('returns to list from builder', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      await user.click(screen.getByRole('button', { name: /library/i }));
      await user.click(screen.getByText('New Template'));
      await user.click(screen.getByText(/← Back/));

      expect(screen.getByText('Template Library')).toBeInTheDocument();
    });
  });

  describe('Sub-Navigation', () => {
    it('shows sub-tabs for Management', () => {
      render(<MasterWorkflow />);

      expect(screen.getByText('Case Workflows')).toBeInTheDocument();
      expect(screen.getByText('Firm Processes')).toBeInTheDocument();
    });

    it('highlights active sub-tab', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      const firmProcessesTab = screen.getByText('Firm Processes').closest('button');
      await user.click(firmProcessesTab!);

      expect(firmProcessesTab).toHaveClass('bg-slate-100');
    });
  });

  describe('Initial Tab', () => {
    it('respects initialTab prop', () => {
      render(<MasterWorkflow initialTab="templates" />);

      expect(screen.getByText('Template Library')).toBeInTheDocument();
    });
  });

  describe('Parent Tab Navigation', () => {
    it('switches sub-tabs when parent tab changes', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      // Start at Management -> Case Workflows
      expect(screen.getByText('Active Case Workflows')).toBeInTheDocument();

      // Switch to Analytics
      await user.click(screen.getByRole('button', { name: /analytics/i }));

      // Should show Dashboard sub-tab content
      expect(screen.getByText('Workflow Analytics')).toBeInTheDocument();
    });

    it('highlights active parent tab', async () => {
      const user = userEvent.setup();
      render(<MasterWorkflow />);

      const analyticsTab = screen.getByRole('button', { name: /analytics/i });
      await user.click(analyticsTab);

      expect(analyticsTab).toHaveClass('border-blue-600');
    });
  });

  describe('Styling', () => {
    it('applies proper layout classes', () => {
      const { container } = render(<MasterWorkflow />);

      expect(container.querySelector('.h-full')).toBeInTheDocument();
      expect(container.querySelector('.flex-col')).toBeInTheDocument();
    });

    it('has scrollable content area', () => {
      const { container } = render(<MasterWorkflow />);

      expect(container.querySelector('.overflow-y-auto')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders Sync Engine button', () => {
      render(<MasterWorkflow />);

      const syncButton = screen.getByText('Sync Engine').closest('button');
      expect(syncButton).toBeInTheDocument();
    });

    it('renders Run Automation button', () => {
      render(<MasterWorkflow />);

      const runButton = screen.getByText('Run Automation').closest('button');
      expect(runButton).toBeInTheDocument();
    });
  });
});
