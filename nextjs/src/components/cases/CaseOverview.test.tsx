/**
 * CaseOverview Component Tests
 * Enterprise-grade test suite for case overview display
 *
 * @module components/cases/CaseOverview.test
 */

import { render, screen } from '@testing-library/react';
import { CaseOverview } from './CaseOverview';
import type { Case } from '@/types';
import { CaseStatus, MatterPriority } from '@/types';

describe('CaseOverview', () => {
  const mockCaseData: Case = {
    id: 'case-123',
    title: 'Smith v. Johnson',
    caseNumber: 'CV-2024-001234',
    status: CaseStatus.Active,
    priority: MatterPriority.HIGH,
    description: 'This is a comprehensive commercial litigation dispute involving breach of contract claims.',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
  };

  describe('Rendering', () => {
    it('should render the Overview heading', () => {
      render(<CaseOverview caseData={mockCaseData} />);

      expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    });

    it('should render within a styled container', () => {
      const { container } = render(<CaseOverview caseData={mockCaseData} />);

      const overviewContainer = container.firstChild;
      expect(overviewContainer).toHaveClass('bg-white', 'rounded-lg', 'border');
    });
  });

  describe('Description Display', () => {
    it('should display case description when provided', () => {
      render(<CaseOverview caseData={mockCaseData} />);

      expect(screen.getByText(mockCaseData.description!)).toBeInTheDocument();
    });

    it('should not render description paragraph when description is not provided', () => {
      const caseWithoutDescription = { ...mockCaseData, description: undefined };
      render(<CaseOverview caseData={caseWithoutDescription} />);

      // Only the heading should be present
      expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();

      // Check that no paragraph with description content exists
      const paragraphs = screen.queryAllByRole('paragraph');
      // Description paragraph should not exist
      expect(screen.queryByText(mockCaseData.description!)).not.toBeInTheDocument();
    });

    it('should not render description when it is empty string', () => {
      const caseWithEmptyDescription = { ...mockCaseData, description: '' };
      render(<CaseOverview caseData={caseWithEmptyDescription} />);

      expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    });
  });

  describe('Long Description Handling', () => {
    it('should handle very long descriptions', () => {
      const longDescription = 'Lorem ipsum dolor sit amet, '.repeat(50);
      const caseWithLongDescription = { ...mockCaseData, description: longDescription };

      render(<CaseOverview caseData={caseWithLongDescription} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle descriptions with special characters', () => {
      const specialDescription = 'Case involves $1,000,000 in damages & attorney\'s fees. "Important quote" here.';
      const caseWithSpecialChars = { ...mockCaseData, description: specialDescription };

      render(<CaseOverview caseData={caseWithSpecialChars} />);

      expect(screen.getByText(specialDescription)).toBeInTheDocument();
    });

    it('should handle multi-line descriptions', () => {
      const multiLineDescription = 'First paragraph of case description.\nSecond paragraph with more details.\nThird paragraph concluding the overview.';
      const caseWithMultiLine = { ...mockCaseData, description: multiLineDescription };

      render(<CaseOverview caseData={caseWithMultiLine} />);

      expect(screen.getByText(multiLineDescription)).toBeInTheDocument();
    });
  });

  describe('Minimal Data', () => {
    it('should render with minimal required case data', () => {
      const minimalCase: Case = {
        id: 'case-min',
        title: 'Minimal Case',
        status: CaseStatus.Active,
        priority: MatterPriority.LOW,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<CaseOverview caseData={minimalCase} />);

      expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    });
  });

  describe('Different Case Types', () => {
    const testCases = [
      { status: CaseStatus.Active, description: 'Active case description' },
      { status: CaseStatus.Pending, description: 'Pending case description' },
      { status: CaseStatus.Closed, description: 'Closed case description' },
      { status: CaseStatus.Archived, description: 'Archived case description' },
    ];

    testCases.forEach(({ status, description }) => {
      it(`should render correctly for ${status} case`, () => {
        const caseWithStatus: Case = {
          ...mockCaseData,
          status,
          description,
        };

        render(<CaseOverview caseData={caseWithStatus} />);

        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have properly structured heading', () => {
      render(<CaseOverview caseData={mockCaseData} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Overview');
    });

    it('should have readable text colors', () => {
      render(<CaseOverview caseData={mockCaseData} />);

      const description = screen.getByText(mockCaseData.description!);
      expect(description).toHaveClass('text-slate-600');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<CaseOverview caseData={mockCaseData} />);

      const overviewContainer = container.firstChild;
      expect(overviewContainer).toHaveClass('dark:bg-slate-900');
      expect(overviewContainer).toHaveClass('dark:border-slate-800');
    });

    it('should have dark mode text classes for heading', () => {
      render(<CaseOverview caseData={mockCaseData} />);

      const heading = screen.getByRole('heading', { name: 'Overview' });
      expect(heading).toHaveClass('dark:text-slate-50');
    });

    it('should have dark mode text classes for description', () => {
      render(<CaseOverview caseData={mockCaseData} />);

      const description = screen.getByText(mockCaseData.description!);
      expect(description).toHaveClass('dark:text-slate-400');
    });
  });

  describe('Component Styling', () => {
    it('should have proper padding', () => {
      const { container } = render(<CaseOverview caseData={mockCaseData} />);

      const overviewContainer = container.firstChild;
      expect(overviewContainer).toHaveClass('p-6');
    });

    it('should have proper margin on heading', () => {
      render(<CaseOverview caseData={mockCaseData} />);

      const heading = screen.getByRole('heading', { name: 'Overview' });
      expect(heading).toHaveClass('mb-4');
    });

    it('should have proper font styling for heading', () => {
      render(<CaseOverview caseData={mockCaseData} />);

      const heading = screen.getByRole('heading', { name: 'Overview' });
      expect(heading).toHaveClass('text-xl', 'font-semibold');
    });
  });
});
