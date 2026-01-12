/**
 * @jest-environment jsdom
 */

import { render, screen } from '@/__tests__/test-utils';
import { PartnerDashboard } from '@/lexiflow-suite/components/dashboard/PartnerDashboard';
import '@testing-library/jest-dom';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => require('@/__tests__/__mocks__/recharts'));

describe('PartnerDashboard', () => {
  describe('Rendering', () => {
    it('should render partner dashboard title', () => {
      render(<PartnerDashboard />);
      expect(screen.getByText('Partner Overview')).toBeInTheDocument();
    });

    it('should render all metric cards', () => {
      render(<PartnerDashboard />);

      expect(screen.getByText('Realization Rate')).toBeInTheDocument();
      expect(screen.getByText('Revenue YTD')).toBeInTheDocument();
      expect(screen.getByText('Profit Margin')).toBeInTheDocument();
      expect(screen.getByText('Active Clients')).toBeInTheDocument();
    });

    it('should display metric values correctly', () => {
      render(<PartnerDashboard />);

      expect(screen.getByText('94.2%')).toBeInTheDocument();
      expect(screen.getByText('$3.2M')).toBeInTheDocument();
      expect(screen.getByText('38%')).toBeInTheDocument();
      expect(screen.getByText('142')).toBeInTheDocument();
    });

    it('should display trends for metrics', () => {
      render(<PartnerDashboard />);

      expect(screen.getByText('+2.4%')).toBeInTheDocument();
      expect(screen.getByText('+12% YoY')).toBeInTheDocument();
      expect(screen.getByText('Target: 40%')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });
  });

  describe('Charts', () => {
    it('should render revenue trends chart', () => {
      render(<PartnerDashboard />);
      expect(screen.getByText('Firm Revenue Trends (k)')).toBeInTheDocument();
    });

    it('should render top performers section', () => {
      render(<PartnerDashboard />);
      expect(screen.getByText('Top Performers (Billable Hours)')).toBeInTheDocument();
    });

    it('should display all performers', () => {
      render(<PartnerDashboard />);

      expect(screen.getByText('James Doe')).toBeInTheDocument();
      expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
      expect(screen.getByText('Michael Chen')).toBeInTheDocument();
    });

    it('should show billable hours for each performer', () => {
      render(<PartnerDashboard />);

      expect(screen.getByText('145 / 140')).toBeInTheDocument();
      expect(screen.getByText('132 / 130')).toBeInTheDocument();
      expect(screen.getByText('120 / 140')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have grid layout for metrics', () => {
      const { container } = render(<PartnerDashboard />);
      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('should apply color-coded borders to metric cards', () => {
      const { container } = render(<PartnerDashboard />);

      const greenBorder = container.querySelector('.border-l-green-500');
      const blueBorder = container.querySelector('.border-l-blue-500');
      const indigoBorder = container.querySelector('.border-l-indigo-500');
      const slateBorder = container.querySelector('.border-l-slate-500');

      expect(greenBorder).toBeInTheDocument();
      expect(blueBorder).toBeInTheDocument();
      expect(indigoBorder).toBeInTheDocument();
      expect(slateBorder).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate semantic structure', () => {
      const { container } = render(<PartnerDashboard />);
      const heading = container.querySelector('h2');
      expect(heading).toHaveTextContent('Partner Overview');
    });

    it('should render without accessibility violations', () => {
      const { container } = render(<PartnerDashboard />);
      expect(container).toBeInTheDocument();
    });
  });
});
