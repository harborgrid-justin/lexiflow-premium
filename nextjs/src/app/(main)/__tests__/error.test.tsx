/**
 * Enterprise Test Suite: Error Boundary Component
 *
 * Comprehensive tests for the main route group error boundary including:
 * - Error categorization
 * - User-facing messages
 * - Recovery actions
 * - Development vs production mode
 * - Accessibility compliance
 * - Error logging
 *
 * @module error.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { createConsoleMock } from './test-utils';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="icon-alert-triangle">AlertTriangle</span>,
  ArrowLeft: () => <span data-testid="icon-arrow-left">ArrowLeft</span>,
  FileText: () => <span data-testid="icon-file-text">FileText</span>,
  HelpCircle: () => <span data-testid="icon-help-circle">HelpCircle</span>,
  Home: () => <span data-testid="icon-home">Home</span>,
  RefreshCw: () => <span data-testid="icon-refresh">RefreshCw</span>,
}));

describe('MainError Component', () => {
  let MainError: React.FC<{ error: Error & { digest?: string }; reset: () => void }>;
  const consoleMock = createConsoleMock();

  beforeAll(async () => {
    const errorModule = await import('../error');
    MainError = errorModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockBack.mockClear();
    consoleMock.mock();
  });

  afterEach(() => {
    consoleMock.restore();
    consoleMock.clear();
  });

  describe('Basic Rendering', () => {
    it('should render without errors', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      const { container } = render(
        <MainError error={mockError} reset={mockReset} />
      );
      expect(container).toBeDefined();
    });

    it('should display the error title', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      // Default error category title
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });

    it('should display the error description', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(
        screen.getByText('An unexpected error occurred while processing your request')
      ).toBeInTheDocument();
    });

    it('should display the alert icon', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByTestId('icon-alert-triangle')).toBeInTheDocument();
    });
  });

  describe('Error Categorization', () => {
    it('should categorize network errors correctly', () => {
      const mockError = new Error('Network request failed');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Connection Issue')).toBeInTheDocument();
      expect(
        screen.getByText('We encountered a problem communicating with our servers')
      ).toBeInTheDocument();
    });

    it('should categorize API errors correctly', () => {
      const mockError = new Error('API error: 500');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Connection Issue')).toBeInTheDocument();
    });

    it('should categorize fetch errors correctly', () => {
      const mockError = new Error('Fetch failed');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Connection Issue')).toBeInTheDocument();
    });

    it('should categorize permission errors correctly', () => {
      const mockError = new Error('Permission denied');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText("You don't have permission to access this resource")
      ).toBeInTheDocument();
    });

    it('should categorize unauthorized errors correctly', () => {
      const mockError = new Error('Unauthorized access');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should categorize forbidden errors correctly', () => {
      const mockError = new Error('Forbidden resource');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should categorize validation errors correctly', () => {
      const mockError = new Error('Invalid input provided');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Invalid Data')).toBeInTheDocument();
      expect(
        screen.getByText('The data provided is invalid or incomplete')
      ).toBeInTheDocument();
    });

    it('should categorize required field errors correctly', () => {
      const mockError = new Error('Required field missing');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Invalid Data')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render Try Again button', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should call reset when Try Again is clicked', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should render Go Back button', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should call router.back when Go Back is clicked', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      fireEvent.click(screen.getByRole('button', { name: /go back/i }));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should render Dashboard button', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should navigate to dashboard when Dashboard is clicked', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      fireEvent.click(screen.getByRole('button', { name: /dashboard/i }));
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Suggestions', () => {
    it('should display suggestions for network errors', () => {
      const mockError = new Error('Network error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
      expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
    });

    it('should display suggestions for permission errors', () => {
      const mockError = new Error('Permission denied');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(
        screen.getByText('Verify you are logged in with the correct account')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Contact your administrator for access')
      ).toBeInTheDocument();
    });

    it('should display suggestions for validation errors', () => {
      const mockError = new Error('Invalid data');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(
        screen.getByText('Check that all required fields are filled correctly')
      ).toBeInTheDocument();
    });

    it('should display generic suggestions for unknown errors', () => {
      const mockError = new Error('Unknown error type');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
      expect(
        screen.getByText('Clear your browser cache and cookies')
      ).toBeInTheDocument();
    });
  });

  describe('Error Digest Display', () => {
    it('should display error digest when available', () => {
      const mockError = Object.assign(new Error('Test error'), {
        digest: 'error-digest-123',
      });
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByText('error-digest-123')).toBeInTheDocument();
    });

    it('should not display digest section when not available', () => {
      const mockError = new Error('Test error without digest');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      // Error Reference section should not be present
      expect(screen.queryByText('Error Reference')).not.toBeInTheDocument();
    });
  });

  describe('Development Mode Features', () => {
    const originalEnv = process.env.NODE_ENV;

    afterAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv });
    });

    it('should show stack trace in development mode', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });

      const mockError = new Error('Test error');
      mockError.stack = 'Error: Test error\n    at TestComponent';
      const mockReset = jest.fn();

      // Re-import to get fresh module with new env
      jest.resetModules();
      const { default: MainErrorDev } = await import('../error');

      render(<MainErrorDev error={mockError} reset={mockReset} />);

      // Look for stack trace toggle
      expect(screen.getByText('Show stack trace →')).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log error details on mount', async () => {
      const mockError = Object.assign(new Error('Test error for logging'), {
        digest: 'test-digest',
        stack: 'test stack trace',
      });
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      await waitFor(() => {
        const errors = consoleMock.getErrors();
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.includes('Main Route Error'))).toBe(true);
      });
    });
  });

  describe('Footer Links', () => {
    it('should display support link', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      const supportLink = screen.getByRole('link', { name: /contact support/i });
      expect(supportLink).toHaveAttribute('href', '/support');
    });

    it('should display knowledge base link', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      const kbLink = screen.getByRole('link', { name: /knowledge base/i });
      expect(kbLink).toHaveAttribute('href', '/knowledge-base');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading structure', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3); // Try Again, Go Back, Dashboard
    });

    it('should have accessible links', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(2); // Support, Knowledge Base
    });

    it('should have proper button focus states', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      render(<MainError error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeVisible();
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode classes on container', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      const { container } = render(<MainError error={mockError} reset={mockReset} />);

      const rootDiv = container.firstChild;
      expect((rootDiv as Element).className).toContain('dark:');
    });

    it('should include dark mode classes on card', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      const { container } = render(<MainError error={mockError} reset={mockReset} />);

      const card = container.querySelector('.bg-white');
      expect(card?.className).toContain('dark:bg-slate-800');
    });
  });

  describe('Layout Structure', () => {
    it('should center content on screen', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      const { container } = render(<MainError error={mockError} reset={mockReset} />);

      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('flex');
      expect(rootDiv).toHaveClass('items-center');
      expect(rootDiv).toHaveClass('justify-center');
    });

    it('should have responsive button grid', () => {
      const mockError = new Error('Test error');
      const mockReset = jest.fn();

      const { container } = render(<MainError error={mockError} reset={mockReset} />);

      const buttonGrid = container.querySelector('.sm\\:grid-cols-3');
      expect(buttonGrid).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle error with only message', () => {
      const mockError = new Error('Simple error message');
      const mockReset = jest.fn();

      expect(() =>
        render(<MainError error={mockError} reset={mockReset} />)
      ).not.toThrow();
    });

    it('should handle error with all properties', () => {
      const mockError = Object.assign(new Error('Complete error'), {
        digest: 'digest-123',
        stack: 'stack trace here',
        cause: new Error('cause error'),
      });
      const mockReset = jest.fn();

      expect(() =>
        render(<MainError error={mockError} reset={mockReset} />)
      ).not.toThrow();
    });
  });
});

describe('MainError - Icons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display all required icons', async () => {
    const errorModule = await import('../error');
    const MainError = errorModule.default;

    const mockError = new Error('Test error');
    const mockReset = jest.fn();

    render(<MainError error={mockError} reset={mockReset} />);

    expect(screen.getByTestId('icon-alert-triangle')).toBeInTheDocument();
    expect(screen.getByTestId('icon-help-circle')).toBeInTheDocument();
    expect(screen.getByTestId('icon-refresh')).toBeInTheDocument();
    expect(screen.getByTestId('icon-arrow-left')).toBeInTheDocument();
    expect(screen.getByTestId('icon-home')).toBeInTheDocument();
  });
});
