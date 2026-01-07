/**
 * CaseCard Component Tests
 * Enterprise-grade test suite for case card display in grid/list views
 *
 * @module components/features/cases/CaseCard.test
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { CaseCard } from './CaseCard';
import type { Case } from '@/types';
import { CaseStatus, MatterPriority } from '@/types';
import { MemoryRouter } from 'react-router';

// Mock react-router Link
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 days ago'),
}));

describe('CaseCard', () => {
  const mockCase: Case = {
    id: 'case-123',
    title: 'Smith v. Johnson',
    caseNumber: 'CV-2024-001234',
    status: CaseStatus.Active,
    priority: MatterPriority.HIGH,
    description: 'Commercial litigation case',
    client: 'Acme Corporation',
    court: 'US District Court',
    jurisdiction: 'California',
    matterType: 'Litigation',
    practiceArea: 'Commercial Law',
    filingDate: '2024-01-15',
    trialDate: '2024-12-01',
    value: 500000,
    billingValue: 75000,
    leadAttorneyId: 'atty-001',
    parties: [{ id: 'p1', name: 'Smith' }, { id: 'p2', name: 'Johnson' }] as any,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
  };

  const renderWithRouter = (component: React.ReactNode) => {
    return render(component);
  };

  describe('Basic Rendering', () => {
    it('should render case title', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('Smith v. Johnson')).toBeInTheDocument();
    });

    it('should render case number', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('CV-2024-001234')).toBeInTheDocument();
    });

    it('should render client name', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    it('should display "Unknown Client" when client is not provided', () => {
      const caseWithoutClient = { ...mockCase, client: undefined };
      renderWithRouter(<CaseCard case={caseWithoutClient} />);

      expect(screen.getByText('Unknown Client')).toBeInTheDocument();
    });

    it('should display "No Number" when case number is not provided', () => {
      const caseWithoutNumber = { ...mockCase, caseNumber: undefined };
      renderWithRouter(<CaseCard case={caseWithoutNumber} />);

      expect(screen.getByText('No Number')).toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('should render status badge with correct status', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render different status badges', () => {
      const closedCase = { ...mockCase, status: CaseStatus.Closed };
      renderWithRouter(<CaseCard case={closedCase} />);

      expect(screen.getByText('Closed')).toBeInTheDocument();
    });
  });

  describe('Archived Cases', () => {
    it('should display archived badge when case is archived', () => {
      const archivedCase = { ...mockCase, isArchived: true };
      renderWithRouter(<CaseCard case={archivedCase} />);

      expect(screen.getByText('Archived')).toBeInTheDocument();
    });

    it('should not display archived badge when case is not archived', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.queryByText('Archived')).not.toBeInTheDocument();
    });
  });

  describe('Matter Type and Practice Area', () => {
    it('should display matter type badge', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('Litigation')).toBeInTheDocument();
    });

    it('should display practice area badge when different from matter type', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('Commercial Law')).toBeInTheDocument();
    });

    it('should not duplicate badge when practice area equals matter type', () => {
      const sameAreaCase = { ...mockCase, practiceArea: 'Litigation' };
      renderWithRouter(<CaseCard case={sameAreaCase} />);

      const litigationBadges = screen.getAllByText('Litigation');
      expect(litigationBadges).toHaveLength(1);
    });
  });

  describe('Court and Jurisdiction', () => {
    it('should display court information', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('US District Court')).toBeInTheDocument();
    });

    it('should display jurisdiction when court is not provided', () => {
      const caseWithJurisdiction = { ...mockCase, court: undefined };
      renderWithRouter(<CaseCard case={caseWithJurisdiction} />);

      expect(screen.getByText('California')).toBeInTheDocument();
    });
  });

  describe('Dates', () => {
    it('should display filing date', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText(/Filed:/)).toBeInTheDocument();
    });

    it('should display trial date', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText(/Trial:/)).toBeInTheDocument();
    });
  });

  describe('Financial Information', () => {
    it('should display case value when provided', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('$500,000')).toBeInTheDocument();
    });

    it('should display billing value when case value is not provided', () => {
      const caseWithBillingOnly = { ...mockCase, value: undefined };
      renderWithRouter(<CaseCard case={caseWithBillingOnly} />);

      expect(screen.getByText('$75,000')).toBeInTheDocument();
    });
  });

  describe('Parties Count', () => {
    it('should display parties count when parties exist', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should not display parties count when no parties', () => {
      const caseWithoutParties = { ...mockCase, parties: [] };
      renderWithRouter(<CaseCard case={caseWithoutParties} />);

      // No parties count should be shown
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Lead Attorney', () => {
    it('should display lead attorney when provided', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText(/Lead Attorney:/)).toBeInTheDocument();
    });
  });

  describe('Variant Rendering', () => {
    it('should render correctly in grid variant', () => {
      const { container } = renderWithRouter(<CaseCard case={mockCase} variant="grid" />);

      expect(container.firstChild).toHaveClass('flex-col');
    });

    it('should render correctly in list variant', () => {
      const { container } = renderWithRouter(<CaseCard case={mockCase} variant="list" />);

      expect(container.firstChild).toHaveClass('items-center');
    });
  });

  describe('Click Handler', () => {
    it('should call onClick handler when provided', () => {
      const mockOnClick = jest.fn();
      renderWithRouter(<CaseCard case={mockCase} onClick={mockOnClick} />);

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledWith(mockCase);
    });

    it('should render as button when onClick is provided', () => {
      const mockOnClick = jest.fn();
      renderWithRouter(<CaseCard case={mockCase} onClick={mockOnClick} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render as link when onClick is not provided', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/cases/case-123');
    });
  });

  describe('Quick Actions', () => {
    it('should show quick actions button when enabled', () => {
      renderWithRouter(<CaseCard case={mockCase} showActions />);

      expect(screen.getByLabelText('Quick actions')).toBeInTheDocument();
    });

    it('should not show quick actions button by default', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.queryByLabelText('Quick actions')).not.toBeInTheDocument();
    });

    it('should prevent card click when clicking quick actions', () => {
      const mockOnClick = jest.fn();
      renderWithRouter(<CaseCard case={mockCase} onClick={mockOnClick} showActions />);

      const actionsButton = screen.getByLabelText('Quick actions');
      fireEvent.click(actionsButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Relative Time', () => {
    it('should display relative time for updatedAt', () => {
      renderWithRouter(<CaseCard case={mockCase} />);

      expect(screen.getByText('2 days ago')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = renderWithRouter(
        <CaseCard case={mockCase} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper cursor styling for clickable card', () => {
      const { container } = renderWithRouter(
        <CaseCard case={mockCase} onClick={() => {}} />
      );

      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('should have tabIndex when onClick is provided', () => {
      renderWithRouter(<CaseCard case={mockCase} onClick={() => {}} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const { container } = renderWithRouter(<CaseCard case={mockCase} />);

      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
      expect(container.firstChild).toHaveClass('dark:border-gray-700');
    });
  });

  describe('Hover States', () => {
    it('should have hover shadow class', () => {
      const { container } = renderWithRouter(<CaseCard case={mockCase} />);

      expect(container.firstChild).toHaveClass('hover:shadow-md');
    });
  });

  describe('Edge Cases', () => {
    it('should handle case with minimal data', () => {
      const minimalCase: Case = {
        id: 'min-case',
        title: 'Minimal Case',
        status: CaseStatus.Active,
        priority: MatterPriority.LOW,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      renderWithRouter(<CaseCard case={minimalCase} />);

      expect(screen.getByText('Minimal Case')).toBeInTheDocument();
      expect(screen.getByText('No Number')).toBeInTheDocument();
      expect(screen.getByText('Unknown Client')).toBeInTheDocument();
    });

    it('should handle invalid date gracefully', () => {
      const caseWithInvalidDate = { ...mockCase, filingDate: 'invalid-date' };
      renderWithRouter(<CaseCard case={caseWithInvalidDate} />);

      expect(screen.getByText(/Invalid date/)).toBeInTheDocument();
    });
  });
});
