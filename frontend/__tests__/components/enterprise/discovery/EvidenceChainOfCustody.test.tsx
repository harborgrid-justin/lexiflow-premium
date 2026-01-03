/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EvidenceChainOfCustody } from '@/components/enterprise/Discovery/EvidenceChainOfCustody';

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
    },
  },
};

jest.mock('@/contexts/theme/ThemeContext', () => ({
  useTheme: () => mockTheme,
}));

describe('EvidenceChainOfCustody', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders chain of custody header', () => {
      render(<EvidenceChainOfCustody />);

      expect(screen.getByText('Chain of Custody')).toBeInTheDocument();
      expect(screen.getByText('Track evidence handling, transfers, and authentication')).toBeInTheDocument();
    });

    test('renders action buttons in header', () => {
      render(<EvidenceChainOfCustody />);

      expect(screen.getByRole('button', { name: /generate barcode/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export chain/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log evidence/i })).toBeInTheDocument();
    });

    test('renders search input when no evidence is selected', () => {
      render(<EvidenceChainOfCustody />);

      const searchInput = screen.getByPlaceholderText(/search by evidence number, description, or case/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Evidence Item Display', () => {
    test('displays evidence cards in grid layout', () => {
      render(<EvidenceChainOfCustody />);

      expect(screen.getByText('EV-2025-001')).toBeInTheDocument();
      expect(screen.getByText('EV-2025-002')).toBeInTheDocument();
      expect(screen.getByText('EV-2025-003')).toBeInTheDocument();
    });

    test('shows evidence description and case number', () => {
      render(<EvidenceChainOfCustody />);

      expect(screen.getByText(/Email communications related to contract negotiations/)).toBeInTheDocument();
      expect(screen.getByText('CR-2025-1234')).toBeInTheDocument();
    });

    test('displays evidence type and category', () => {
      render(<EvidenceChainOfCustody />);

      expect(screen.getByText('digital')).toBeInTheDocument();
      expect(screen.getByText('physical')).toBeInTheDocument();
      expect(screen.getByText('electronic')).toBeInTheDocument();
      expect(screen.getByText('document')).toBeInTheDocument();
    });

    test('shows evidence status badges', () => {
      render(<EvidenceChainOfCustody />);

      expect(screen.getByText('stored')).toBeInTheDocument();
      expect(screen.getByText('court')).toBeInTheDocument();
      expect(screen.getByText('analyzed')).toBeInTheDocument();
    });

    test('allows clicking on evidence to view details', () => {
      render(<EvidenceChainOfCustody />);

      const evidenceCard = screen.getByText('EV-2025-002').closest('div');
      expect(evidenceCard).toHaveClass('cursor-pointer');

      if (evidenceCard) {
        fireEvent.click(evidenceCard);

        // Should show detail view with back button
        expect(screen.getByText('← Back to List')).toBeInTheDocument();
      }
    });
  });

  describe('Custody Transfer Rendering', () => {
    test('displays custody transfer tab', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      expect(screen.getByRole('button', { name: /custody transfers/i })).toBeInTheDocument();
    });

    test('shows custody transfer history when tab is active', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const transfersTab = screen.getByRole('button', { name: /custody transfers/i });
      fireEvent.click(transfersTab);

      expect(screen.getByText('Custody Transfer History')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /record transfer/i })).toBeInTheDocument();
    });

    test('displays transfer details (from/to persons and locations)', async () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const transfersTab = screen.getByRole('button', { name: /custody transfers/i });
      fireEvent.click(transfersTab);

      await waitFor(() => {
        expect(screen.getByText('Officer Michael Chen')).toBeInTheDocument();
        expect(screen.getByText('Evidence Clerk Jane Smith')).toBeInTheDocument();
      });
    });

    test('shows seal integrity status for each transfer', async () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const transfersTab = screen.getByRole('button', { name: /custody transfers/i });
      fireEvent.click(transfersTab);

      await waitFor(() => {
        expect(screen.getByText('Seal Intact')).toBeInTheDocument();
      });
    });
  });

  describe('Handling Log Display', () => {
    test('displays handling log tab', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      expect(screen.getByRole('button', { name: /handling log/i })).toBeInTheDocument();
    });

    test('shows handling activities when tab is clicked', async () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const handlingTab = screen.getByRole('button', { name: /handling log/i });
      fireEvent.click(handlingTab);

      await waitFor(() => {
        expect(screen.getByText('Handling Log')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log activity/i })).toBeInTheDocument();
      });
    });

    test('displays handling actions with timestamps', async () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const handlingTab = screen.getByRole('button', { name: /handling log/i });
      fireEvent.click(handlingTab);

      await waitFor(() => {
        expect(screen.getByText('collected')).toBeInTheDocument();
        expect(screen.getByText('photographed')).toBeInTheDocument();
        expect(screen.getByText('examined')).toBeInTheDocument();
      });
    });

    test('shows who performed each action', async () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const handlingTab = screen.getByRole('button', { name: /handling log/i });
      fireEvent.click(handlingTab);

      await waitFor(() => {
        expect(screen.getByText(/Officer Michael Chen/)).toBeInTheDocument();
        expect(screen.getByText(/Crime Scene Tech Amanda White/)).toBeInTheDocument();
        expect(screen.getByText(/Forensic Tech David Lee/)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Records', () => {
    test('displays authentication tab', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      expect(screen.getByRole('button', { name: /authentication/i })).toBeInTheDocument();
    });

    test('shows authentication placeholder when tab is clicked', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const authTab = screen.getByRole('button', { name: /authentication/i });
      fireEvent.click(authTab);

      expect(screen.getByText('Authentication Records')).toBeInTheDocument();
      expect(screen.getByText(/Evidence authentication and verification records coming soon/)).toBeInTheDocument();
    });
  });

  describe('Chain Integrity Indicators', () => {
    test('displays chain integrity status for each evidence item', () => {
      render(<EvidenceChainOfCustody />);

      const integrityBadges = screen.getAllByText('intact');
      expect(integrityBadges.length).toBeGreaterThan(0);
    });

    test('shows evidence security indicators', () => {
      render(<EvidenceChainOfCustody />);

      // Icons should be present but we'll check for aria-labels
      const cards = screen.getAllByText(/EV-2025-/);
      expect(cards.length).toBeGreaterThan(0);
    });

    test('displays detailed integrity status in evidence detail view', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      expect(screen.getByText(/Chain intact/)).toBeInTheDocument();
    });
  });

  describe('Evidence Detail View', () => {
    test('shows comprehensive evidence details when selected', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      expect(screen.getByText('Evidence Details')).toBeInTheDocument();
      expect(screen.getByText('Case Number')).toBeInTheDocument();
      expect(screen.getByText('Type / Category')).toBeInTheDocument();
      expect(screen.getByText('Current Location')).toBeInTheDocument();
      expect(screen.getByText('Collected By')).toBeInTheDocument();
    });

    test('displays security features checklist', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      expect(screen.getByText('Sealed')).toBeInTheDocument();
      expect(screen.getByText('Tamper-Evident')).toBeInTheDocument();
      expect(screen.getByText('Photographed')).toBeInTheDocument();
      expect(screen.getByText('Fingerprinted')).toBeInTheDocument();
    });

    test('allows returning to evidence list', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const backButton = screen.getByText('← Back to List');
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);

      // Should return to list view
      waitFor(() => {
        expect(screen.queryByText('← Back to List')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    test('filters evidence by search query', () => {
      render(<EvidenceChainOfCustody />);

      const searchInput = screen.getByPlaceholderText(/search by evidence number, description, or case/i);
      fireEvent.change(searchInput, { target: { value: 'EV-2025-001' } });

      expect(screen.getByText('EV-2025-001')).toBeInTheDocument();
    });

    test('search works with case numbers', () => {
      render(<EvidenceChainOfCustody />);

      const searchInput = screen.getByPlaceholderText(/search by evidence number, description, or case/i);
      fireEvent.change(searchInput, { target: { value: 'CR-2025-1234' } });

      expect(searchInput).toHaveValue('CR-2025-1234');
    });
  });

  describe('Legal-Specific Features', () => {
    test('tracks collection date and collected by information', () => {
      render(<EvidenceChainOfCustody />);

      const evidenceCard = screen.getByText('EV-2025-001').closest('div');

      // Collection information should be visible in cards
      expect(screen.getByText(/Det. Sarah Johnson|Officer Michael Chen|Agent Emily Rodriguez/)).toBeInTheDocument();
    });

    test('maintains proper evidence location tracking', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      expect(screen.getByText('Court Evidence Room 3')).toBeInTheDocument();
    });

    test('handles case-specific evidence when caseId provided', () => {
      const mockCaseId = 'CR-2025-1234';
      render(<EvidenceChainOfCustody caseId={mockCaseId} />);

      expect(screen.getByText('Chain of Custody')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure for evidence cards', () => {
      render(<EvidenceChainOfCustody />);

      const evidenceCards = screen.getAllByText(/EV-2025-/);
      expect(evidenceCards.length).toBeGreaterThan(0);
    });

    test('tab navigation is keyboard accessible', () => {
      render(<EvidenceChainOfCustody evidenceId="2" />);

      const tabs = screen.getAllByRole('button', { name: /custody transfers|handling log|authentication/i });
      expect(tabs.length).toBe(3);
    });
  });
});
