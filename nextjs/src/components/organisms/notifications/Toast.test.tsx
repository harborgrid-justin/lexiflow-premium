/**
 * @jest-environment jsdom
 * @module Toast.test
 * @description Enterprise-grade tests for Toast notification system
 *
 * Test coverage:
 * - showToast function
 * - Convenience functions (toastSuccess, toastError, toastWarning, toastInfo)
 * - Toast types and styling
 * - Priority levels and duration
 * - Action buttons
 * - Dismiss functionality
 * - ToastContainer component
 * - Accessibility
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import toast from 'react-hot-toast';
import {
  dismissAllToasts,
  dismissToast,
  showToast,
  ToastContainer,
  toastError,
  toastInfo,
  toastSuccess,
  toastWarning
} from './Toast';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('react-hot-toast', () => {
  const actualToast = jest.requireActual('react-hot-toast');
  const mockCustom = jest.fn((render, options) => {
    // Return a mock toast ID
    return 'mock-toast-id';
  });
  const mockDismiss = jest.fn();

  return {
    ...actualToast,
    default: {
      ...actualToast.default,
      custom: mockCustom,
      dismiss: mockDismiss,
    },
    Toaster: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="toaster">{children}</div>
    ),
  };
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

const resetMocks = () => {
  jest.clearAllMocks();
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Toast', () => {
  beforeEach(() => {
    resetMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('showToast', () => {
    it('calls toast.custom with correct parameters', () => {
      showToast({
        title: 'Test Title',
        message: 'Test message',
        type: 'success',
      });

      expect(toast.custom).toHaveBeenCalled();
    });

    it('returns toast ID', () => {
      const id = showToast({
        title: 'Test',
        type: 'info',
      });

      expect(id).toBe('mock-toast-id');
    });

    it('uses default priority duration when priority not specified', () => {
      showToast({
        title: 'Test',
        type: 'info',
      });

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 4000, // normal priority
        })
      );
    });

    it('uses custom duration when specified', () => {
      showToast({
        title: 'Test',
        type: 'info',
        duration: 5000,
      });

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 5000,
        })
      );
    });

    it('sets correct duration for low priority', () => {
      showToast({
        title: 'Test',
        type: 'info',
        priority: 'low',
      });

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 3000,
        })
      );
    });

    it('sets correct duration for high priority', () => {
      showToast({
        title: 'Test',
        type: 'warning',
        priority: 'high',
      });

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 6000,
        })
      );
    });

    it('sets persistent (0) duration for urgent priority', () => {
      showToast({
        title: 'Test',
        type: 'error',
        priority: 'urgent',
      });

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 0,
        })
      );
    });

    it('uses top-right position', () => {
      showToast({
        title: 'Test',
        type: 'info',
      });

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          position: 'top-right',
        })
      );
    });
  });

  describe('Convenience Functions', () => {
    describe('toastSuccess', () => {
      it('creates success toast with correct type', () => {
        toastSuccess('Success!', 'Operation completed');

        expect(toast.custom).toHaveBeenCalled();
        const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];

        // Render the toast to verify props
        const { container } = render(renderFn({ id: '1', visible: true }));
        expect(container.querySelector('.border-green-200')).toBeInTheDocument();
      });

      it('sets normal priority by default', () => {
        toastSuccess('Success!');

        expect(toast.custom).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            duration: 4000,
          })
        );
      });

      it('accepts custom options', () => {
        toastSuccess('Success!', 'Details', { priority: 'high' });

        expect(toast.custom).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            duration: 6000,
          })
        );
      });
    });

    describe('toastError', () => {
      it('creates error toast with urgent priority', () => {
        toastError('Error!', 'Something went wrong');

        expect(toast.custom).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            duration: 0, // Persistent for urgent
          })
        );
      });

      it('renders error styling', () => {
        toastError('Error!');

        const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
        const { container } = render(renderFn({ id: '1', visible: true }));

        expect(container.querySelector('.border-red-200')).toBeInTheDocument();
      });
    });

    describe('toastWarning', () => {
      it('creates warning toast with high priority', () => {
        toastWarning('Warning!', 'Please review');

        expect(toast.custom).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            duration: 6000,
          })
        );
      });

      it('renders warning styling', () => {
        toastWarning('Warning!');

        const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
        const { container } = render(renderFn({ id: '1', visible: true }));

        expect(container.querySelector('.border-amber-200')).toBeInTheDocument();
      });
    });

    describe('toastInfo', () => {
      it('creates info toast with normal priority', () => {
        toastInfo('Info', 'FYI');

        expect(toast.custom).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            duration: 4000,
          })
        );
      });

      it('renders info styling', () => {
        toastInfo('Info');

        const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
        const { container } = render(renderFn({ id: '1', visible: true }));

        expect(container.querySelector('.border-blue-200')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Toast Rendering', () => {
    it('renders title', () => {
      showToast({ title: 'Test Title', type: 'success' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByText } = render(renderFn({ id: '1', visible: true }));

      expect(getByText('Test Title')).toBeInTheDocument();
    });

    it('renders message when provided', () => {
      showToast({ title: 'Title', message: 'Test message', type: 'info' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByText } = render(renderFn({ id: '1', visible: true }));

      expect(getByText('Test message')).toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      const onClick = jest.fn();
      showToast({
        title: 'Title',
        type: 'info',
        action: { label: 'Undo', onClick },
      });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByText } = render(renderFn({ id: '1', visible: true }));

      expect(getByText('Undo')).toBeInTheDocument();
    });

    it('calls action onClick and dismisses toast', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onClick = jest.fn();
      showToast({
        title: 'Title',
        type: 'info',
        action: { label: 'Undo', onClick },
      });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByText } = render(renderFn({ id: '1', visible: true }));

      await user.click(getByText('Undo'));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(toast.dismiss).toHaveBeenCalledWith('1');
    });

    it('renders dismiss button', () => {
      showToast({ title: 'Title', type: 'success' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByRole } = render(renderFn({ id: '1', visible: true }));

      expect(getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('dismisses toast when dismiss button clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      showToast({ title: 'Title', type: 'success' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByRole } = render(renderFn({ id: '1', visible: true }));

      await user.click(getByRole('button', { name: /dismiss/i }));

      expect(toast.dismiss).toHaveBeenCalledWith('1');
    });

    it('calls onDismiss callback when dismissed', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDismiss = jest.fn();
      showToast({ title: 'Title', type: 'success', onDismiss });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByRole } = render(renderFn({ id: '1', visible: true }));

      await user.click(getByRole('button', { name: /dismiss/i }));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('applies enter animation when visible', () => {
      showToast({ title: 'Title', type: 'success' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { container } = render(renderFn({ id: '1', visible: true }));

      expect(container.firstChild).toHaveClass('animate-enter');
    });

    it('applies leave animation when not visible', () => {
      showToast({ title: 'Title', type: 'success' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { container } = render(renderFn({ id: '1', visible: false }));

      expect(container.firstChild).toHaveClass('animate-leave');
    });
  });

  describe('Icon Display', () => {
    it('shows CheckCircle icon for success type', () => {
      showToast({ title: 'Success', type: 'success' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { container } = render(renderFn({ id: '1', visible: true }));

      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('shows AlertCircle icon for error type', () => {
      showToast({ title: 'Error', type: 'error' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { container } = render(renderFn({ id: '1', visible: true }));

      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });

    it('shows AlertTriangle icon for warning type', () => {
      showToast({ title: 'Warning', type: 'warning' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { container } = render(renderFn({ id: '1', visible: true }));

      expect(container.querySelector('.text-amber-600')).toBeInTheDocument();
    });

    it('shows Info icon for info type', () => {
      showToast({ title: 'Info', type: 'info' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { container } = render(renderFn({ id: '1', visible: true }));

      expect(container.querySelector('.text-blue-600')).toBeInTheDocument();
    });
  });

  describe('dismissToast', () => {
    it('calls toast.dismiss with ID', () => {
      dismissToast('test-id');

      expect(toast.dismiss).toHaveBeenCalledWith('test-id');
    });
  });

  describe('dismissAllToasts', () => {
    it('calls toast.dismiss without ID to clear all', () => {
      dismissAllToasts();

      expect(toast.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('ToastContainer', () => {
    it('renders Toaster component', () => {
      render(<ToastContainer />);

      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('toast has alert role', () => {
      showToast({ title: 'Test', type: 'success' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByRole } = render(renderFn({ id: '1', visible: true }));

      expect(getByRole('alert')).toBeInTheDocument();
    });

    it('toast has aria-live polite', () => {
      showToast({ title: 'Test', type: 'info' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByRole } = render(renderFn({ id: '1', visible: true }));

      expect(getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('toast has aria-atomic true', () => {
      showToast({ title: 'Test', type: 'info' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByRole } = render(renderFn({ id: '1', visible: true }));

      expect(getByRole('alert')).toHaveAttribute('aria-atomic', 'true');
    });

    it('dismiss button has accessible label', () => {
      showToast({ title: 'Test', type: 'success' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { getByRole } = render(renderFn({ id: '1', visible: true }));

      expect(getByRole('button', { name: /dismiss notification/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing message gracefully', () => {
      showToast({ title: 'Title Only', type: 'info' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { queryByText, getByText } = render(renderFn({ id: '1', visible: true }));

      expect(getByText('Title Only')).toBeInTheDocument();
    });

    it('handles missing action gracefully', () => {
      showToast({ title: 'No Action', type: 'info' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { container } = render(renderFn({ id: '1', visible: true }));

      // Should only have dismiss button
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(1);
    });

    it('handles empty title', () => {
      showToast({ title: '', type: 'info' });

      const renderFn = (toast.custom as jest.Mock).mock.calls[0][0];
      const { container } = render(renderFn({ id: '1', visible: true }));

      expect(container).toBeInTheDocument();
    });
  });
});
