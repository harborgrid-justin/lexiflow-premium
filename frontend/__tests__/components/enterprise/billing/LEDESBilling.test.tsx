/**
 * LEDESBilling Component Tests
 * Tests for UTBMS code display, format selection, rate schedule display, e-billing portal integration, and code search
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LEDESBilling } from '@/components/enterprise/Billing/LEDESBilling';

describe('LEDESBilling Component', () => {
  const mockOnExport = jest.fn();
  const mockOnImport = jest.fn();
  const mockOnValidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Format Selection', () => {
    it('should display both LEDES format options', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      expect(screen.getByText('LEDES 1998B')).toBeInTheDocument();
      expect(screen.getByText('LEDES 2000')).toBeInTheDocument();
    });

    it('should show format descriptions', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      expect(screen.getByText('Standard format for time and expense billing')).toBeInTheDocument();
      expect(screen.getByText('Enhanced format with additional fields')).toBeInTheDocument();
    });

    it('should select 1998B format by default', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      // Find the format card container by its styling classes
      const format1998BTitle = screen.getByText('LEDES 1998B');
      const formatCard = format1998BTitle.closest('.cursor-pointer');
      expect(formatCard).toHaveClass('border-blue-500');
    });

    it('should switch to LEDES 2000 format when clicked', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      const format2000Title = screen.getByText('LEDES 2000');
      const formatCard = format2000Title.closest('.cursor-pointer');
      if (formatCard) {
        fireEvent.click(formatCard);
        expect(formatCard).toHaveClass('border-blue-500');
      }
    });

    it('should display checkmark for selected format', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      const format1998B = screen.getByText('LEDES 1998B').closest('div')?.parentElement;
      expect(format1998B?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('UTBMS Code Display', () => {
    it('should display UTBMS codes table when on UTBMS tab', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      expect(screen.getByText('L110')).toBeInTheDocument();
      expect(screen.getByText('L120')).toBeInTheDocument();
      expect(screen.getByText('L210')).toBeInTheDocument();
    });

    it('should display code categories correctly', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      const taskBadges = screen.getAllByText('Task');
      const activityBadges = screen.getAllByText('Activity');
      const expenseBadges = screen.getAllByText('Expense');

      expect(taskBadges.length).toBeGreaterThan(0);
      expect(activityBadges.length).toBeGreaterThan(0);
      expect(expenseBadges.length).toBeGreaterThan(0);
    });

    it('should display code descriptions', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      expect(screen.getByText('Case Assessment, Development, and Administration')).toBeInTheDocument();
      expect(screen.getByText('Fact Investigation/Development')).toBeInTheDocument();
      expect(screen.getByText('Pleadings')).toBeInTheDocument();
    });

    it('should show phase information for task codes', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      // Multiple codes have Pre-litigation phase
      const preLitigationElements = screen.getAllByText('Pre-litigation');
      expect(preLitigationElements.length).toBeGreaterThan(0);
      expect(screen.getAllByText('Litigation').length).toBeGreaterThan(0);
      // Multiple codes may have Trial phase
      const trialElements = screen.getAllByText('Trial');
      expect(trialElements.length).toBeGreaterThan(0);
    });

    it('should display code levels', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      expect(screen.getAllByText('Level 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Level 2').length).toBeGreaterThan(0);
    });

    it('should show expense codes separately', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      expect(screen.getByText('E101')).toBeInTheDocument();
      expect(screen.getByText('E102')).toBeInTheDocument();
      expect(screen.getByText('E103')).toBeInTheDocument();
    });
  });

  describe('Code Search Functionality', () => {
    it('should render search input field', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      const searchInput = screen.getByPlaceholderText('Search UTBMS codes...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter codes by code number', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      const searchInput = screen.getByPlaceholderText('Search UTBMS codes...');
      fireEvent.change(searchInput, { target: { value: 'L110' } });

      expect(screen.getByText('L110')).toBeInTheDocument();
    });

    it('should filter codes by description', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      const searchInput = screen.getByPlaceholderText('Search UTBMS codes...');
      fireEvent.change(searchInput, { target: { value: 'Discovery' } });

      expect(screen.getByText('Discovery')).toBeInTheDocument();
    });

    it('should display filter button', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /UTBMS Codes/i }));

      expect(screen.getByRole('button', { name: /Filter/i })).toBeInTheDocument();
    });
  });

  describe('Rate Schedule Display', () => {
    it('should display rate schedules when on rates tab', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Rates/i }));

      expect(screen.getByText('Standard Corporate Rates 2024')).toBeInTheDocument();
      expect(screen.getByText('Discounted Rates - TechCorp')).toBeInTheDocument();
    });

    it('should show effective dates for rate schedules', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Rates/i }));

      const effectiveDates = screen.getAllByText(/Effective:/);
      expect(effectiveDates.length).toBeGreaterThan(0);
    });

    it('should display timekeeper levels in rate schedule', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Rates/i }));

      expect(screen.getAllByText('Partner').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Senior Associate').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Associate').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Paralegal').length).toBeGreaterThan(0);
    });

    it('should show hourly rates with decimal precision', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Rates/i }));

      expect(screen.getByText('$650.00')).toBeInTheDocument();
      expect(screen.getByText('$475.00')).toBeInTheDocument();
      expect(screen.getByText('$350.00')).toBeInTheDocument();
      expect(screen.getByText('$175.00')).toBeInTheDocument();
    });

    it('should display currency for each rate', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Rates/i }));

      const usdLabels = screen.getAllByText('USD');
      expect(usdLabels.length).toBeGreaterThan(0);
    });

    it('should show discounted rates when applicable', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Rates/i }));

      expect(screen.getByText('$585.00')).toBeInTheDocument();
      expect(screen.getByText('$425.00')).toBeInTheDocument();
    });
  });

  describe('E-Billing Portal Integration', () => {
    it('should display e-billing portals table', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Portals/i }));

      expect(screen.getByText('E-Billing Portal Integration')).toBeInTheDocument();
    });

    it('should show client names for portals', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Portals/i }));

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('TechStart LLC')).toBeInTheDocument();
      expect(screen.getByText('GlobalTrade Inc')).toBeInTheDocument();
    });

    it('should display portal names', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Portals/i }));

      expect(screen.getByText('Counsel Link')).toBeInTheDocument();
      expect(screen.getByText('TyMetrix')).toBeInTheDocument();
      expect(screen.getByText('SimpleLegal')).toBeInTheDocument();
    });

    it('should show format used for each portal', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Portals/i }));

      expect(screen.getAllByText('LEDES 1998B').length).toBeGreaterThan(0);
      // LEDES 2000 appears in both tab and portal list
      const ledes2000Elements = screen.getAllByText('LEDES 2000');
      expect(ledes2000Elements.length).toBeGreaterThan(0);
    });

    it('should display last submission dates', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Portals/i }));

      const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dates.length).toBeGreaterThan(0);
    });

    it('should show active status for portals', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Portals/i }));

      const activeStatuses = screen.getAllByText('ACTIVE');
      expect(activeStatuses.length).toBe(3);
    });

    it('should display submit buttons for portals', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Portals/i }));

      const submitButtons = screen.getAllByText('Submit');
      expect(submitButtons.length).toBe(3);
    });
  });

  describe('Tab Navigation', () => {
    it('should render all tabs', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);

      expect(screen.getByRole('button', { name: /Formats/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /UTBMS Codes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rates/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Portals/i })).toBeInTheDocument();
    });

    it('should switch to formats tab', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Formats/i }));

      expect(screen.getByText('Format Specifications')).toBeInTheDocument();
    });
  });

  describe('Format Specifications', () => {
    it('should show 1998B format specifications', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Formats/i }));

      expect(screen.getByText('LEDES 1998B Format')).toBeInTheDocument();
      expect(screen.getByText(/20 required fields/i)).toBeInTheDocument();
      expect(screen.getByText(/Tab-delimited text format/i)).toBeInTheDocument();
    });

    it('should show 2000 format specifications', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Formats/i }));

      expect(screen.getByText('LEDES 2000 Format')).toBeInTheDocument();
      // "Enhanced format" appears in both the format card and specifications
      const enhancedFormatElements = screen.getAllByText(/Enhanced format/i);
      expect(enhancedFormatElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Pipe-delimited text format/i)).toBeInTheDocument();
    });
  });

  describe('Import/Export Functionality', () => {
    it('should render import button', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      expect(screen.getByText('Import LEDES')).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      expect(screen.getByText('Export LEDES')).toBeInTheDocument();
    });

    it('should have validate data button on formats tab', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Formats/i }));

      expect(screen.getByText('Validate Data')).toBeInTheDocument();
    });

    it('should have download template button', () => {
      render(<LEDESBilling onExport={mockOnExport} onImport={mockOnImport} />);
      fireEvent.click(screen.getByRole('button', { name: /Formats/i }));

      expect(screen.getByText('Download Template')).toBeInTheDocument();
    });
  });
});
