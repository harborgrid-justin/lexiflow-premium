/**
 * CaseTimeline Component Tests
 * Enterprise-grade test suite for case timeline display
 *
 * @module components/cases/CaseTimeline.test
 */

import { render, screen } from '@testing-library/react';
import { CaseTimeline } from './CaseTimeline';

describe('CaseTimeline', () => {
  const mockCaseId = 'case-123';

  describe('Rendering', () => {
    it('should render the Timeline heading', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      expect(screen.getByRole('heading', { name: 'Timeline' })).toBeInTheDocument();
    });

    it('should display the case ID in the content', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      expect(screen.getByText(`Timeline for case ${mockCaseId}`)).toBeInTheDocument();
    });

    it('should render within a styled container', () => {
      const { container } = render(<CaseTimeline caseId={mockCaseId} />);

      const timelineContainer = container.firstChild;
      expect(timelineContainer).toHaveClass('bg-white', 'rounded-lg', 'border');
    });
  });

  describe('Different Case IDs', () => {
    it('should display different case ID - alphanumeric', () => {
      render(<CaseTimeline caseId="abc123def456" />);

      expect(screen.getByText('Timeline for case abc123def456')).toBeInTheDocument();
    });

    it('should display different case ID - UUID format', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      render(<CaseTimeline caseId={uuid} />);

      expect(screen.getByText(`Timeline for case ${uuid}`)).toBeInTheDocument();
    });

    it('should display different case ID - numeric string', () => {
      render(<CaseTimeline caseId="12345" />);

      expect(screen.getByText('Timeline for case 12345')).toBeInTheDocument();
    });

    it('should handle case ID with special characters', () => {
      render(<CaseTimeline caseId="case-2024-001" />);

      expect(screen.getByText('Timeline for case case-2024-001')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have proper heading level', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Timeline');
    });

    it('should have description text', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      const description = screen.getByText(`Timeline for case ${mockCaseId}`);
      expect(description.tagName).toBe('P');
    });
  });

  describe('Styling', () => {
    it('should have container styling', () => {
      const { container } = render(<CaseTimeline caseId={mockCaseId} />);

      const timelineContainer = container.firstChild;
      expect(timelineContainer).toHaveClass('p-6');
    });

    it('should have dark mode classes on container', () => {
      const { container } = render(<CaseTimeline caseId={mockCaseId} />);

      const timelineContainer = container.firstChild;
      expect(timelineContainer).toHaveClass('dark:bg-slate-900');
      expect(timelineContainer).toHaveClass('dark:border-slate-800');
    });

    it('should have proper heading styling', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      const heading = screen.getByRole('heading', { name: 'Timeline' });
      expect(heading).toHaveClass('text-xl', 'font-semibold', 'mb-4');
    });

    it('should have proper text styling', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      const text = screen.getByText(`Timeline for case ${mockCaseId}`);
      expect(text).toHaveClass('text-slate-600');
    });

    it('should have dark mode text styling', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      const heading = screen.getByRole('heading', { name: 'Timeline' });
      expect(heading).toHaveClass('dark:text-slate-50');

      const text = screen.getByText(`Timeline for case ${mockCaseId}`);
      expect(text).toHaveClass('dark:text-slate-400');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading structure', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveAttribute('class');
    });

    it('should render readable content', () => {
      render(<CaseTimeline caseId={mockCaseId} />);

      expect(screen.getByText(/Timeline/)).toBeInTheDocument();
      expect(screen.getByText(/case/)).toBeInTheDocument();
    });
  });

  describe('Rerendering', () => {
    it('should update when caseId prop changes', () => {
      const { rerender } = render(<CaseTimeline caseId="case-1" />);

      expect(screen.getByText('Timeline for case case-1')).toBeInTheDocument();

      rerender(<CaseTimeline caseId="case-2" />);

      expect(screen.getByText('Timeline for case case-2')).toBeInTheDocument();
      expect(screen.queryByText('Timeline for case case-1')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string caseId', () => {
      render(<CaseTimeline caseId="" />);

      expect(screen.getByText('Timeline for case')).toBeInTheDocument();
    });

    it('should handle very long caseId', () => {
      const longId = 'a'.repeat(100);
      render(<CaseTimeline caseId={longId} />);

      expect(screen.getByText(`Timeline for case ${longId}`)).toBeInTheDocument();
    });
  });
});
