/**
 * CaseHeader Component Tests
 * Enterprise-grade test suite for case header display
 *
 * @module components/cases/CaseHeader.test
 */

import { render, screen } from '@testing-library/react';
import { CaseHeader } from './CaseHeader';
import type { Case } from '@/types';
import { CaseStatus, MatterPriority } from '@/types';

// Mock the formatDate utility
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn((date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }),
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('CaseHeader', () => {
  const mockCaseData: Case = {
    id: 'case-123',
    title: 'Smith v. Johnson',
    caseNumber: 'CV-2024-001234',
    status: CaseStatus.Active,
    priority: MatterPriority.HIGH,
    description: 'Commercial litigation dispute',
    court: 'US District Court, Northern District',
    filingDate: '2024-01-15',
    assignedTo: 'John Attorney',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
  };

  describe('Basic Rendering', () => {
    it('should render case title', () => {
      render(<CaseHeader caseData={mockCaseData} />);

      expect(screen.getByRole('heading', { name: mockCaseData.title })).toBeInTheDocument();
    });

    it('should render case number', () => {
      render(<CaseHeader caseData={mockCaseData} />);

      expect(screen.getByText(mockCaseData.caseNumber!)).toBeInTheDocument();
    });

    it('should render Edit Case button', () => {
      render(<CaseHeader caseData={mockCaseData} />);

      expect(screen.getByRole('button', { name: 'Edit Case' })).toBeInTheDocument();
    });
  });

  describe('Court Information', () => {
    it('should display court information when provided', () => {
      render(<CaseHeader caseData={mockCaseData} />);

      expect(screen.getByText(mockCaseData.court!)).toBeInTheDocument();
    });

    it('should not display court section when court is not provided', () => {
      const caseWithoutCourt = { ...mockCaseData, court: undefined };
      render(<CaseHeader caseData={caseWithoutCourt} />);

      expect(screen.queryByText('US District Court')).not.toBeInTheDocument();
    });
  });

  describe('Filing Date', () => {
    it('should display filing date when provided', () => {
      render(<CaseHeader caseData={mockCaseData} />);

      // Check for "Filed:" text
      expect(screen.getByText(/Filed:/)).toBeInTheDocument();
    });

    it('should not display filing date section when not provided', () => {
      const caseWithoutFilingDate = { ...mockCaseData, filingDate: undefined };
      render(<CaseHeader caseData={caseWithoutFilingDate} />);

      expect(screen.queryByText(/Filed:/)).not.toBeInTheDocument();
    });
  });

  describe('Assigned Attorney', () => {
    it('should display assigned attorney when provided', () => {
      render(<CaseHeader caseData={mockCaseData} />);

      expect(screen.getByText(/Assigned to:/)).toBeInTheDocument();
      expect(screen.getByText(mockCaseData.assignedTo!)).toBeInTheDocument();
    });

    it('should not display assigned section when not provided', () => {
      const caseWithoutAssignee = { ...mockCaseData, assignedTo: undefined };
      render(<CaseHeader caseData={caseWithoutAssignee} />);

      expect(screen.queryByText(/Assigned to:/)).not.toBeInTheDocument();
    });
  });

  describe('Minimal Case Data', () => {
    it('should render with minimal required data', () => {
      const minimalCase: Case = {
        id: 'case-min',
        title: 'Minimal Case',
        status: CaseStatus.Active,
        priority: MatterPriority.LOW,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<CaseHeader caseData={minimalCase} />);

      expect(screen.getByRole('heading', { name: 'Minimal Case' })).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper container styling', () => {
      const { container } = render(<CaseHeader caseData={mockCaseData} />);

      const headerContainer = container.firstChild;
      expect(headerContainer).toHaveClass('bg-white', 'rounded-lg', 'border');
    });

    it('should render grid layout for metadata', () => {
      const { container } = render(<CaseHeader caseData={mockCaseData} />);

      const gridElement = container.querySelector('.grid');
      expect(gridElement).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('should render icons for metadata items', () => {
      render(<CaseHeader caseData={mockCaseData} />);

      // Icons are rendered via lucide-react
      // Check that the metadata sections exist
      const metadataItems = screen.getAllByText(/Filed:|Assigned to:/);
      expect(metadataItems.length).toBeGreaterThan(0);
    });
  });

  describe('Different Case Statuses', () => {
    const statuses = Object.values(CaseStatus);

    statuses.forEach(status => {
      it(`should render correctly with ${status} status`, () => {
        const caseWithStatus = { ...mockCaseData, status };
        render(<CaseHeader caseData={caseWithStatus} />);

        expect(screen.getByRole('heading', { name: mockCaseData.title })).toBeInTheDocument();
      });
    });
  });

  describe('Long Content Handling', () => {
    it('should handle long case titles', () => {
      const caseWithLongTitle = {
        ...mockCaseData,
        title: 'This is a Very Long Case Title That Spans Multiple Words and Should Still Render Correctly',
      };

      render(<CaseHeader caseData={caseWithLongTitle} />);

      expect(screen.getByRole('heading')).toHaveTextContent(caseWithLongTitle.title);
    });

    it('should handle long court names', () => {
      const caseWithLongCourt = {
        ...mockCaseData,
        court: 'United States District Court for the Eastern District of California, Sacramento Division',
      };

      render(<CaseHeader caseData={caseWithLongCourt} />);

      expect(screen.getByText(caseWithLongCourt.court)).toBeInTheDocument();
    });
  });
});
