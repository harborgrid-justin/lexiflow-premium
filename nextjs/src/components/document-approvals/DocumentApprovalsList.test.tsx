/**
 * @fileoverview Enterprise-grade tests for DocumentApprovalsList component
 * @module components/document-approvals/DocumentApprovalsList.test
 *
 * Tests approval workflow display, status badges, and empty states.
 */

import { render, screen } from '@testing-library/react';
import { DocumentApprovalsList } from './DocumentApprovalsList';

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockApprovals = [
  {
    id: '1',
    documentName: 'Settlement Agreement - Smith v. Jones',
    submittedBy: 'John Attorney',
    approvalStage: 'Partner Review',
    pendingApprovers: ['Sarah Partner', 'Mike Senior'],
    status: 'pending' as const,
    submittedAt: '2024-01-15T10:30:00',
  },
  {
    id: '2',
    documentName: 'Motion to Dismiss',
    submittedBy: 'Emily Associate',
    approvalStage: 'Final Approval',
    pendingApprovers: [],
    status: 'approved' as const,
    submittedAt: '2024-01-14T14:00:00',
  },
  {
    id: '3',
    documentName: 'Client Engagement Letter',
    submittedBy: 'David Paralegal',
    approvalStage: 'Compliance Review',
    pendingApprovers: ['Legal Compliance'],
    status: 'in-review' as const,
    submittedAt: '2024-01-13T09:00:00',
  },
  {
    id: '4',
    documentName: 'Expert Witness Agreement',
    submittedBy: 'Lisa Associate',
    approvalStage: 'Initial Review',
    pendingApprovers: [],
    status: 'rejected' as const,
    submittedAt: '2024-01-12T16:45:00',
  },
];

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('DocumentApprovalsList', () => {
  describe('Header', () => {
    it('renders the Document Approvals title', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);
      expect(screen.getByRole('heading', { name: /document approvals/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TABLE HEADERS TESTS
  // ============================================================================

  describe('Table Headers', () => {
    it('renders Document Name header', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);
      expect(screen.getByText(/document name/i)).toBeInTheDocument();
    });

    it('renders Submitted By header', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);
      expect(screen.getByText(/submitted by/i)).toBeInTheDocument();
    });

    it('renders Stage header', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);
      expect(screen.getByText(/^stage$/i)).toBeInTheDocument();
    });

    it('renders Pending Approvers header', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);
      expect(screen.getByText(/pending approvers/i)).toBeInTheDocument();
    });

    it('renders Status header', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);
      expect(screen.getByText(/^status$/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // APPROVAL DATA TESTS
  // ============================================================================

  describe('Approval Data', () => {
    it('renders document names', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      expect(screen.getByText('Settlement Agreement - Smith v. Jones')).toBeInTheDocument();
      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
      expect(screen.getByText('Client Engagement Letter')).toBeInTheDocument();
      expect(screen.getByText('Expert Witness Agreement')).toBeInTheDocument();
    });

    it('renders submitter names', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      expect(screen.getByText('John Attorney')).toBeInTheDocument();
      expect(screen.getByText('Emily Associate')).toBeInTheDocument();
      expect(screen.getByText('David Paralegal')).toBeInTheDocument();
      expect(screen.getByText('Lisa Associate')).toBeInTheDocument();
    });

    it('renders approval stages', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      expect(screen.getByText('Partner Review')).toBeInTheDocument();
      expect(screen.getByText('Final Approval')).toBeInTheDocument();
      expect(screen.getByText('Compliance Review')).toBeInTheDocument();
      expect(screen.getByText('Initial Review')).toBeInTheDocument();
    });

    it('renders pending approvers', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      expect(screen.getByText('Sarah Partner, Mike Senior')).toBeInTheDocument();
      expect(screen.getByText('Legal Compliance')).toBeInTheDocument();
    });

    it('renders None for empty pending approvers', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const noneTexts = screen.getAllByText('None');
      expect(noneTexts.length).toBe(2);
    });
  });

  // ============================================================================
  // STATUS BADGE TESTS
  // ============================================================================

  describe('Status Badges', () => {
    it('renders pending status with yellow styling', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const pendingBadge = screen.getByText('pending');
      expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders approved status with green styling', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const approvedBadge = screen.getByText('approved');
      expect(approvedBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders in-review status with blue styling', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const inReviewBadge = screen.getByText('in-review');
      expect(inReviewBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders rejected status with red styling', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const rejectedBadge = screen.getByText('rejected');
      expect(rejectedBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('applies pill styling to all status badges', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const badges = ['pending', 'approved', 'in-review', 'rejected'].map(status =>
        screen.getByText(status)
      );

      badges.forEach(badge => {
        expect(badge).toHaveClass('px-2', 'text-xs', 'leading-5', 'font-semibold', 'rounded-full');
      });
    });
  });

  // ============================================================================
  // EMPTY STATE TESTS
  // ============================================================================

  describe('Empty State', () => {
    it('shows empty state when no approvals', () => {
      render(<DocumentApprovalsList initialApprovals={[]} />);

      expect(screen.getByText(/no approval requests/i)).toBeInTheDocument();
    });

    it('spans all columns for empty state', () => {
      render(<DocumentApprovalsList initialApprovals={[]} />);

      const emptyCell = screen.getByText(/no approval requests/i).closest('td');
      expect(emptyCell).toHaveAttribute('colspan', '5');
    });

    it('centers empty state text', () => {
      render(<DocumentApprovalsList initialApprovals={[]} />);

      const emptyCell = screen.getByText(/no approval requests/i).closest('td');
      expect(emptyCell).toHaveClass('text-center');
    });
  });

  // ============================================================================
  // TABLE STRUCTURE TESTS
  // ============================================================================

  describe('Table Structure', () => {
    it('renders table element', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('has proper table rows', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const rows = screen.getAllByRole('row');
      // 1 header row + 4 data rows
      expect(rows.length).toBe(5);
    });

    it('rows are hoverable', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const dataRows = screen.getAllByRole('row').slice(1);
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const title = screen.getByRole('heading', { name: /document approvals/i });
      expect(title).toHaveClass('dark:text-white');
    });

    it('applies dark mode classes to table header', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const thead = screen.getByRole('table').querySelector('thead');
      expect(thead).toHaveClass('dark:bg-gray-900');
    });

    it('applies dark mode classes to table body', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody).toHaveClass('dark:bg-gray-800');
    });

    it('applies dark mode classes to status badges', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const approvedBadge = screen.getByText('approved');
      expect(approvedBadge).toHaveClass('dark:bg-green-900', 'dark:text-green-200');
    });

    it('applies dark mode classes to row hover', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const dataRows = screen.getAllByRole('row').slice(1);
      dataRows.forEach(row => {
        expect(row).toHaveClass('dark:hover:bg-gray-700');
      });
    });
  });

  // ============================================================================
  // SINGLE APPROVAL TEST
  // ============================================================================

  describe('Single Approval', () => {
    it('renders correctly with single approval', () => {
      const single = [mockApprovals[0]];
      render(<DocumentApprovalsList initialApprovals={single} />);

      expect(screen.getByText('Settlement Agreement - Smith v. Jones')).toBeInTheDocument();
      expect(screen.queryByText('Motion to Dismiss')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // BORDER AND STYLING TESTS
  // ============================================================================

  describe('Border and Styling', () => {
    it('table container has rounded borders', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const container = screen.getByRole('table').closest('.rounded-lg');
      expect(container).toBeInTheDocument();
    });

    it('table container has overflow hidden', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const container = screen.getByRole('table').closest('.overflow-hidden');
      expect(container).toBeInTheDocument();
    });

    it('table container has border', () => {
      render(<DocumentApprovalsList initialApprovals={mockApprovals} />);

      const container = screen.getByRole('table').closest('.border');
      expect(container).toBeInTheDocument();
    });
  });
});
