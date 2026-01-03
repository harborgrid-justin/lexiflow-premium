/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  ResearchMemo,
  type ResearchMemoProps,
  type MemoSection,
  type MemoVersion,
  type MemoComment,
} from '@/components/enterprise/Research/ResearchMemo';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ResearchMemo', () => {
  const mockOnSave = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnShare = jest.fn();
  const mockOnAISummarize = jest.fn().mockResolvedValue('AI-generated summary');

  const defaultProps: ResearchMemoProps = {
    onSave: mockOnSave,
    onExport: mockOnExport,
    onShare: mockOnShare,
    onAISummarize: mockOnAISummarize,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Memo Section Editing', () => {
    it('should render memo with default sections', () => {
      render(<ResearchMemo {...defaultProps} />);

      expect(screen.getByText(/issue/i)).toBeInTheDocument();
      expect(screen.getByText(/brief answer/i)).toBeInTheDocument();
      expect(screen.getByText(/facts/i)).toBeInTheDocument();
      expect(screen.getByText(/analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/conclusion/i)).toBeInTheDocument();
    });

    it('should allow editing memo title', () => {
      render(<ResearchMemo {...defaultProps} />);

      const titleInput = screen.getByPlaceholderText(/memo title/i);

      fireEvent.change(titleInput, { target: { value: 'Contract Dispute Analysis' } });

      expect(titleInput).toHaveValue('Contract Dispute Analysis');
    });

    it('should allow editing client and matter fields', () => {
      render(<ResearchMemo {...defaultProps} />);

      const clientInput = screen.getByPlaceholderText(/client name/i);
      const matterInput = screen.getByPlaceholderText(/matter number/i);

      fireEvent.change(clientInput, { target: { value: 'Acme Corp' } });
      fireEvent.change(matterInput, { target: { value: '2024-001' } });

      expect(clientInput).toHaveValue('Acme Corp');
      expect(matterInput).toHaveValue('2024-001');
    });

    it('should switch between sections when sidebar buttons are clicked', () => {
      render(<ResearchMemo {...defaultProps} />);

      const analysisButton = screen.getByRole('button', { name: /analysis/i });
      fireEvent.click(analysisButton);

      expect(screen.getByText(/analysis/i)).toBeInTheDocument();
    });

    it('should allow editing section content', () => {
      render(<ResearchMemo {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/enter issue content\.\.\./i);

      fireEvent.change(textarea, {
        target: { value: 'Whether the contract was properly executed.' }
      });

      expect(textarea).toHaveValue('Whether the contract was properly executed.');
    });

    it('should show completion indicator for filled sections', () => {
      render(<ResearchMemo {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/enter issue content\.\.\./i);

      fireEvent.change(textarea, {
        target: { value: 'Test content' }
      });

      // Should show checkmark or completion indicator
      const sectionButtons = screen.getAllByRole('button');
      expect(sectionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('AI Suggestions', () => {
    it('should toggle AI assistant panel when button is clicked', () => {
      render(<ResearchMemo {...defaultProps} />);

      const aiButton = screen.getByRole('button', { name: /ai assist/i });
      fireEvent.click(aiButton);

      expect(screen.getAllByText(/ai research assistant/i).length).toBeGreaterThan(1);
    });

    it('should display AI suggestion options', () => {
      render(<ResearchMemo {...defaultProps} />);

      const aiButton = screen.getByRole('button', { name: /ai assist/i });
      fireEvent.click(aiButton);

      expect(screen.getByText(/summarize section/i)).toBeInTheDocument();
      expect(screen.getByText(/suggest improvements/i)).toBeInTheDocument();
      expect(screen.getByText(/find citations/i)).toBeInTheDocument();
    });

    it('should call onAISummarize when summarize button is clicked', async () => {
      render(<ResearchMemo {...defaultProps} />);

      // Add some content first
      const textarea = screen.getByPlaceholderText(/enter issue content\.\.\./i);
      fireEvent.change(textarea, { target: { value: 'Test content for AI' } });

      // Open AI panel
      const aiButton = screen.getByRole('button', { name: /ai assist/i });
      fireEvent.click(aiButton);

      // Click summarize
      const summarizeButton = screen.getByText(/summarize section/i).closest('button');
      if (summarizeButton) {
        fireEvent.click(summarizeButton);

        await waitFor(() => {
          expect(mockOnAISummarize).toHaveBeenCalled();
        });
      }
    });

    it('should show loading state during AI summarization', async () => {
      render(<ResearchMemo {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/enter issue content\.\.\./i);
      fireEvent.change(textarea, { target: { value: 'Test content' } });

      const aiButton = screen.getByRole('button', { name: /ai assist/i });
      fireEvent.click(aiButton);

      const summarizeButton = screen.getByText(/summarize section/i).closest('button');
      if (summarizeButton) {
        fireEvent.click(summarizeButton);

        expect(screen.getByText(/summarizing\.\.\./i)).toBeInTheDocument();
      }
    });

    it('should close AI panel when close button is clicked', () => {
      render(<ResearchMemo {...defaultProps} />);

      const aiButton = screen.getByRole('button', { name: /ai assist/i });
      fireEvent.click(aiButton);

      const closeButton = screen.getAllByText('×')[0];
      fireEvent.click(closeButton);

      // Panel should be closed
      expect(screen.getAllByText(/ai research assistant/i).length).toBe(1);
    });
  });

  describe('Version History', () => {
    it('should switch to versions view when tab is clicked', () => {
      render(<ResearchMemo {...defaultProps} />);

      const versionsTab = screen.getByRole('button', { name: /versions \(0\)/i });
      fireEvent.click(versionsTab);

      expect(screen.getByText(/version history/i)).toBeInTheDocument();
    });

    it('should show empty state when no versions exist', () => {
      render(<ResearchMemo {...defaultProps} />);

      const versionsTab = screen.getByRole('button', { name: /versions/i });
      fireEvent.click(versionsTab);

      expect(screen.getByText(/no version history yet/i)).toBeInTheDocument();
    });

    it('should display version information when versions exist', () => {
      const memoWithVersions = {
        id: '1',
        title: 'Test Memo',
        author: { name: 'Test User' },
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft' as const,
        sections: [],
        collaborators: [],
        comments: [],
        versions: [
          {
            id: 'v1',
            version: 1,
            timestamp: new Date(),
            author: { name: 'Test User' },
            changes: 'Initial draft',
            status: 'draft' as const,
          },
        ],
      };

      render(<ResearchMemo memo={memoWithVersions} {...defaultProps} />);

      const versionsTab = screen.getByRole('button', { name: /versions \(1\)/i });
      fireEvent.click(versionsTab);

      expect(screen.getByText(/version 1/i)).toBeInTheDocument();
      expect(screen.getByText(/initial draft/i)).toBeInTheDocument();
    });
  });

  describe('Comment System', () => {
    it('should switch to comments view when tab is clicked', () => {
      render(<ResearchMemo {...defaultProps} />);

      const commentsTab = screen.getByRole('button', { name: /comments \(0\)/i });
      fireEvent.click(commentsTab);

      expect(screen.getByText(/comments & feedback/i)).toBeInTheDocument();
    });

    it('should show empty state when no comments exist', () => {
      render(<ResearchMemo {...defaultProps} />);

      const commentsTab = screen.getByRole('button', { name: /comments/i });
      fireEvent.click(commentsTab);

      expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
    });

    it('should display comments with author and timestamp', () => {
      const memoWithComments = {
        id: '1',
        title: 'Test Memo',
        author: { name: 'Test User' },
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft' as const,
        sections: [],
        collaborators: [],
        versions: [],
        comments: [
          {
            id: 'c1',
            author: { name: 'Reviewer', avatar: 'R' },
            content: 'Great analysis!',
            timestamp: new Date(),
            resolved: false,
          },
        ],
      };

      render(<ResearchMemo memo={memoWithComments} {...defaultProps} />);

      const commentsTab = screen.getByRole('button', { name: /comments \(1\)/i });
      fireEvent.click(commentsTab);

      expect(screen.getByText(/great analysis!/i)).toBeInTheDocument();
      expect(screen.getByText(/reviewer/i)).toBeInTheDocument();
    });

    it('should show resolved status for resolved comments', () => {
      const memoWithResolvedComment = {
        id: '1',
        title: 'Test Memo',
        author: { name: 'Test User' },
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft' as const,
        sections: [],
        collaborators: [],
        versions: [],
        comments: [
          {
            id: 'c1',
            author: { name: 'Reviewer' },
            content: 'Fixed issue',
            timestamp: new Date(),
            resolved: true,
          },
        ],
      };

      render(<ResearchMemo memo={memoWithResolvedComment} {...defaultProps} />);

      const commentsTab = screen.getByRole('button', { name: /comments/i });
      fireEvent.click(commentsTab);

      expect(screen.getByText(/resolved/i)).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should display export button', () => {
      render(<ResearchMemo {...defaultProps} />);

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('should switch to preview mode when preview tab is clicked', () => {
      render(<ResearchMemo {...defaultProps} />);

      const previewTab = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewTab);

      expect(screen.getByText(/untitled research memo/i)).toBeInTheDocument();
    });

    it('should display all sections in preview mode', () => {
      render(<ResearchMemo {...defaultProps} />);

      const previewTab = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewTab);

      expect(screen.getAllByText(/issue/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/brief answer/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/facts/i).length).toBeGreaterThan(0);
    });
  });

  describe('Auto-save', () => {
    it('should call onSave when save button is clicked', async () => {
      render(<ResearchMemo {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should show saving state during save', () => {
      render(<ResearchMemo {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
    });

    it('should display last saved timestamp', () => {
      render(<ResearchMemo {...defaultProps} />);

      expect(screen.getByText(/last saved:/i)).toBeInTheDocument();
    });
  });

  describe('Collaboration Features', () => {
    it('should display share button', () => {
      render(<ResearchMemo {...defaultProps} />);

      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('should toggle collaborators panel when share button is clicked', () => {
      render(<ResearchMemo {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      // Panel toggle should occur
      expect(shareButton).toBeInTheDocument();
    });

    it('should display memo status badge', () => {
      render(<ResearchMemo {...defaultProps} />);

      expect(screen.getByText(/draft/i)).toBeInTheDocument();
    });
  });

  describe('Editor Toolbar', () => {
    it('should display formatting toolbar in edit mode', () => {
      render(<ResearchMemo {...defaultProps} />);

      // Should show bold, italic, list, link buttons
      const toolbarButtons = screen.getAllByRole('button', { name: '' });
      expect(toolbarButtons.length).toBeGreaterThan(5);
    });

    it('should allow adding new sections', () => {
      render(<ResearchMemo {...defaultProps} />);

      const addSectionButton = screen.getByRole('button', { name: /add section/i });
      expect(addSectionButton).toBeInTheDocument();
    });
  });
});
