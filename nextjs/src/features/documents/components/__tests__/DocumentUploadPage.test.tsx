/**
 * @fileoverview Enterprise-grade test suite for DocumentUploadPage component
 * @module features/documents/components/__tests__/DocumentUploadPage.test
 *
 * Tests cover:
 * - Initial render state
 * - File selection and processing flow
 * - Hash generation simulation
 * - Processing state transitions
 * - Upload button behavior
 * - Error handling
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentUploadPage from '../upload/DocumentUploadPage';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock UI components
jest.mock('@/components/ui/atoms/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/molecules/Card/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

jest.mock('@/components/ui/molecules/FileUploadZone/FileUploadZone', () => ({
  FileUploadZone: ({
    file,
    processing,
    processStage,
    onFileSelect,
    generatedHash,
  }: {
    file: File | null;
    processing: boolean;
    processStage: string;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    generatedHash?: string;
  }) => (
    <div data-testid="file-upload-zone">
      <input
        type="file"
        data-testid="file-input"
        onChange={onFileSelect}
        aria-label="Upload file"
      />
      {file && <span data-testid="file-name">{file.name}</span>}
      {processing && <span data-testid="processing-indicator">Processing...</span>}
      {processStage && <span data-testid="process-stage">{processStage}</span>}
      {generatedHash && <span data-testid="generated-hash">{generatedHash}</span>}
    </div>
  ),
}));

// ============================================================================
// TEST HELPERS
// ============================================================================

const createMockFile = (
  name = 'test-document.pdf',
  type = 'application/pdf',
  size = 1024
): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const selectFile = async (
  user: ReturnType<typeof userEvent.setup>,
  file: File
) => {
  const input = screen.getByTestId('file-input');
  await user.upload(input, file);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('DocumentUploadPage Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ==========================================================================
  // INITIAL RENDER TESTS
  // ==========================================================================

  describe('Initial Render', () => {
    it('should render page title', () => {
      render(<DocumentUploadPage />);

      expect(
        screen.getByRole('heading', { name: /upload document/i })
      ).toBeInTheDocument();
    });

    it('should render Card component', () => {
      render(<DocumentUploadPage />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render FileUploadZone component', () => {
      render(<DocumentUploadPage />);

      expect(screen.getByTestId('file-upload-zone')).toBeInTheDocument();
    });

    it('should render file input', () => {
      render(<DocumentUploadPage />);

      expect(screen.getByTestId('file-input')).toBeInTheDocument();
    });

    it('should not show upload button initially', () => {
      render(<DocumentUploadPage />);

      expect(
        screen.queryByRole('button', { name: /upload/i })
      ).not.toBeInTheDocument();
    });

    it('should not show file name initially', () => {
      render(<DocumentUploadPage />);

      expect(screen.queryByTestId('file-name')).not.toBeInTheDocument();
    });

    it('should not show processing indicator initially', () => {
      render(<DocumentUploadPage />);

      expect(screen.queryByTestId('processing-indicator')).not.toBeInTheDocument();
    });

    it('should not show hash initially', () => {
      render(<DocumentUploadPage />);

      expect(screen.queryByTestId('generated-hash')).not.toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      const { container } = render(<DocumentUploadPage />);

      const pageContainer = container.firstChild as HTMLElement;
      expect(pageContainer).toHaveClass('p-6');
      expect(pageContainer).toHaveClass('max-w-4xl');
      expect(pageContainer).toHaveClass('mx-auto');
    });
  });

  // ==========================================================================
  // FILE SELECTION TESTS
  // ==========================================================================

  describe('File Selection', () => {
    it('should handle file selection', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      expect(screen.getByTestId('file-name')).toHaveTextContent(
        'test-document.pdf'
      );
    });

    it('should show processing indicator after file selection', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      expect(screen.getByTestId('processing-indicator')).toBeInTheDocument();
    });

    it('should show "Calculating Hash..." stage after file selection', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      expect(screen.getByTestId('process-stage')).toHaveTextContent(
        'Calculating Hash...'
      );
    });

    it('should handle different file types', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const docxFile = createMockFile('document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      await selectFile(user, docxFile);

      expect(screen.getByTestId('file-name')).toHaveTextContent('document.docx');
    });

    it('should accept image files', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const imageFile = createMockFile('image.png', 'image/png');
      await selectFile(user, imageFile);

      expect(screen.getByTestId('file-name')).toHaveTextContent('image.png');
    });
  });

  // ==========================================================================
  // PROCESSING STATE TESTS
  // ==========================================================================

  describe('Processing State', () => {
    it('should transition to "Ready to Upload" after processing completes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      // Initial state
      expect(screen.getByTestId('process-stage')).toHaveTextContent(
        'Calculating Hash...'
      );

      // Fast-forward timer
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByTestId('process-stage')).toHaveTextContent(
        'Ready to Upload'
      );
    });

    it('should set processing to false after completion', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      // Processing should be true initially
      expect(screen.getByTestId('processing-indicator')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Processing should be false after timeout
      expect(
        screen.queryByTestId('processing-indicator')
      ).not.toBeInTheDocument();
    });

    it('should generate hash after processing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByTestId('generated-hash')).toHaveTextContent(
        'simulated-hash-12345'
      );
    });
  });

  // ==========================================================================
  // UPLOAD BUTTON TESTS
  // ==========================================================================

  describe('Upload Button', () => {
    it('should not show upload button during processing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      // During processing
      expect(
        screen.queryByRole('button', { name: /upload/i })
      ).not.toBeInTheDocument();
    });

    it('should show upload button after processing completes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    });

    it('should include file name in upload button text', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile('my-report.pdf');
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      const button = screen.getByRole('button', { name: /upload/i });
      expect(button).toHaveTextContent('my-report.pdf');
    });

    it('should log to console when upload button is clicked', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      expect(consoleSpy).toHaveBeenCalledWith('Upload clicked');
      consoleSpy.mockRestore();
    });

    it('should be positioned at the end of the form', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      const buttonContainer = container.querySelector('.flex.justify-end');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FILE REPLACEMENT TESTS
  // ==========================================================================

  describe('File Replacement', () => {
    it('should handle selecting a different file', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      // Select first file
      const file1 = createMockFile('first-file.pdf');
      await selectFile(user, file1);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByTestId('file-name')).toHaveTextContent('first-file.pdf');

      // Select second file
      const file2 = createMockFile('second-file.pdf');
      await selectFile(user, file2);

      expect(screen.getByTestId('file-name')).toHaveTextContent('second-file.pdf');
    });

    it('should restart processing when new file is selected', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      // Complete first file
      const file1 = createMockFile('first.pdf');
      await selectFile(user, file1);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(
        screen.queryByTestId('processing-indicator')
      ).not.toBeInTheDocument();

      // Select new file - should restart processing
      const file2 = createMockFile('second.pdf');
      await selectFile(user, file2);

      expect(screen.getByTestId('processing-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('process-stage')).toHaveTextContent(
        'Calculating Hash...'
      );
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible page heading', () => {
      render(<DocumentUploadPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Upload Document');
    });

    it('should have labeled file input', () => {
      render(<DocumentUploadPage />);

      expect(screen.getByLabelText(/upload file/i)).toBeInTheDocument();
    });

    it('should have accessible upload button', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName(/upload/i);
    });

    it('should indicate processing state to screen readers', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      // Processing stage should be visible/announced
      expect(screen.getByTestId('process-stage')).toHaveTextContent(
        'Calculating Hash...'
      );
    });
  });

  // ==========================================================================
  // STYLING TESTS
  // ==========================================================================

  describe('Styling', () => {
    it('should have proper heading styling', () => {
      render(<DocumentUploadPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('font-bold');
      expect(heading).toHaveClass('mb-6');
    });

    it('should have centered content layout', () => {
      const { container } = render(<DocumentUploadPage />);

      const pageContainer = container.firstChild as HTMLElement;
      expect(pageContainer).toHaveClass('mx-auto');
    });

    it('should have max-width constraint', () => {
      const { container } = render(<DocumentUploadPage />);

      const pageContainer = container.firstChild as HTMLElement;
      expect(pageContainer).toHaveClass('max-w-4xl');
    });

    it('should have padding around content', () => {
      const { container } = render(<DocumentUploadPage />);

      const pageContainer = container.firstChild as HTMLElement;
      expect(pageContainer).toHaveClass('p-6');
    });

    it('should have margin above upload button', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      const buttonContainer = container.querySelector('.mt-4');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle file with very long name', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const longName = 'a'.repeat(200) + '.pdf';
      const file = createMockFile(longName);
      await selectFile(user, file);

      expect(screen.getByTestId('file-name')).toHaveTextContent(longName);
    });

    it('should handle file with special characters in name', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile('document (1) [final] @2024.pdf');
      await selectFile(user, file);

      expect(screen.getByTestId('file-name')).toHaveTextContent(
        'document (1) [final] @2024.pdf'
      );
    });

    it('should handle file with unicode characters in name', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile('文档_ドキュメント.pdf');
      await selectFile(user, file);

      expect(screen.getByTestId('file-name')).toHaveTextContent('文档_ドキュメント.pdf');
    });

    it('should handle rapid file selections', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      // Rapid succession of file selections
      const file1 = createMockFile('file1.pdf');
      const file2 = createMockFile('file2.pdf');
      const file3 = createMockFile('file3.pdf');

      await selectFile(user, file1);
      await selectFile(user, file2);
      await selectFile(user, file3);

      // Should show the last selected file
      expect(screen.getByTestId('file-name')).toHaveTextContent('file3.pdf');
    });

    it('should handle file with no extension', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile('document-without-extension', 'application/octet-stream');
      await selectFile(user, file);

      expect(screen.getByTestId('file-name')).toHaveTextContent(
        'document-without-extension'
      );
    });

    it('should handle empty file name', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile('.pdf');
      await selectFile(user, file);

      expect(screen.getByTestId('file-name')).toHaveTextContent('.pdf');
    });
  });

  // ==========================================================================
  // TIMER BEHAVIOR TESTS
  // ==========================================================================

  describe('Timer Behavior', () => {
    it('should complete processing after exactly 1500ms', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      // At 1499ms, should still be processing
      act(() => {
        jest.advanceTimersByTime(1499);
      });

      expect(screen.getByTestId('processing-indicator')).toBeInTheDocument();

      // At 1500ms, should be complete
      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(
        screen.queryByTestId('processing-indicator')
      ).not.toBeInTheDocument();
    });

    it('should generate simulated hash value', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<DocumentUploadPage />);

      const file = createMockFile();
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByTestId('generated-hash')).toHaveTextContent(
        'simulated-hash-12345'
      );
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for initial state', () => {
      const { container } = render(<DocumentUploadPage />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot during processing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<DocumentUploadPage />);

      const file = createMockFile('snapshot-test.pdf');
      await selectFile(user, file);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot after processing complete', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { container } = render(<DocumentUploadPage />);

      const file = createMockFile('snapshot-test.pdf');
      await selectFile(user, file);

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(container).toMatchSnapshot();
    });
  });
});
