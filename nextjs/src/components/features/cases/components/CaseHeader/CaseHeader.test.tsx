/**
 * CaseHeader Component Tests
 * Enterprise-grade test suite for case header with actions and metadata
 *
 * @module components/features/cases/CaseHeader.test
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseHeader } from './CaseHeader';
import type { Case } from '@/types';
import { CaseStatus, MatterPriority } from '@/types';

// Mock react-router Link
jest.mock('react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

// Mock CaseStatusBadge
jest.mock('../CaseStatusBadge', () => ({
  CaseStatusBadge: ({ status, showIcon }: { status: string; showIcon?: boolean }) => (
    <span data-testid="status-badge" data-show-icon={showIcon}>{status}</span>
  ),
}));

// Mock CaseQuickActions
jest.mock('../CaseQuickActions', () => ({
  CaseQuickActions: ({ onEdit, onDelete, onArchive, onShare }: any) => (
    <div data-testid="quick-actions">
      {onEdit && <button onClick={() => onEdit({})}>Edit</button>}
      {onDelete && <button onClick={() => onDelete({})}>Delete</button>}
      {onArchive && <button onClick={() => onArchive({})}>Archive</button>}
      {onShare && <button onClick={() => onShare({})}>Share</button>}
    </div>
  ),
}));

describe('CaseHeader', () => {
  const mockCase: Case = {
    id: 'case-123',
    title: 'Smith v. Johnson',
    caseNumber: 'CV-2024-001234',
    status: CaseStatus.Active,
    priority: MatterPriority.HIGH,
    description: 'Commercial litigation case involving breach of contract',
    client: 'Acme Corporation',
    court: 'US District Court',
    matterType: 'Litigation',
    filingDate: '2024-01-15',
    solDate: '2024-03-01', // Within 90 days for warning
    trialDate: '2024-12-01',
    budget: { amount: 100000, currency: 'USD' } as any,
    billingValue: 85000,
    budgetAlertThreshold: 80,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
  };

  describe('Basic Rendering', () => {
    it('should render case title', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByRole('heading', { name: 'Smith v. Johnson' })).toBeInTheDocument();
    });

    it('should render case number', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByText('CV-2024-001234')).toBeInTheDocument();
    });

    it('should display "No Case Number" when not provided', () => {
      const caseWithoutNumber = { ...mockCase, caseNumber: undefined };
      render(<CaseHeader case={caseWithoutNumber} />);

      expect(screen.getByText('No Case Number')).toBeInTheDocument();
    });

    it('should render status badge', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByTestId('status-badge')).toHaveTextContent('Active');
    });

    it('should render status badge with icon', () => {
      render(<CaseHeader case={mockCase} />);

      const statusBadge = screen.getByTestId('status-badge');
      expect(statusBadge).toHaveAttribute('data-show-icon', 'true');
    });
  });

  describe('Breadcrumbs', () => {
    it('should render breadcrumbs by default', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByText('Cases')).toBeInTheDocument();
    });

    it('should have correct back link', () => {
      render(<CaseHeader case={mockCase} backTo="/my-cases" />);

      const backLink = screen.getByText('Cases');
      expect(backLink).toHaveAttribute('href', '/my-cases');
    });

    it('should hide breadcrumbs when showBreadcrumbs is false', () => {
      render(<CaseHeader case={mockCase} showBreadcrumbs={false} />);

      expect(screen.queryByText('Cases')).not.toBeInTheDocument();
    });

    it('should display case number in breadcrumb', () => {
      render(<CaseHeader case={mockCase} />);

      // Case number appears in breadcrumb trail
      expect(screen.getByText('CV-2024-001234')).toBeInTheDocument();
    });
  });

  describe('Archived Badge', () => {
    it('should show archived badge when case is archived', () => {
      const archivedCase = { ...mockCase, isArchived: true };
      render(<CaseHeader case={archivedCase} />);

      expect(screen.getByText(/Archived/)).toBeInTheDocument();
    });

    it('should not show archived badge when case is not archived', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.queryByText(/Archived/)).not.toBeInTheDocument();
    });
  });

  describe('Client Information', () => {
    it('should display client name', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByText(/Client:/)).toBeInTheDocument();
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    it('should display "Unknown" when client is not provided', () => {
      const caseWithoutClient = { ...mockCase, client: undefined };
      render(<CaseHeader case={caseWithoutClient} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('Court Information', () => {
    it('should display court when provided', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByText(/Court:/)).toBeInTheDocument();
      expect(screen.getByText('US District Court')).toBeInTheDocument();
    });

    it('should not display court section when not provided', () => {
      const caseWithoutCourt = { ...mockCase, court: undefined };
      render(<CaseHeader case={caseWithoutCourt} />);

      expect(screen.queryByText(/Court:/)).not.toBeInTheDocument();
    });
  });

  describe('Filing Date', () => {
    it('should display filing date when provided', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByText(/Filed:/)).toBeInTheDocument();
    });

    it('should not display filing date when not provided', () => {
      const caseWithoutFilingDate = { ...mockCase, filingDate: undefined };
      render(<CaseHeader case={caseWithoutFilingDate} />);

      expect(screen.queryByText(/Filed:/)).not.toBeInTheDocument();
    });
  });

  describe('Matter Type', () => {
    it('should display matter type when provided', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByText(/Type:/)).toBeInTheDocument();
      expect(screen.getByText('Litigation')).toBeInTheDocument();
    });

    it('should not display matter type when not provided', () => {
      const caseWithoutType = { ...mockCase, matterType: undefined };
      render(<CaseHeader case={caseWithoutType} />);

      expect(screen.queryByText(/Type:/)).not.toBeInTheDocument();
    });
  });

  describe('Description', () => {
    it('should display description when provided', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByText(/Commercial litigation case involving breach of contract/)).toBeInTheDocument();
    });

    it('should not display description when not provided', () => {
      const caseWithoutDescription = { ...mockCase, description: undefined };
      render(<CaseHeader case={caseWithoutDescription} />);

      expect(screen.queryByText(/Commercial litigation/)).not.toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should render quick actions component', () => {
      render(<CaseHeader case={mockCase} />);

      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('should pass onEdit handler to quick actions', () => {
      const mockOnEdit = jest.fn();
      render(<CaseHeader case={mockCase} onEdit={mockOnEdit} />);

      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should pass onDelete handler to quick actions', () => {
      const mockOnDelete = jest.fn();
      render(<CaseHeader case={mockCase} onDelete={mockOnDelete} />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should pass onArchive handler to quick actions', () => {
      const mockOnArchive = jest.fn();
      render(<CaseHeader case={mockCase} onArchive={mockOnArchive} />);

      expect(screen.getByText('Archive')).toBeInTheDocument();
    });

    it('should pass onShare handler to quick actions', () => {
      const mockOnShare = jest.fn();
      render(<CaseHeader case={mockCase} onShare={mockOnShare} />);

      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  describe('Warning Badges', () => {
    it('should show statute of limitations warning when SOL date is within 90 days', () => {
      // Set up case with SOL date within 90 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const caseWithSOL = { ...mockCase, solDate: futureDate.toISOString() };

      render(<CaseHeader case={caseWithSOL} />);

      expect(screen.getByText(/Statute of Limitations:/)).toBeInTheDocument();
    });

    it('should show trial date badge when trial date is in the future', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      const caseWithTrial = { ...mockCase, trialDate: futureDate.toISOString() };

      render(<CaseHeader case={caseWithTrial} />);

      expect(screen.getByText(/Trial Date:/)).toBeInTheDocument();
    });

    it('should show budget alert when threshold is exceeded', () => {
      const caseOverBudget = {
        ...mockCase,
        budgetAlertThreshold: 80,
        budget: { amount: 100000, currency: 'USD' } as any,
        billingValue: 90000, // 90% of budget
      };

      render(<CaseHeader case={caseOverBudget} />);

      expect(screen.getByText(/Budget Alert:/)).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <CaseHeader case={mockCase} className="custom-header-class" />
      );

      expect(container.firstChild).toHaveClass('custom-header-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CaseHeader case={mockCase} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Smith v. Johnson');
    });

    it('should have accessible navigation', () => {
      render(<CaseHeader case={mockCase} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<CaseHeader case={mockCase} />);

      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
      expect(container.firstChild).toHaveClass('dark:border-gray-700');
    });
  });

  describe('Responsive Layout', () => {
    it('should have grid layout for quick info', () => {
      const { container } = render(<CaseHeader case={mockCase} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal case data', () => {
      const minimalCase: Case = {
        id: 'min-case',
        title: 'Minimal Case',
        status: CaseStatus.Active,
        priority: MatterPriority.LOW,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<CaseHeader case={minimalCase} />);

      expect(screen.getByText('Minimal Case')).toBeInTheDocument();
      expect(screen.getByText('No Case Number')).toBeInTheDocument();
    });

    it('should handle long title', () => {
      const longTitleCase = {
        ...mockCase,
        title: 'This is a Very Long Case Title That Should Still Render Properly Without Breaking Layout',
      };

      render(<CaseHeader case={longTitleCase} />);

      expect(screen.getByText(/This is a Very Long Case Title/)).toBeInTheDocument();
    });
  });
});
