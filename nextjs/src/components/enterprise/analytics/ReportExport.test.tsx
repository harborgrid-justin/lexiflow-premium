/**
 * @fileoverview Enterprise-grade tests for ReportExport component
 * Tests export formats, options, progress states, and error handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ReportExport, type ExportOptions, type ExportFormat } from './ReportExport';

expect.extend(toHaveNoViolations);

// Mock useTheme hook
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '#ffffff', raised: '#f8fafc', highlight: '#f1f5f9' },
      text: { primary: '#1e293b', secondary: '#64748b' },
      border: { default: '#e2e8f0' },
      primary: { main: '#3b82f6' },
      status: {
        error: { bg: '#fef2f2', text: '#991b1b' },
        info: { bg: '#eff6ff', text: '#1e3a8a' }
      }
    }
  })
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();
Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

describe('ReportExport', () => {
  const mockOnExport = jest.fn();

  const defaultProps = {
    onExport: mockOnExport
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnExport.mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<ReportExport {...defaultProps} />);

      expect(screen.getByText('Export Report')).toBeInTheDocument();
    });

    it('renders export button', () => {
      render(<ReportExport {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('displays export icon', () => {
      render(<ReportExport {...defaultProps} />);

      expect(screen.getByText('📥')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ReportExport {...defaultProps} className="custom-export-class" />
      );

      expect(container.firstChild).toHaveClass('custom-export-class');
    });
  });

  describe('Dropdown Mode', () => {
    it('shows dropdown as default mode', () => {
      render(<ReportExport {...defaultProps} showAsDropdown={true} />);

      expect(screen.getByText('Export Report')).toBeInTheDocument();
    });

    it('opens dropdown on button click', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByText('Export Options')).toBeInTheDocument();
      expect(screen.getByText('Select Format')).toBeInTheDocument();
    });

    it('closes dropdown on second click', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      expect(screen.getByText('Export Options')).toBeInTheDocument();

      await user.click(screen.getByText('Export Report'));
      expect(screen.queryByText('Export Options')).not.toBeInTheDocument();
    });

    it('displays all default format options', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByText('PDF Document')).toBeInTheDocument();
      expect(screen.getByText('CSV Spreadsheet')).toBeInTheDocument();
      expect(screen.getByText('Excel Workbook')).toBeInTheDocument();
      expect(screen.getByText('JSON Data')).toBeInTheDocument();
    });

    it('displays format icons', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByText('📄')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
      expect(screen.getByText('{ }')).toBeInTheDocument();
    });

    it('displays file extensions', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByText('.pdf')).toBeInTheDocument();
      expect(screen.getByText('.csv')).toBeInTheDocument();
      expect(screen.getByText('.xlsx')).toBeInTheDocument();
      expect(screen.getByText('.json')).toBeInTheDocument();
    });
  });

  describe('Export Options', () => {
    it('displays include charts checkbox', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByLabelText('Include Charts')).toBeInTheDocument();
    });

    it('displays include data checkbox', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByLabelText('Include Raw Data')).toBeInTheDocument();
    });

    it('displays include summary checkbox', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByLabelText('Include Summary')).toBeInTheDocument();
    });

    it('options are checked by default', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByLabelText('Include Charts')).toBeChecked();
      expect(screen.getByLabelText('Include Raw Data')).toBeChecked();
      expect(screen.getByLabelText('Include Summary')).toBeChecked();
    });

    it('can toggle export options', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByLabelText('Include Charts'));

      expect(screen.getByLabelText('Include Charts')).not.toBeChecked();
    });
  });

  describe('Export Functionality', () => {
    it('calls onExport with correct format when format is selected', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'pdf'
          })
        );
      });
    });

    it('includes export options in onExport call', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('CSV Spreadsheet'));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'csv',
            includeCharts: true,
            includeData: true,
            includeSummary: true
          })
        );
      });
    });

    it('respects changed options in export call', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByLabelText('Include Charts'));
      await user.click(screen.getByText('PDF Document'));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          expect.objectContaining({
            includeCharts: false
          })
        );
      });
    });
  });

  describe('Progress States', () => {
    it('displays exporting state during export', async () => {
      const user = userEvent.setup();
      mockOnExport.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      expect(screen.getByText('Preparing export...')).toBeInTheDocument();
    });

    it('disables button during export', async () => {
      const user = userEvent.setup();
      mockOnExport.mockImplementation(() => new Promise(() => {}));

      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('shows completion message after successful export', async () => {
      const user = userEvent.setup();
      mockOnExport.mockResolvedValue(new Blob(['test']));

      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      await waitFor(() => {
        expect(screen.getByText('Export complete!')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on export failure', async () => {
      const user = userEvent.setup();
      mockOnExport.mockRejectedValue(new Error('Export failed'));

      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      await waitFor(() => {
        expect(screen.getByText('Export failed')).toBeInTheDocument();
      });
    });

    it('displays generic error for non-Error exceptions', async () => {
      const user = userEvent.setup();
      mockOnExport.mockRejectedValue('Unknown error');

      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      await waitFor(() => {
        expect(screen.getByText('Failed to export report')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Formats', () => {
    it('renders only specified formats', async () => {
      const user = userEvent.setup();
      const customFormats: ExportFormat[] = ['pdf', 'csv'];

      render(<ReportExport {...defaultProps} formats={customFormats} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByText('PDF Document')).toBeInTheDocument();
      expect(screen.getByText('CSV Spreadsheet')).toBeInTheDocument();
      expect(screen.queryByText('Excel Workbook')).not.toBeInTheDocument();
      expect(screen.queryByText('JSON Data')).not.toBeInTheDocument();
    });

    it('renders single format', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} formats={['pdf']} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByText('PDF Document')).toBeInTheDocument();
      expect(screen.queryByText('CSV Spreadsheet')).not.toBeInTheDocument();
    });
  });

  describe('Default Options', () => {
    it('applies default options', async () => {
      const user = userEvent.setup();
      const defaultOptions = {
        includeCharts: false,
        includeData: true,
        includeSummary: false
      };

      render(<ReportExport {...defaultProps} defaultOptions={defaultOptions} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.getByLabelText('Include Charts')).not.toBeChecked();
      expect(screen.getByLabelText('Include Raw Data')).toBeChecked();
      expect(screen.getByLabelText('Include Summary')).not.toBeChecked();
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<ReportExport {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies reduced opacity when disabled', () => {
      render(<ReportExport {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ opacity: '0.6' });
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} disabled={true} />);

      await user.click(screen.getByText('Export Report'));

      expect(screen.queryByText('Export Options')).not.toBeInTheDocument();
    });
  });

  describe('Button List Mode', () => {
    it('renders as button list when showAsDropdown is false', () => {
      render(<ReportExport {...defaultProps} showAsDropdown={false} />);

      expect(screen.getByText('Export PDF Document')).toBeInTheDocument();
      expect(screen.getByText('Export CSV Spreadsheet')).toBeInTheDocument();
      expect(screen.getByText('Export Excel Workbook')).toBeInTheDocument();
      expect(screen.getByText('Export JSON Data')).toBeInTheDocument();
    });

    it('each format button triggers export directly', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} showAsDropdown={false} />);

      await user.click(screen.getByText('Export PDF Document'));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'pdf'
          })
        );
      });
    });
  });

  describe('Report Name', () => {
    it('uses default report name', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      // The filename is generated internally, we verify onExport was called
      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalled();
      });
    });

    it('uses custom report name', async () => {
      const user = userEvent.setup();
      render(<ReportExport {...defaultProps} reportName="custom-report" />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalled();
      });
    });
  });

  describe('Styling', () => {
    it('applies primary color to export button', () => {
      render(<ReportExport {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ backgroundColor: '#3b82f6' });
    });

    it('has proper button padding', () => {
      render(<ReportExport {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ padding: '10px 20px' });
    });

    it('has proper border radius', () => {
      render(<ReportExport {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ borderRadius: '6px' });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ReportExport {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with dropdown open', async () => {
      const user = userEvent.setup();
      const { container } = render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles string result from onExport', async () => {
      const user = userEvent.setup();
      mockOnExport.mockResolvedValue('{"data": "test"}');

      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('JSON Data'));

      await waitFor(() => {
        expect(screen.getByText('Export complete!')).toBeInTheDocument();
      });
    });

    it('handles blob result from onExport', async () => {
      const user = userEvent.setup();
      mockOnExport.mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));

      render(<ReportExport {...defaultProps} />);

      await user.click(screen.getByText('Export Report'));
      await user.click(screen.getByText('PDF Document'));

      await waitFor(() => {
        expect(screen.getByText('Export complete!')).toBeInTheDocument();
      });
    });
  });
});
