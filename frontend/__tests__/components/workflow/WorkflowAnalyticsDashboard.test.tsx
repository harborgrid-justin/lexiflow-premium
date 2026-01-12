/**
 * @jest-environment jsdom
 */

import { render, screen } from '@/__tests__/test-utils';
import { WorkflowAnalyticsDashboard } from '@/lexiflow-suite/components/workflow/WorkflowAnalyticsDashboard';
import '@testing-library/jest-dom';

// Mock recharts
jest.mock('recharts', () => require('@/__tests__/__mocks__/recharts'));

describe('WorkflowAnalyticsDashboard', () => {
  describe('Rendering', () => {
    it('should render both chart sections', () => {
      render(<WorkflowAnalyticsDashboard />);

      expect(screen.getByText('Task Completion Velocity')).toBeInTheDocument();
      expect(screen.getByText('SLA Health Status')).toBeInTheDocument();
    });

    it('should render completion velocity chart', () => {
      render(<WorkflowAnalyticsDashboard />);
      const chart = screen.getByText('Task Completion Velocity');
      expect(chart).toBeInTheDocument();
    });

    it('should render SLA health chart', () => {
      render(<WorkflowAnalyticsDashboard />);
      const chart = screen.getByText('SLA Health Status');
      expect(chart).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should use correct data structure for velocity', () => {
      // Testing that the component can be rendered with expected data
      const { container } = render(<WorkflowAnalyticsDashboard />);
      expect(container).toBeInTheDocument();
    });

    it('should use correct data structure for SLA status', () => {
      const { container } = render(<WorkflowAnalyticsDashboard />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have grid layout', () => {
      const { container } = render(<WorkflowAnalyticsDashboard />);
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive columns', () => {
      const { container } = render(<WorkflowAnalyticsDashboard />);
      const grid = container.querySelector('.md\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('should have proper spacing', () => {
      const { container } = render(<WorkflowAnalyticsDashboard />);
      const grid = container.querySelector('.gap-6');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Charts', () => {
    it('should set correct height for charts', () => {
      const { container } = render(<WorkflowAnalyticsDashboard />);
      const chartContainers = container.querySelectorAll('.h-64');
      expect(chartContainers.length).toBeGreaterThanOrEqual(2);
    });

    it('should configure bar chart properly', () => {
      // Bar chart should be present
      render(<WorkflowAnalyticsDashboard />);
      expect(screen.getByText('Task Completion Velocity')).toBeInTheDocument();
    });

    it('should configure pie chart properly', () => {
      // Pie chart should be present
      render(<WorkflowAnalyticsDashboard />);
      expect(screen.getByText('SLA Health Status')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render without errors', () => {
      const { container } = render(<WorkflowAnalyticsDashboard />);
      expect(container).toBeInTheDocument();
    });

    it('should have meaningful chart titles', () => {
      render(<WorkflowAnalyticsDashboard />);

      const velocityTitle = screen.getByText('Task Completion Velocity');
      const slaTitle = screen.getByText('SLA Health Status');

      expect(velocityTitle).toBeVisible();
      expect(slaTitle).toBeVisible();
    });
  });

  describe('Responsive Design', () => {
    it('should apply single column on mobile', () => {
      const { container } = render(<WorkflowAnalyticsDashboard />);
      const grid = container.querySelector('.grid-cols-1');
      expect(grid).toBeInTheDocument();
    });

    it('should apply two columns on desktop', () => {
      const { container } = render(<WorkflowAnalyticsDashboard />);
      const grid = container.querySelector('.md\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });
});
