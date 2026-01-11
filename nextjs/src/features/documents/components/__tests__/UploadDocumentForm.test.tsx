/**
 * @fileoverview Enterprise-grade test suite for UploadDocumentForm component
 * @module features/documents/components/__tests__/UploadDocumentForm.test
 *
 * Tests cover:
 * - Form rendering and initial state
 * - File input functionality
 * - Submit button states (idle, pending)
 * - Success and error feedback
 * - useActionState integration
 * - useFormStatus integration
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadDocumentForm } from '../UploadDocumentForm';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock state for useActionState
let mockActionState = {
  success: false,
  message: '',
};
let mockFormAction = jest.fn();

// Mock state for useFormStatus
// Removed unused variable mockPending

type ActionHandler = (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
type InitialState = { success: boolean; message: string };

// Mock React hooks
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useActionState: (_action: ActionHandler, _initialState: InitialState) => {
      return [mockActionState, mockFormAction];
    },
  };
});

jest.mock('react-dom', () => {
  const originalReactDOM = jest.requireActual('react-dom');
  return {
    ...originalReactDOM,
    useFormStatus: () => ({
      pending: mockPending,
    }),
  };
});

// Mock server action
jest.mock('@/actions/document-actions', () => ({
  uploadDocument: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    type,
    disabled,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }) => (
    <button type={type} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  UploadCloudIcon: ({ className }: { className?: string }) => (
    <svg data-testid="upload-cloud-icon" className={className} />
  ),
}));

// ============================================================================
// TEST HELPERS
// ============================================================================

const resetMocks = () => {
  mockActionState = { success: false, message: '' };
  mockFormAction = jest.fn();
  mockPending = false;
};

const setSuccessState = (message: string) => {
  mockActionState = { success: true, message };
};

const setErrorState = (message: string) => {
  mockActionState = { success: false, message };
};

const setPending = (pending: boolean) => {
  mockPending = pending;
};

const createMockFile = (
  name = 'test-document.pdf',
  type = 'application/pdf',
  size = 1024
): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('UploadDocumentForm Component', () => {
  beforeEach(() => {
    resetMocks();
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render the form element', () => {
      render(<UploadDocumentForm />);

      expect(document.querySelector('form')).toBeInTheDocument();
    });

    it('should render file input', () => {
      render(<UploadDocumentForm />);

      expect(
        screen.getByRole('textbox', { hidden: true }) ||
        document.querySelector('input[type="file"]')
      ).toBeTruthy();
    });

    it('should render submit button', () => {
      render(<UploadDocumentForm />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have file input as required', () => {
      render(<UploadDocumentForm />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('required');
    });

    it('should have correct input name attribute', () => {
      render(<UploadDocumentForm />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('name', 'file');
    });
  });

  // ==========================================================================
  // BUTTON STATE TESTS
  // ==========================================================================

  describe('Button States', () => {
    describe('Idle State', () => {
      it('should show "Upload Document" text when not pending', () => {
        render(<UploadDocumentForm />);

        expect(
          screen.getByRole('button', { name: /upload document/i })
        ).toBeInTheDocument();
      });

      it('should show upload icon when not pending', () => {
        render(<UploadDocumentForm />);

        expect(screen.getByTestId('upload-cloud-icon')).toBeInTheDocument();
      });

      it('should not be disabled when not pending', () => {
        render(<UploadDocumentForm />);

        expect(screen.getByRole('button')).not.toBeDisabled();
      });
    });

    describe('Pending State', () => {
      beforeEach(() => {
        setPending(true);
      });

      it('should show "Uploading..." text when pending', () => {
        render(<UploadDocumentForm />);

        expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      });

      it('should show spinner when pending', () => {
        render(<UploadDocumentForm />);

        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });

      it('should disable button when pending', () => {
        render(<UploadDocumentForm />);

        expect(screen.getByRole('button')).toBeDisabled();
      });

      it('should not show upload icon when pending', () => {
        render(<UploadDocumentForm />);

        expect(
          screen.queryByTestId('upload-cloud-icon')
        ).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // SUCCESS STATE TESTS
  // ==========================================================================

  describe('Success State', () => {
    it('should not display success message visually', () => {
      setSuccessState('Document uploaded successfully!');

      render(<UploadDocumentForm />);

      // Success handling is done via console/toast, not inline message
      expect(
        screen.queryByText('Document uploaded successfully!')
      ).not.toBeInTheDocument();
    });

    it('should not show error styling for success', () => {
      setSuccessState('Upload complete');

      const { container } = render(<UploadDocumentForm />);

      const errorMessage = container.querySelector('.text-red-600');
      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ERROR STATE TESTS
  // ==========================================================================

  describe('Error State', () => {
    it('should display error message when upload fails', () => {
      setErrorState('Failed to upload document');

      render(<UploadDocumentForm />);

      expect(screen.getByText('Failed to upload document')).toBeInTheDocument();
    });

    it('should apply error styling to message', () => {
      setErrorState('Upload error occurred');

      const { container } = render(<UploadDocumentForm />);

      const errorMessage = container.querySelector('.text-red-600');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Upload error occurred');
    });

    it('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      setErrorState('Console error message');

      render(<UploadDocumentForm />);

      // Note: useEffect runs after render, error should be logged
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not show error message when message is empty', () => {
      setErrorState('');

      const { container } = render(<UploadDocumentForm />);

      const errorParagraph = container.querySelector('p.text-red-600');
      expect(errorParagraph).not.toBeInTheDocument();
    });

    it('should position error message below the form', () => {
      setErrorState('Positioned error');

      const { container } = render(<UploadDocumentForm />);

      const errorMessage = container.querySelector('.mt-2');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FILE INPUT TESTS
  // ==========================================================================

  describe('File Input', () => {
    it('should accept file selection', async () => {
      const user = userEvent.setup();
      render(<UploadDocumentForm />);

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = createMockFile();

      await user.upload(fileInput, file);

      expect(fileInput.files?.[0]).toBe(file);
    });

    it('should have proper styling classes', () => {
      render(<UploadDocumentForm />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveClass('text-sm');
      expect(fileInput).toHaveClass('text-slate-500');
    });

    it('should have styled file button', () => {
      render(<UploadDocumentForm />);

      const fileInput = document.querySelector('input[type="file"]');
      // Check for file: pseudo-class styling
      expect(fileInput).toHaveClass('file:mr-4');
      expect(fileInput).toHaveClass('file:py-2');
      expect(fileInput).toHaveClass('file:px-4');
      expect(fileInput).toHaveClass('file:rounded-md');
    });

    it('should have hover states on file button', () => {
      render(<UploadDocumentForm />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveClass('hover:file:bg-blue-100');
    });
  });

  // ==========================================================================
  // FORM LAYOUT TESTS
  // ==========================================================================

  describe('Form Layout', () => {
    it('should have flex layout for inputs', () => {
      const { container } = render(<UploadDocumentForm />);

      const flexContainer = container.querySelector('.flex.items-center');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have gap between elements', () => {
      const { container } = render(<UploadDocumentForm />);

      const flexContainer = container.querySelector('.gap-2');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have form action attribute', () => {
      render(<UploadDocumentForm />);

      const form = document.querySelector('form');
      expect(form).toHaveAttribute('action');
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible submit button', () => {
      render(<UploadDocumentForm />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName();
    });

    it('should indicate disabled state properly', () => {
      setPending(true);

      render(<UploadDocumentForm />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should have form structure', () => {
      render(<UploadDocumentForm />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have required file input', () => {
      render(<UploadDocumentForm />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeRequired();
    });

    it('should have visible error messages', () => {
      setErrorState('Accessible error');

      render(<UploadDocumentForm />);

      const error = screen.getByText('Accessible error');
      expect(error).toBeVisible();
    });
  });

  // ==========================================================================
  // SPINNER COMPONENT TESTS
  // ==========================================================================

  describe('Spinner Component', () => {
    beforeEach(() => {
      setPending(true);
    });

    it('should render SVG spinner', () => {
      render(<UploadDocumentForm />);

      const svg = document.querySelector('svg.animate-spin');
      expect(svg).toBeInTheDocument();
    });

    it('should have proper spinner styling', () => {
      render(<UploadDocumentForm />);

      const svg = document.querySelector('svg.animate-spin');
      expect(svg).toHaveClass('-ml-1');
      expect(svg).toHaveClass('mr-3');
      expect(svg).toHaveClass('h-4');
      expect(svg).toHaveClass('w-4');
    });

    it('should have white text color for spinner', () => {
      render(<UploadDocumentForm />);

      const svg = document.querySelector('svg.animate-spin');
      expect(svg).toHaveClass('text-white');
    });

    it('should contain circle and path elements', () => {
      render(<UploadDocumentForm />);

      const svg = document.querySelector('svg.animate-spin');
      expect(svg?.querySelector('circle')).toBeInTheDocument();
      expect(svg?.querySelector('path')).toBeInTheDocument();
    });

    it('should have proper SVG attributes', () => {
      render(<UploadDocumentForm />);

      const svg = document.querySelector('svg.animate-spin');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle rapid success/error state changes', () => {
      setErrorState('First error');
      const { rerender } = render(<UploadDocumentForm />);

      expect(screen.getByText('First error')).toBeInTheDocument();

      setSuccessState('Success!');
      rerender(<UploadDocumentForm />);

      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });

    it('should handle empty message gracefully', () => {
      mockActionState = { success: false, message: '' };

      const { container } = render(<UploadDocumentForm />);

      const errorMessages = container.querySelectorAll('p.text-red-600');
      expect(errorMessages).toHaveLength(0);
    });

    it('should handle very long error messages', () => {
      const longMessage = 'Error: '.repeat(100);
      setErrorState(longMessage);

      render(<UploadDocumentForm />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in error messages', () => {
      setErrorState('Error: <script>alert("xss")</script>');

      render(<UploadDocumentForm />);

      // XSS should be escaped
      expect(
        screen.getByText(/Error:.*script.*alert/i)
      ).toBeInTheDocument();
    });

    it('should handle pending state transition', () => {
      setPending(false);
      const { rerender } = render(<UploadDocumentForm />);

      expect(screen.getByRole('button')).not.toBeDisabled();

      setPending(true);
      rerender(<UploadDocumentForm />);

      expect(screen.getByRole('button')).toBeDisabled();

      setPending(false);
      rerender(<UploadDocumentForm />);

      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================

  describe('Integration', () => {
    it('should render complete form with all elements', () => {
      render(<UploadDocumentForm />);

      // Form
      expect(document.querySelector('form')).toBeInTheDocument();

      // File input
      expect(document.querySelector('input[type="file"]')).toBeInTheDocument();

      // Submit button
      expect(screen.getByRole('button')).toBeInTheDocument();

      // Upload icon
      expect(screen.getByTestId('upload-cloud-icon')).toBeInTheDocument();
    });

    it('should have correct form submission structure', () => {
      render(<UploadDocumentForm />);

      const form = document.querySelector('form');
      const fileInput = document.querySelector('input[type="file"]');
      const submitButton = screen.getByRole('button');

      expect(form).toContainElement(fileInput);
      expect(form).toContainElement(submitButton);
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      resetMocks();
      const { container } = render(<UploadDocumentForm />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for pending state', () => {
      setPending(true);
      const { container } = render(<UploadDocumentForm />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for error state', () => {
      setErrorState('File upload failed. Please try again.');
      const { container } = render(<UploadDocumentForm />);
      expect(container).toMatchSnapshot();
    });
  });
});
