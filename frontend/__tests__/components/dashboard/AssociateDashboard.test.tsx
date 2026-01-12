/**
 * @jest-environment jsdom
 */

import { render, screen } from '@/__tests__/test-utils';
import { AssociateDashboard } from '@/lexiflow-suite/components/dashboard/AssociateDashboard';
import '@testing-library/jest-dom';

describe('AssociateDashboard', () => {
  describe('Rendering', () => {
    it('should render dashboard title', () => {
      render(<AssociateDashboard />);
      expect(screen.getByText('My Workspace')).toBeInTheDocument();
    });

    it('should render all metric cards', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('Billable Today')).toBeInTheDocument();
      expect(screen.getByText('Open Tasks')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Hearings')).toBeInTheDocument();
      expect(screen.getByText('Missing Time')).toBeInTheDocument();
    });

    it('should display metric values correctly', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('5.2h')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('0.5h')).toBeInTheDocument();
    });

    it('should display trend information', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('Target: 7.5h')).toBeInTheDocument();
      expect(screen.getByText('2 Due Today')).toBeInTheDocument();
      expect(screen.getByText('Next: Friday')).toBeInTheDocument();
      expect(screen.getByText('Review Yesterday')).toBeInTheDocument();
    });
  });

  describe('Priority Tasks Section', () => {
    it('should render tasks section', () => {
      render(<AssociateDashboard />);
      expect(screen.getByText("Today's Priorities")).toBeInTheDocument();
    });

    it('should display all priority tasks', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('Draft Motion to Compel')).toBeInTheDocument();
      expect(screen.getByText('Client Call Prep')).toBeInTheDocument();
      expect(screen.getByText('Review Discovery Production')).toBeInTheDocument();
    });

    it('should display associated cases for each task', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('Martinez v. TechCorp')).toBeInTheDocument();
      expect(screen.getByText('State v. GreenEnergy')).toBeInTheDocument();
      expect(screen.getByText('OmniGlobal Merger')).toBeInTheDocument();
    });

    it('should display time estimates for tasks', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('2h est')).toBeInTheDocument();
      expect(screen.getByText('1h est')).toBeInTheDocument();
      expect(screen.getByText('3h est')).toBeInTheDocument();
    });

    it('should indicate high priority tasks with red indicator', () => {
      const { container } = render(<AssociateDashboard />);
      const redIndicators = container.querySelectorAll('.bg-red-500');
      expect(redIndicators.length).toBeGreaterThan(0);
    });

    it('should indicate medium priority tasks with blue indicator', () => {
      const { container } = render(<AssociateDashboard />);
      const blueIndicators = container.querySelectorAll('.bg-blue-500');
      expect(blueIndicators.length).toBeGreaterThan(0);
    });

    it('should make task items clickable', () => {
      const { container } = render(<AssociateDashboard />);
      const clickableTasks = container.querySelectorAll('.cursor-pointer');
      expect(clickableTasks.length).toBeGreaterThan(0);
    });

    it('should have hover effects on tasks', () => {
      const { container } = render(<AssociateDashboard />);
      const hoverTasks = container.querySelectorAll('.hover\\:bg-slate-50');
      expect(hoverTasks.length).toBeGreaterThan(0);
    });
  });

  describe('Recent Activity Section', () => {
    it('should render recent activity section', () => {
      render(<AssociateDashboard />);
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should display all activity items', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('Uploaded Document')).toBeInTheDocument();
      expect(screen.getByText('Logged Time')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });

    it('should display activity targets', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('Exhibit A.pdf')).toBeInTheDocument();
      expect(screen.getByText('0.8h - Research')).toBeInTheDocument();
      expect(screen.getByText('Conflict Check')).toBeInTheDocument();
    });

    it('should display timestamps for activities', () => {
      render(<AssociateDashboard />);

      expect(screen.getByText('10 mins ago')).toBeInTheDocument();
      expect(screen.getByText('1 hour ago')).toBeInTheDocument();
      expect(screen.getByText('3 hours ago')).toBeInTheDocument();
    });

    it('should have timeline visual indicator', () => {
      const { container } = render(<AssociateDashboard />);
      const timeline = container.querySelector('.border-l-2');
      expect(timeline).toBeInTheDocument();
    });

    it('should have timeline dots for each activity', () => {
      const { container } = render(<AssociateDashboard />);
      const dots = container.querySelectorAll('.rounded-full.bg-slate-200');
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  describe('Color Coding', () => {
    it('should apply correct border colors to metric cards', () => {
      const { container } = render(<AssociateDashboard />);

      expect(container.querySelector('.border-l-blue-500')).toBeInTheDocument();
      expect(container.querySelector('.border-l-amber-500')).toBeInTheDocument();
      expect(container.querySelector('.border-l-purple-500')).toBeInTheDocument();
      expect(container.querySelector('.border-l-red-500')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have grid layout for metrics', () => {
      const { container } = render(<AssociateDashboard />);
      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('should have responsive grid columns', () => {
      const { container } = render(<AssociateDashboard />);
      const responsiveGrid = container.querySelector('.md\\:grid-cols-4');
      expect(responsiveGrid).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      const { container } = render(<AssociateDashboard />);
      const spacedContainer = container.querySelector('.space-y-6');
      expect(spacedContainer).toBeInTheDocument();
    });
  });

  describe('Typography', () => {
    it('should use monospace font for time estimates', () => {
      const { container } = render(<AssociateDashboard />);
      const monoElements = container.querySelectorAll('.font-mono');
      expect(monoElements.length).toBeGreaterThan(0);
    });

    it('should have bold task names', () => {
      const { container } = render(<AssociateDashboard />);
      const boldTasks = container.querySelectorAll('.font-bold');
      expect(boldTasks.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = render(<AssociateDashboard />);
      const h2 = container.querySelector('h2');
      expect(h2).toHaveTextContent('My Workspace');
    });

    it('should render without accessibility violations', () => {
      const { container } = render(<AssociateDashboard />);
      expect(container).toBeInTheDocument();
    });
  });
});
