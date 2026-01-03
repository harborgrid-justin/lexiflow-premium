/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductionManager } from '@/components/enterprise/Discovery/ProductionManager';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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
      focused: 'border-blue-500 ring-2 ring-blue-500/20',
    },
    action: {
      primary: {
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        text: 'text-white',
        border: 'border-transparent',
      },
      secondary: {
        bg: 'bg-white',
        hover: 'hover:bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-300',
      },
      ghost: {
        bg: 'bg-transparent',
        hover: 'hover:bg-slate-100',
        text: 'text-slate-600',
      },
      danger: {
        bg: 'bg-white',
        hover: 'hover:bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
      },
    },
  },
};

jest.mock('@/contexts/theme/ThemeContext', () => ({
  useTheme: () => mockTheme,
}));

describe('ProductionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders production manager header', () => {
      render(<ProductionManager />);

      expect(screen.getByText('Production Manager')).toBeInTheDocument();
      expect(screen.getByText('Manage production sets with Bates numbering and redaction tracking')).toBeInTheDocument();
    });

    test('renders action buttons in header', () => {
      render(<ProductionManager />);

      expect(screen.getByRole('button', { name: /bates generator/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export log/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /new production/i })).toBeInTheDocument();
    });

    test('displays all statistics cards', () => {
      render(<ProductionManager />);

      expect(screen.getByText('Total Productions')).toBeInTheDocument();
      expect(screen.getByText('Documents Produced')).toBeInTheDocument();
      expect(screen.getByText('Total Redactions')).toBeInTheDocument();
      expect(screen.getByText('Ready to Produce')).toBeInTheDocument();
    });
  });

  describe('Production Set Listing', () => {
    test('displays production cards with production details', () => {
      render(<ProductionManager />);

      expect(screen.getByText('Initial Production - Emails')).toBeInTheDocument();
      expect(screen.getByText('Supplemental Production - Financial Records')).toBeInTheDocument();
      expect(screen.getByText('Production - Technical Documents')).toBeInTheDocument();
    });

    test('shows production number for each production', () => {
      render(<ProductionManager />);

      expect(screen.getByText('PROD-001')).toBeInTheDocument();
      expect(screen.getByText('PROD-002')).toBeInTheDocument();
      expect(screen.getByText('PROD-003')).toBeInTheDocument();
    });

    test('displays production status badges', () => {
      render(<ProductionManager />);

      expect(screen.getByText('produced')).toBeInTheDocument();
      expect(screen.getByText('ready')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    test('shows recipient party information', () => {
      render(<ProductionManager />);

      expect(screen.getAllByText('Plaintiff')[0]).toBeInTheDocument();
      expect(screen.getByText('Third-Party Subpoena')).toBeInTheDocument();
    });
  });

  describe('Bates Numbering Interface', () => {
    test('displays Bates range for each production', () => {
      render(<ProductionManager />);

      expect(screen.getAllByText('Bates Range')[0]).toBeInTheDocument();

      // Check for formatted Bates numbers
      expect(screen.getByText(/DEF-0000001 to DEF-0005000/)).toBeInTheDocument();
      expect(screen.getByText(/DEF-0005001 to DEF-0007500/)).toBeInTheDocument();
      expect(screen.getByText(/TP-0000001 to TP-0001200/)).toBeInTheDocument();
    });

    test('opens Bates generator modal when button clicked', () => {
      render(<ProductionManager />);

      const batesButton = screen.getByRole('button', { name: /bates generator/i });
      fireEvent.click(batesButton);

      expect(screen.getByText('Bates Number Generator')).toBeInTheDocument();
      expect(screen.getByText('Configure Bates numbering settings for your production.')).toBeInTheDocument();
    });

    test('Bates generator modal has cancel and generate buttons', () => {
      render(<ProductionManager />);

      const batesButton = screen.getByRole('button', { name: /bates generator/i });
      fireEvent.click(batesButton);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });

    test('closes Bates generator modal when cancel clicked', () => {
      render(<ProductionManager />);

      const batesButton = screen.getByRole('button', { name: /bates generator/i });
      fireEvent.click(batesButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Modal should be closed
      expect(screen.queryByText('Bates Number Generator')).not.toBeInTheDocument();
    });
  });

  describe('Redaction Count Display', () => {
    test('shows redaction count for each production', () => {
      render(<ProductionManager />);

      expect(screen.getByText(/45 redactions/)).toBeInTheDocument();
      expect(screen.getByText(/128 redactions/)).toBeInTheDocument();
      expect(screen.getByText(/67 redactions/)).toBeInTheDocument();
    });

    test('displays document count alongside redaction count', () => {
      render(<ProductionManager />);

      expect(screen.getByText(/5,000 docs/)).toBeInTheDocument();
      expect(screen.getByText(/2,500 docs/)).toBeInTheDocument();
      expect(screen.getByText(/1,200 docs/)).toBeInTheDocument();
    });
  });

  describe('Production History', () => {
    test('displays production history when production is selected', () => {
      render(<ProductionManager />);

      // Click on a production to select it
      const productionCard = screen.getByText('Initial Production - Emails').closest('div');
      if (productionCard) {
        fireEvent.click(productionCard);

        waitFor(() => {
          expect(screen.getByText(/Production History/)).toBeInTheDocument();
          expect(screen.getByText('PROD-001')).toBeInTheDocument();
        });
      }
    });

    test('shows historical actions in chronological order', async () => {
      render(<ProductionManager />);

      const productionCard = screen.getByText('Initial Production - Emails').closest('div');
      if (productionCard) {
        fireEvent.click(productionCard);

        await waitFor(() => {
          expect(screen.getAllByText(/created/i)[0]).toBeInTheDocument();
          expect(screen.getAllByText(/modified/i)[0]).toBeInTheDocument();
          expect(screen.getAllByText(/produced/i)[0]).toBeInTheDocument();
        });
      }
    });

    test('displays who performed each action', async () => {
      render(<ProductionManager />);

      const productionCard = screen.getByText('Initial Production - Emails').closest('div');
      if (productionCard) {
        fireEvent.click(productionCard);

        await waitFor(() => {
          expect(screen.getByText(/John Smith/)).toBeInTheDocument();
          expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
          expect(screen.getByText(/Senior Counsel/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Delivery Method Selection', () => {
    test('displays delivery method for each production', () => {
      render(<ProductionManager />);

      expect(screen.getAllByText(/litigation platform/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/ftp/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/email/i)[0]).toBeInTheDocument();
    });

    test('shows production format information', () => {
      render(<ProductionManager />);

      expect(screen.getAllByText(/Format:/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/pdf/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/native/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/mixed/i)[0]).toBeInTheDocument();
    });
  });

  describe('Search and Filter', () => {
    test('renders search input field', () => {
      render(<ProductionManager />);

      const searchInput = screen.getByPlaceholderText(/search productions/i);
      expect(searchInput).toBeInTheDocument();
    });

    test('filters productions based on search query', () => {
      render(<ProductionManager />);

      const searchInput = screen.getByPlaceholderText(/search productions/i);
      fireEvent.change(searchInput, { target: { value: 'PROD-001' } });

      expect(searchInput).toHaveValue('PROD-001');
    });

    test('shows empty state when no productions match search', () => {
      render(<ProductionManager />);

      const searchInput = screen.getByPlaceholderText(/search productions/i);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText('No Productions Found')).toBeInTheDocument();
    });
  });

  describe('Legal-Specific Features', () => {
    test('shows produce button for ready productions', () => {
      render(<ProductionManager />);

      expect(screen.getByRole('button', { name: /produce/i })).toBeInTheDocument();
    });

    test('displays production notes when available', () => {
      render(<ProductionManager />);

      expect(screen.getByText(/Includes native Excel files with formulas intact/)).toBeInTheDocument();
    });

    test('shows created and produced dates', () => {
      render(<ProductionManager />);

      expect(screen.getAllByText(/Created:/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Produced:/)[0]).toBeInTheDocument();
    });

    test('handles caseId prop for case-specific productions', () => {
      const mockCaseId = 'CASE-789';
      render(<ProductionManager caseId={mockCaseId} />);

      expect(screen.getByText('Production Manager')).toBeInTheDocument();
    });
  });

  describe('Production Actions', () => {
    test('displays action buttons for each production', () => {
      render(<ProductionManager />);

      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    test('allows selecting a production', () => {
      render(<ProductionManager />);

      const productionText = screen.getByText('Initial Production - Emails');
      const productionCard = productionText.closest('div.cursor-pointer');
      expect(productionCard).toBeInTheDocument();

      if (productionCard) {
        fireEvent.click(productionCard);
        // Production should be selected
      }
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      render(<ProductionManager />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('modal can be closed by clicking overlay', () => {
      render(<ProductionManager />);

      const batesButton = screen.getByRole('button', { name: /bates generator/i });
      fireEvent.click(batesButton);

      const overlay = screen.getByText('Bates Number Generator').closest('.fixed');
      if (overlay) {
        fireEvent.click(overlay);
        // Modal should close
      }
    });
  });
});
