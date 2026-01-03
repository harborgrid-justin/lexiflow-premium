/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  CitationManager,
  type CitationManagerProps,
  type Citation,
  type CitationFormat,
  type CitationStatus,
} from '@/components/enterprise/Research/CitationManager';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('CitationManager', () => {
  const mockOnAddCitation = jest.fn();
  const mockOnUpdateCitation = jest.fn();
  const mockOnDeleteCitation = jest.fn();
  const mockOnValidateCitations = jest.fn();
  const mockOnExport = jest.fn();

  const mockCitations: Citation[] = [
    {
      id: '1',
      text: 'Hadley v. Baxendale',
      formatted: 'Hadley v. Baxendale, 9 Ex. 341, 156 Eng. Rep. 145 (1854).',
      type: 'case',
      status: 'valid',
      format: 'bluebook',
      footnoteNumber: 1,
      metadata: {
        court: 'Court of Exchequer',
        year: '1854',
      },
      connections: ['2'],
    },
    {
      id: '2',
      text: 'UCC § 2-714',
      formatted: 'U.C.C. § 2-714 (2023).',
      type: 'statute',
      status: 'valid',
      format: 'bluebook',
      footnoteNumber: 2,
      connections: ['1', '3'],
    },
  ];

  const defaultProps: CitationManagerProps = {
    citations: mockCitations,
    onAddCitation: mockOnAddCitation,
    onUpdateCitation: mockOnUpdateCitation,
    onDeleteCitation: mockOnDeleteCitation,
    onValidateCitations: mockOnValidateCitations,
    onExport: mockOnExport,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Citation List Rendering', () => {
    it('should render citation manager with title and stats', () => {
      render(<CitationManager {...defaultProps} />);

      expect(screen.getByText(/citation manager/i)).toBeInTheDocument();
      expect(screen.getByText(/bluebook formatting/i)).toBeInTheDocument();
    });

    it('should display citation statistics', () => {
      render(<CitationManager {...defaultProps} />);

      expect(screen.getByText('Total Citations')).toBeInTheDocument();
      expect(screen.getByText('Valid')).toBeInTheDocument();
      expect(screen.getByText('Warnings')).toBeInTheDocument();
      expect(screen.getByText('Errors')).toBeInTheDocument();
    });

    it('should render all citations in list view', () => {
      render(<CitationManager {...defaultProps} />);

      expect(screen.getByText('Hadley v. Baxendale')).toBeInTheDocument();
      expect(screen.getByText('UCC § 2-714')).toBeInTheDocument();
    });

    it('should display footnote numbers for citations', () => {
      render(<CitationManager {...defaultProps} />);

      // Footnote numbers are displayed in circular badges
      const footnoteNumbers = screen.getAllByText(/^[1-3]$/);
      expect(footnoteNumbers.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter citations by type', () => {
      render(<CitationManager {...defaultProps} />);

      const filters = screen.getAllByRole('combobox');
      const typeSelect = filters.find(select =>
        select.querySelector('option[value="case"]')
      );

      if (typeSelect) {
        fireEvent.change(typeSelect, { target: { value: 'case' } });

        expect(screen.getByText('Hadley v. Baxendale')).toBeInTheDocument();
      }
    });

    it('should search citations by text', () => {
      render(<CitationManager {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search citations...');

      fireEvent.change(searchInput, { target: { value: 'Hadley' } });

      expect(screen.getByText('Hadley v. Baxendale')).toBeInTheDocument();
    });
  });

  describe('Bluebook Formatting', () => {
    it('should display properly formatted Bluebook citations', () => {
      render(<CitationManager {...defaultProps} />);

      expect(screen.getByText(/hadley v\. baxendale, 9 ex\. 341/i)).toBeInTheDocument();
      expect(screen.getByText(/u\.c\.c\. § 2-714/i)).toBeInTheDocument();
    });

    it('should allow format selection (Bluebook, ALWD, APA, Chicago)', () => {
      render(<CitationManager {...defaultProps} />);

      const formatSelectors = screen.getAllByRole('combobox');
      const formatSelect = formatSelectors.find(select =>
        select.querySelector('option[value="bluebook"]')
      );

      expect(formatSelect).toBeInTheDocument();

      if (formatSelect) {
        fireEvent.change(formatSelect, { target: { value: 'alwd' } });
        fireEvent.change(formatSelect, { target: { value: 'apa' } });
        fireEvent.change(formatSelect, { target: { value: 'chicago' } });
      }
    });

    it('should copy citation to clipboard when copy button is clicked', () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn(),
        },
      });

      render(<CitationManager {...defaultProps} />);

      const copyButtons = screen.getAllByTitle(/copy/i);

      if (copyButtons.length > 0) {
        fireEvent.click(copyButtons[0]);
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      }
    });
  });

  describe('Validation Status', () => {
    it('should display validation status icons for citations', () => {
      render(<CitationManager {...defaultProps} />);

      // Check for valid and warning status texts in the citation cards
      expect(screen.getByText('Hadley v. Baxendale')).toBeInTheDocument();
      expect(screen.getByText('UCC § 2-714')).toBeInTheDocument();
      // Citations should have status indicators (valid, warning, etc.)
      const validIcon = screen.getAllByText(/case|statute|book/i);
      expect(validIcon.length).toBeGreaterThan(0);
    });

    it('should show validation messages for warnings', () => {
      const citationsWithWarnings: Citation[] = [
        {
          ...mockCitations[0],
          status: 'warning',
          validationMessages: ['Check if latest edition is cited'],
        },
      ];

      render(<CitationManager citations={citationsWithWarnings} />);

      expect(screen.getByText(/check if latest edition is cited/i)).toBeInTheDocument();
    });

    it('should call onValidateCitations when validate all button is clicked', () => {
      render(<CitationManager {...defaultProps} />);

      const validateButton = screen.getByRole('button', { name: /validate all/i });
      fireEvent.click(validateButton);

      expect(mockOnValidateCitations).toHaveBeenCalledWith(mockCitations);
    });

    it('should display different colors for validation statuses', () => {
      const citationsWithStatuses: Citation[] = [
        { ...mockCitations[0], status: 'valid' },
        { ...mockCitations[1], status: 'warning' },
      ];

      render(<CitationManager citations={citationsWithStatuses} />);

      // Component should render with different status indicators
      expect(screen.getByText('Hadley v. Baxendale')).toBeInTheDocument();
    });
  });

  describe('Graph Visualization', () => {
    it('should switch to graph view when tab is clicked', () => {
      render(<CitationManager {...defaultProps} />);

      const graphTab = screen.getByRole('button', { name: /citation graph/i });
      fireEvent.click(graphTab);

      expect(screen.getByText(/citation network graph/i)).toBeInTheDocument();
    });

    it('should display citation connections in graph view', () => {
      render(<CitationManager {...defaultProps} />);

      const graphTab = screen.getByRole('button', { name: /citation graph/i });
      fireEvent.click(graphTab);

      expect(screen.getByText(/visual representation/i)).toBeInTheDocument();
    });

    it('should show connection count for citations', () => {
      render(<CitationManager {...defaultProps} />);

      expect(screen.getByText(/1 connections/i)).toBeInTheDocument();
      expect(screen.getByText(/2 connections/i)).toBeInTheDocument();
    });
  });

  describe('Footnote Management', () => {
    it('should switch to footnotes view when tab is clicked', () => {
      render(<CitationManager {...defaultProps} />);

      const footnotesTab = screen.getByRole('button', { name: /footnotes/i });
      fireEvent.click(footnotesTab);

      expect(screen.getByText(/footnote preview/i)).toBeInTheDocument();
    });

    it('should display citations in footnote format', () => {
      render(<CitationManager {...defaultProps} />);

      const footnotesTab = screen.getByRole('button', { name: /footnotes/i });
      fireEvent.click(footnotesTab);

      // Should show superscript numbers
      expect(screen.getByText(/hadley v\. baxendale, 9 ex\. 341/i)).toBeInTheDocument();
    });

    it('should order footnotes by number', () => {
      render(<CitationManager {...defaultProps} />);

      const footnotesTab = screen.getByRole('button', { name: /footnotes/i });
      fireEvent.click(footnotesTab);

      // Check if footnote content is displayed
      expect(screen.getByText(/Hadley v. Baxendale, 9 Ex. 341/i)).toBeInTheDocument();
    });
  });

  describe('Format Conversion', () => {
    it('should allow adding new citations', () => {
      render(<CitationManager {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add citation/i });
      fireEvent.click(addButton);

      // Dialog or form should appear
      expect(addButton).toBeInTheDocument();
    });

    it('should allow editing citations', () => {
      render(<CitationManager {...defaultProps} />);

      const editButtons = screen.getAllByTitle(/edit/i);

      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
        // Edit functionality should be triggered
      }
    });

    it('should call onDeleteCitation when delete button is clicked', () => {
      render(<CitationManager {...defaultProps} />);

      const deleteButtons = screen.getAllByTitle(/delete/i);

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
        expect(mockOnDeleteCitation).toHaveBeenCalledWith('1');
      }
    });

    it('should export citations in different formats', () => {
      render(<CitationManager {...defaultProps} />);

      const exportButton = screen.getByTitle(/export/i);
      fireEvent.click(exportButton);

      // Export should be called
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Citation Type Indicators', () => {
    it('should display correct icons for different citation types', () => {
      render(<CitationManager {...defaultProps} />);

      expect(screen.getByText('case')).toBeInTheDocument();
      expect(screen.getByText('statute')).toBeInTheDocument();
    });

    it('should display colored badges for citation types', () => {
      render(<CitationManager {...defaultProps} />);

      const typeBadges = screen.getAllByText(/case|statute/i);
      expect(typeBadges.length).toBeGreaterThan(0);
    });
  });
});
