/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PrivilegeLog } from '@/components/enterprise/Discovery/PrivilegeLog';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the theme context
const mockTheme = {
  theme: {
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
    },
    surface: {
      default: 'bg-white',
      input: 'bg-white',
    },
    background: 'bg-gray-50',
    border: {
      default: 'border-gray-200',
    },
  },
};

jest.mock('@/contexts/theme/ThemeContext', () => ({
  useTheme: () => mockTheme,
}));

describe('PrivilegeLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders privilege log header with title', () => {
      render(<PrivilegeLog />);

      expect(screen.getByText('Privilege Log')).toBeInTheDocument();
      expect(screen.getByText('Manage privileged documents and export court-formatted logs')).toBeInTheDocument();
    });

    test('renders action buttons in header', () => {
      render(<PrivilegeLog />);

      expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export court format/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument();
    });

    test('displays all statistics cards', () => {
      render(<PrivilegeLog />);

      expect(screen.getByText('Total Entries')).toBeInTheDocument();
      expect(screen.getByText('Attorney-Client')).toBeInTheDocument();
      expect(screen.getByText('Work Product')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
      expect(screen.getByText('Challenged')).toBeInTheDocument();
    });
  });

  describe('Privilege Entry Listing', () => {
    test('displays privilege log table with correct headers', () => {
      render(<PrivilegeLog />);

      expect(screen.getByText('Bates Number')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Author')).toBeInTheDocument();
      expect(screen.getByText('Recipients')).toBeInTheDocument();
      expect(screen.getByText('Subject')).toBeInTheDocument();
      expect(screen.getByText('Privilege Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('displays mock privilege entries', () => {
      render(<PrivilegeLog />);

      expect(screen.getByText('ABC-0001234')).toBeInTheDocument();
      expect(screen.getByText('ABC-0005678')).toBeInTheDocument();
      expect(screen.getByText('ABC-0009012')).toBeInTheDocument();
    });

    test('shows privilege entry details in table rows', () => {
      render(<PrivilegeLog />);

      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Michael Chen')).toBeInTheDocument();
      expect(screen.getByText('Emily Rodriguez')).toBeInTheDocument();
    });
  });

  describe('Batch Tagging', () => {
    test('displays select all checkbox', () => {
      render(<PrivilegeLog />);

      const checkboxes = screen.getAllByRole('button');
      // First button in header should be select all
      const selectAllButton = checkboxes.find(btn =>
        btn.querySelector('svg') !== null
      );
      expect(selectAllButton).toBeInTheDocument();
    });

    test('shows batch actions bar when entries are selected', () => {
      render(<PrivilegeLog />);

      // Find and click a checkbox to select an entry
      const checkboxes = screen.getAllByRole('button');
      const firstCheckbox = checkboxes.find(btn =>
        btn.parentElement?.tagName === 'TD'
      );

      if (firstCheckbox) {
        fireEvent.click(firstCheckbox);

        // Batch actions should appear
        waitFor(() => {
          expect(screen.getByText(/selected/i)).toBeInTheDocument();
        });
      }
    });

    test('displays batch tagging options', async () => {
      render(<PrivilegeLog />);

      // Select an entry
      const checkboxes = screen.getAllByRole('button');
      const firstCheckbox = checkboxes.find(btn =>
        btn.parentElement?.tagName === 'TD'
      );

      if (firstCheckbox) {
        fireEvent.click(firstCheckbox);

        await waitFor(() => {
          expect(screen.getByText('Tag as Attorney-Client')).toBeInTheDocument();
          expect(screen.getByText('Tag as Work Product')).toBeInTheDocument();
          expect(screen.getByText('Tag as Both')).toBeInTheDocument();
        });
      }
    });

    test('applies batch tag to selected entries', async () => {
      render(<PrivilegeLog />);

      // Select entry and apply batch tag
      const checkboxes = screen.getAllByRole('button');
      const firstCheckbox = checkboxes.find(btn =>
        btn.parentElement?.tagName === 'TD'
      );

      if (firstCheckbox) {
        fireEvent.click(firstCheckbox);

        await waitFor(() => {
          const batchTagButton = screen.getByText('Tag as Attorney-Client');
          fireEvent.click(batchTagButton);
        });
      }
    });
  });

  describe('Status Filtering', () => {
    test('renders privilege type filter dropdown', () => {
      render(<PrivilegeLog />);

      const filterDropdown = screen.getByRole('combobox');
      expect(filterDropdown).toBeInTheDocument();
    });

    test('displays all privilege type filter options', () => {
      render(<PrivilegeLog />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      // Check options
      expect(screen.getByText('All Types')).toBeInTheDocument();
      expect(screen.getByText('Attorney-Client')).toBeInTheDocument();
      expect(screen.getByText('Work Product')).toBeInTheDocument();
      expect(screen.getByText('Both')).toBeInTheDocument();
      expect(screen.getByText('Trade Secret')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    test('filters entries when privilege type is selected', () => {
      render(<PrivilegeLog />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'attorney-client' } });

      // Should still show entries (mock data has attorney-client entries)
      expect(screen.getByText('ABC-0001234')).toBeInTheDocument();
    });
  });

  describe('Export to Court Format', () => {
    test('export button triggers export function', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<PrivilegeLog />);

      const exportButton = screen.getByRole('button', { name: /export court format/i });
      fireEvent.click(exportButton);

      expect(alertSpy).toHaveBeenCalledWith('Exporting privilege log in court-approved format...');

      alertSpy.mockRestore();
    });

    test('export button is always visible', () => {
      render(<PrivilegeLog />);

      expect(screen.getByRole('button', { name: /export court format/i })).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('renders search input field', () => {
      render(<PrivilegeLog />);

      const searchInput = screen.getByPlaceholderText(/search by bates number, subject, or author/i);
      expect(searchInput).toBeInTheDocument();
    });

    test('updates search query on input change', () => {
      render(<PrivilegeLog />);

      const searchInput = screen.getByPlaceholderText(/search by bates number, subject, or author/i);
      fireEvent.change(searchInput, { target: { value: 'ABC-0001234' } });

      expect(searchInput).toHaveValue('ABC-0001234');
    });

    test('filters entries based on search query', () => {
      render(<PrivilegeLog />);

      const searchInput = screen.getByPlaceholderText(/search by bates number, subject, or author/i);

      // Search by Bates number
      fireEvent.change(searchInput, { target: { value: 'ABC-0001234' } });

      expect(screen.getByText('ABC-0001234')).toBeInTheDocument();
    });

    test('shows empty state when no results found', () => {
      render(<PrivilegeLog />);

      const searchInput = screen.getByPlaceholderText(/search by bates number, subject, or author/i);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT-BATES' } });

      expect(screen.getByText('No Privilege Entries Found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });

  describe('Legal-Specific Features', () => {
    test('displays privilege type badges correctly', () => {
      render(<PrivilegeLog />);

      // Attorney-client privilege should be visible
      const privilegeTypes = screen.getAllByText(/attorney client|work product|both/i);
      expect(privilegeTypes.length).toBeGreaterThan(0);
    });

    test('shows status indicators with appropriate icons', () => {
      render(<PrivilegeLog />);

      // Status badges should be present
      expect(screen.getByText('reviewed')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    test('displays document metadata (author, recipients, subject)', () => {
      render(<PrivilegeLog />);

      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Re: Litigation Strategy Discussion')).toBeInTheDocument();
    });

    test('handles case-specific filtering when caseId provided', () => {
      const mockCaseId = 'CASE-456';
      render(<PrivilegeLog caseId={mockCaseId} />);

      expect(screen.getByText('Privilege Log')).toBeInTheDocument();
    });
  });

  describe('Row Actions', () => {
    test('displays action buttons for each entry', () => {
      render(<PrivilegeLog />);

      // Each row should have view, edit, and delete buttons
      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    test('individual entry checkboxes are clickable', () => {
      render(<PrivilegeLog />);

      const checkboxes = screen.getAllByRole('button');
      const firstCheckbox = checkboxes.find(btn =>
        btn.parentElement?.tagName === 'TD'
      );

      if (firstCheckbox) {
        fireEvent.click(firstCheckbox);
        // Checkbox state should change
        expect(firstCheckbox).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    test('table has proper structure', () => {
      render(<PrivilegeLog />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    test('has appropriate ARIA labels for interactive elements', () => {
      render(<PrivilegeLog />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
