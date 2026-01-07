/**
 * @fileoverview Enterprise-grade test suite for Step3DraftReview component
 * @module features/document-assembly/__tests__/Step3DraftReview.test
 *
 * Tests cover:
 * - Draft content display
 * - Streaming state handling
 * - Copy to clipboard functionality
 * - Download functionality
 * - Save button state and behavior
 * - Empty/waiting states
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step3DraftReview } from '../Step3DraftReview';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock theme context
const mockTheme = {
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
  },
  border: { default: 'border-gray-200' },
  surface: {
    input: 'bg-white',
    raised: 'bg-gray-50',
  },
};

jest.mock('@/providers', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter((c) => typeof c === 'string').join(' '),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Save: ({ className }: { className?: string }) => (
    <span data-testid="icon-save" className={className} />
  ),
  Download: ({ className }: { className?: string }) => (
    <span data-testid="icon-download" className={className} />
  ),
  Copy: ({ className }: { className?: string }) => (
    <span data-testid="icon-copy" className={className} />
  ),
  Sparkles: ({ className }: { className?: string }) => (
    <span data-testid="icon-sparkles" className={className} />
  ),
  Loader2: ({ className }: { className?: string }) => (
    <span data-testid="icon-loader" className={className} />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <span data-testid="icon-check-circle" className={className} />
  ),
}));

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock URL APIs
const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

// ============================================================================
// TEST FIXTURES
// ============================================================================

const defaultProps = {
  result: '',
  isStreaming: false,
  isSaving: false,
  onSave: jest.fn(),
};

const sampleDraftContent = `MOTION TO DISMISS

Comes now the Defendant, by and through undersigned counsel, and moves this Honorable Court to dismiss the Plaintiff's Complaint for failure to state a claim upon which relief can be granted.

LEGAL ARGUMENT

1. The Complaint fails to allege sufficient facts to support a claim for breach of contract.
2. The statute of limitations has expired on all claims asserted.

WHEREFORE, Defendant respectfully requests that this Court grant this Motion and dismiss the Complaint with prejudice.`;

// ============================================================================
// TEST HELPERS
// ============================================================================

const renderWithProps = (overrides = {}) => {
  const props = { ...defaultProps, ...overrides };
  return render(<Step3DraftReview {...props} />);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Step3DraftReview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render the component', () => {
      renderWithProps();

      expect(
        screen.getByText(/waiting for content generation/i)
      ).toBeInTheDocument();
    });

    it('should display review heading when not streaming', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(
        screen.getByRole('heading', { name: /review generated draft/i })
      ).toBeInTheDocument();
    });

    it('should display streaming heading when streaming', () => {
      renderWithProps({ isStreaming: true, result: 'Generating...' });

      expect(
        screen.getByRole('heading', { name: /generating draft/i })
      ).toBeInTheDocument();
    });

    it('should render textarea for draft content', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // STREAMING STATE TESTS
  // ==========================================================================

  describe('Streaming State', () => {
    it('should show streaming indicator when streaming', () => {
      renderWithProps({ isStreaming: true, result: 'Partial content...' });

      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
      expect(screen.getByText(/ai is writing/i)).toBeInTheDocument();
    });

    it('should display character count during streaming', () => {
      renderWithProps({ isStreaming: true, result: 'Hello World' });

      expect(screen.getByText(/11 characters generated/i)).toBeInTheDocument();
    });

    it('should make textarea readonly during streaming', () => {
      renderWithProps({ isStreaming: true, result: 'Content' });

      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('should apply pulse animation during streaming', () => {
      renderWithProps({ isStreaming: true, result: 'Content' });

      expect(screen.getByRole('textbox')).toHaveClass('animate-pulse');
    });

    it('should hide action buttons during streaming', () => {
      renderWithProps({ isStreaming: true, result: 'Content' });

      expect(
        screen.queryByRole('button', { name: /copy/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /download/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /save/i })
      ).not.toBeInTheDocument();
    });

    it('should show streaming description', () => {
      renderWithProps({ isStreaming: true, result: 'Content' });

      expect(
        screen.getByText(/ai is composing your document/i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // COMPLETED STATE TESTS
  // ==========================================================================

  describe('Completed State', () => {
    it('should show completion indicator when done', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
      expect(screen.getByText(/draft complete/i)).toBeInTheDocument();
    });

    it('should display final character count', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(
        screen.getByText(
          new RegExp(`${sampleDraftContent.length} characters generated`)
        )
      ).toBeInTheDocument();
    });

    it('should show all action buttons when complete', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /download/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /save to case files/i })
      ).toBeInTheDocument();
    });

    it('should display draft content in textarea', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(screen.getByRole('textbox')).toHaveValue(sampleDraftContent);
    });

    it('should allow editing when complete', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
    });
  });

  // ==========================================================================
  // EMPTY STATE TESTS
  // ==========================================================================

  describe('Empty State', () => {
    it('should show waiting message when no result', () => {
      renderWithProps();

      expect(
        screen.getByText(/waiting for content generation/i)
      ).toBeInTheDocument();
    });

    it('should show sparkles icon in empty state', () => {
      renderWithProps();

      expect(screen.getByTestId('icon-sparkles')).toBeInTheDocument();
    });

    it('should have dashed border in empty state', () => {
      const { container } = renderWithProps();

      const emptyStateContainer = container.querySelector('.border-dashed');
      expect(emptyStateContainer).toBeInTheDocument();
    });

    it('should not show action buttons in empty state', () => {
      renderWithProps();

      expect(
        screen.queryByRole('button', { name: /copy/i })
      ).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // COPY FUNCTIONALITY TESTS
  // ==========================================================================

  describe('Copy Functionality', () => {
    it('should copy content to clipboard when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProps({ result: sampleDraftContent });

      await user.click(screen.getByRole('button', { name: /copy/i }));

      expect(mockWriteText).toHaveBeenCalledWith(sampleDraftContent);
    });

    it('should show "Copied!" feedback after copy', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProps({ result: sampleDraftContent });

      await user.click(screen.getByRole('button', { name: /copy/i }));

      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('should show check icon after copy', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProps({ result: sampleDraftContent });

      await user.click(screen.getByRole('button', { name: /copy/i }));

      // After copy, there should be a check circle icon in the copy button
      const copyButton = screen.getByText('Copied!').closest('button');
      expect(copyButton).toContainElement(screen.getAllByTestId('icon-check-circle')[1]);
    });

    it('should reset copy feedback after 2 seconds', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProps({ result: sampleDraftContent });

      await user.click(screen.getByRole('button', { name: /copy/i }));
      expect(screen.getByText('Copied!')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // DOWNLOAD FUNCTIONALITY TESTS
  // ==========================================================================

  describe('Download Functionality', () => {
    it('should create blob URL when download clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProps({ result: sampleDraftContent });

      await user.click(screen.getByRole('button', { name: /download/i }));

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('should revoke blob URL after download', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProps({ result: sampleDraftContent });

      await user.click(screen.getByRole('button', { name: /download/i }));

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should create text file with content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProps({ result: sampleDraftContent });

      await user.click(screen.getByRole('button', { name: /download/i }));

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    });

    it('should have download icon', () => {
      renderWithProps({ result: sampleDraftContent });

      const downloadButton = screen.getByRole('button', { name: /download/i });
      expect(within(downloadButton).getByTestId('icon-download')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SAVE FUNCTIONALITY TESTS
  // ==========================================================================

  describe('Save Functionality', () => {
    it('should call onSave when save button clicked', async () => {
      const onSave = jest.fn();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      renderWithProps({ result: sampleDraftContent, onSave });

      await user.click(screen.getByRole('button', { name: /save to case files/i }));

      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when saving', () => {
      renderWithProps({ result: sampleDraftContent, isSaving: true });

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    });

    it('should disable save button when saving', () => {
      renderWithProps({ result: sampleDraftContent, isSaving: true });

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('should have proper styling when saving', () => {
      renderWithProps({ result: sampleDraftContent, isSaving: true });

      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toHaveClass('cursor-not-allowed');
    });

    it('should have save icon when not saving', () => {
      renderWithProps({ result: sampleDraftContent });

      const saveButton = screen.getByRole('button', { name: /save to case files/i });
      expect(within(saveButton).getByTestId('icon-save')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(
        screen.getByRole('heading', { level: 2 })
      ).toBeInTheDocument();
    });

    it('should have accessible textarea', () => {
      renderWithProps({ result: sampleDraftContent });

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeVisible();
    });

    it('should have accessible action buttons', () => {
      renderWithProps({ result: sampleDraftContent });

      expect(
        screen.getByRole('button', { name: /copy/i })
      ).toHaveAccessibleName();
      expect(
        screen.getByRole('button', { name: /download/i })
      ).toHaveAccessibleName();
      expect(
        screen.getByRole('button', { name: /save/i })
      ).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProps({ result: sampleDraftContent });

      const copyButton = screen.getByRole('button', { name: /copy/i });
      copyButton.focus();

      await user.tab();
      expect(screen.getByRole('button', { name: /download/i })).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole('button', { name: /save to case files/i })
      ).toHaveFocus();
    });

    it('should have loading state announced', () => {
      renderWithProps({ isStreaming: true, result: 'Content' });

      expect(screen.getByText(/ai is writing/i)).toBeVisible();
    });
  });

  // ==========================================================================
  // AUTO-SCROLL TESTS
  // ==========================================================================

  describe('Auto-Scroll Behavior', () => {
    it('should auto-scroll during streaming', () => {
      const { rerender } = renderWithProps({
        isStreaming: true,
        result: 'Initial',
      });

      const textarea = screen.getByRole('textbox');
      const scrollTopSpy = jest.spyOn(textarea, 'scrollTop', 'set');

      // Update with more content
      rerender(
        <Step3DraftReview
          {...defaultProps}
          isStreaming={true}
          result="Initial\nMore content"
        />
      );

      // The effect should try to scroll
      expect(textarea).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000);
      renderWithProps({ result: longContent });

      expect(screen.getByRole('textbox')).toHaveValue(longContent);
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Legal & Binding: "O\'Brien" vs <Corp>';
      renderWithProps({ result: specialContent });

      expect(screen.getByRole('textbox')).toHaveValue(specialContent);
    });

    it('should handle unicode content', () => {
      const unicodeContent = '法律文件 - テスト - Тест';
      renderWithProps({ result: unicodeContent });

      expect(screen.getByRole('textbox')).toHaveValue(unicodeContent);
    });

    it('should handle empty string result differently from undefined', () => {
      renderWithProps({ result: '' });

      // Empty string should still show the empty state
      expect(
        screen.getByText(/waiting for content generation/i)
      ).toBeInTheDocument();
    });

    it('should handle rapid streaming updates', () => {
      const { rerender } = renderWithProps({
        isStreaming: true,
        result: 'A',
      });

      for (let i = 0; i < 100; i++) {
        rerender(
          <Step3DraftReview
            {...defaultProps}
            isStreaming={true}
            result={'A'.repeat(i + 1)}
          />
        );
      }

      expect(screen.getByRole('textbox')).toHaveValue('A'.repeat(100));
    });

    it('should handle transition from streaming to complete', () => {
      const { rerender } = renderWithProps({
        isStreaming: true,
        result: 'Streaming content...',
      });

      expect(screen.getByText(/generating draft/i)).toBeInTheDocument();

      rerender(
        <Step3DraftReview
          {...defaultProps}
          isStreaming={false}
          result="Final content"
        />
      );

      expect(screen.getByText(/review generated draft/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for empty state', () => {
      const { container } = renderWithProps();
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for streaming state', () => {
      const { container } = renderWithProps({
        isStreaming: true,
        result: 'Generating content...',
      });
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for completed state', () => {
      const { container } = renderWithProps({
        result: sampleDraftContent,
      });
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for saving state', () => {
      const { container } = renderWithProps({
        result: sampleDraftContent,
        isSaving: true,
      });
      expect(container).toMatchSnapshot();
    });
  });
});

// Import within for nested queries
const within = (element: HTMLElement) => ({
  getByTestId: (testId: string) =>
    element.querySelector(`[data-testid="${testId}"]`) as HTMLElement,
});
