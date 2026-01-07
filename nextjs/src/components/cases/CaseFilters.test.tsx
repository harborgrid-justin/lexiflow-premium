/**
 * CaseFilters Component Tests
 * Enterprise-grade test suite for case filtering functionality
 *
 * @module components/cases/CaseFilters.test
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { CaseFilters } from './CaseFilters';
import { CaseStatus, MatterPriority } from '@/types';

describe('CaseFilters', () => {
  describe('Rendering', () => {
    it('should render status filter section', () => {
      render(<CaseFilters />);

      expect(screen.getByRole('heading', { name: 'Status' })).toBeInTheDocument();
    });

    it('should render priority filter section', () => {
      render(<CaseFilters />);

      expect(screen.getByRole('heading', { name: 'Priority' })).toBeInTheDocument();
    });

    it('should render ALL option for status filter', () => {
      render(<CaseFilters />);

      const statusButtons = screen.getAllByRole('button');
      expect(statusButtons.some(btn => btn.textContent === 'ALL')).toBe(true);
    });

    it('should render all status options from CaseStatus enum', () => {
      render(<CaseFilters />);

      Object.values(CaseStatus).forEach(status => {
        expect(screen.getByRole('button', { name: status })).toBeInTheDocument();
      });
    });

    it('should render all priority options from MatterPriority enum', () => {
      render(<CaseFilters />);

      Object.values(MatterPriority).forEach(priority => {
        expect(screen.getByRole('button', { name: priority })).toBeInTheDocument();
      });
    });
  });

  describe('Status Filter Interaction', () => {
    it('should start with ALL status selected', () => {
      render(<CaseFilters />);

      const allButton = screen.getAllByRole('button', { name: 'ALL' })[0];
      expect(allButton).toHaveClass('bg-blue-50');
    });

    it('should highlight selected status on click', () => {
      render(<CaseFilters />);

      const activeButton = screen.getByRole('button', { name: CaseStatus.Active });
      fireEvent.click(activeButton);

      expect(activeButton).toHaveClass('bg-blue-50');
    });

    it('should deselect previous status when new status selected', () => {
      render(<CaseFilters />);

      const activeButton = screen.getByRole('button', { name: CaseStatus.Active });
      const pendingButton = screen.getByRole('button', { name: CaseStatus.Pending });

      fireEvent.click(activeButton);
      expect(activeButton).toHaveClass('bg-blue-50');

      fireEvent.click(pendingButton);
      expect(pendingButton).toHaveClass('bg-blue-50');
      expect(activeButton).not.toHaveClass('bg-blue-50');
    });

    it('should allow reselecting ALL status', () => {
      render(<CaseFilters />);

      const activeButton = screen.getByRole('button', { name: CaseStatus.Active });
      const allButton = screen.getAllByRole('button', { name: 'ALL' })[0];

      fireEvent.click(activeButton);
      fireEvent.click(allButton);

      expect(allButton).toHaveClass('bg-blue-50');
      expect(activeButton).not.toHaveClass('bg-blue-50');
    });
  });

  describe('Priority Filter Interaction', () => {
    it('should start with ALL priority selected', () => {
      render(<CaseFilters />);

      // Get the second ALL button (for priority)
      const allButtons = screen.getAllByRole('button', { name: 'ALL' });
      expect(allButtons[1]).toHaveClass('bg-blue-50');
    });

    it('should highlight selected priority on click', () => {
      render(<CaseFilters />);

      const highButton = screen.getByRole('button', { name: MatterPriority.HIGH });
      fireEvent.click(highButton);

      expect(highButton).toHaveClass('bg-blue-50');
    });

    it('should handle urgent priority selection', () => {
      render(<CaseFilters />);

      const urgentButton = screen.getByRole('button', { name: MatterPriority.URGENT });
      fireEvent.click(urgentButton);

      expect(urgentButton).toHaveClass('bg-blue-50');
    });

    it('should allow independent status and priority selections', () => {
      render(<CaseFilters />);

      const activeButton = screen.getByRole('button', { name: CaseStatus.Active });
      const highButton = screen.getByRole('button', { name: MatterPriority.HIGH });

      fireEvent.click(activeButton);
      fireEvent.click(highButton);

      expect(activeButton).toHaveClass('bg-blue-50');
      expect(highButton).toHaveClass('bg-blue-50');
    });
  });

  describe('Styling and Accessibility', () => {
    it('should have proper button styling', () => {
      render(<CaseFilters />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('w-full', 'text-left', 'px-3', 'py-2', 'rounded', 'text-sm');
      });
    });

    it('should render within a styled container', () => {
      const { container } = render(<CaseFilters />);

      const filterContainer = container.firstChild;
      expect(filterContainer).toHaveClass('bg-white', 'rounded-lg', 'border');
    });

    it('should have accessible button elements', () => {
      render(<CaseFilters />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toBeEnabled();
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Filter State Management', () => {
    it('should maintain state across multiple interactions', () => {
      render(<CaseFilters />);

      // Select various filters
      fireEvent.click(screen.getByRole('button', { name: CaseStatus.Active }));
      fireEvent.click(screen.getByRole('button', { name: CaseStatus.Closed }));
      fireEvent.click(screen.getByRole('button', { name: CaseStatus.Pending }));

      // Final selection should be Pending
      expect(screen.getByRole('button', { name: CaseStatus.Pending })).toHaveClass('bg-blue-50');
      expect(screen.getByRole('button', { name: CaseStatus.Active })).not.toHaveClass('bg-blue-50');
      expect(screen.getByRole('button', { name: CaseStatus.Closed })).not.toHaveClass('bg-blue-50');
    });
  });
});
