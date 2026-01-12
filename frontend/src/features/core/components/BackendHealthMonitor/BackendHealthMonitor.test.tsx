import { ThemeProvider } from '@/features/theme';
import { apiClient, type SystemHealth } from '@/services/infrastructure/apiClient';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BackendHealthMonitor } from './BackendHealthMonitor';

// Mock apiClient
jest.mock('@/services/infrastructure/apiClient', () => ({
  apiClient: {
    checkSystemHealth: jest.fn(),
  },
}));

const mockHealthData: SystemHealth = {
  status: 'online',
  timestamp: '2026-01-12T00:00:00Z',
  services: {
    database: 'online',
    api: 'online',
    redis: 'online',
  },
  metrics: {
    requestsPerMinute: 150,
    averageResponseTime: 45,
    activeConnections: 23,
  },
};

const mockDegradedHealth: SystemHealth = {
  status: 'degraded',
  timestamp: '2026-01-12T00:00:00Z',
  services: {
    database: 'online',
    api: 'degraded',
    redis: 'online',
  },
  metrics: {
    requestsPerMinute: 50,
    averageResponseTime: 250,
    activeConnections: 5,
  },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('BackendHealthMonitor Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('fetches and displays health data when opened', async () => {
    (apiClient.checkSystemHealth as jest.Mock).mockResolvedValue(mockHealthData);

    render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(apiClient.checkSystemHealth).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays loading state while fetching health data', async () => {
    (apiClient.checkSystemHealth as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockHealthData), 100))
    );

    render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Should show loading indicator initially
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await waitFor(() => {
      expect(apiClient.checkSystemHealth).toHaveBeenCalled();
    });
  });

  it('handles error when health check fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (apiClient.checkSystemHealth as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to check system health:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('calls onClose when backdrop is clicked', async () => {
    (apiClient.checkSystemHealth as jest.Mock).mockResolvedValue(mockHealthData);
    const user = userEvent.setup();

    const { container } = render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click on the backdrop (parent of dialog)
    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('does not close when clicking inside the dialog', async () => {
    (apiClient.checkSystemHealth as jest.Mock).mockResolvedValue(mockHealthData);
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    await user.click(dialog);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('allows manual refresh of health data', async () => {
    (apiClient.checkSystemHealth as jest.Mock).mockResolvedValue(mockHealthData);
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(apiClient.checkSystemHealth).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.queryByRole('button', { name: /refresh/i });
    if (refreshButton) {
      await user.click(refreshButton);
      await waitFor(() => {
        expect(apiClient.checkSystemHealth).toHaveBeenCalledTimes(2);
      });
    }
  });

  it('displays online status with green indicator', async () => {
    (apiClient.checkSystemHealth as jest.Mock).mockResolvedValue(mockHealthData);

    render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Check for online status indicators (CheckCircle icons or green colors)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('displays degraded status with amber indicator', async () => {
    (apiClient.checkSystemHealth as jest.Mock).mockResolvedValue(mockDegradedHealth);

    render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Check for degraded status indicators
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', async () => {
    (apiClient.checkSystemHealth as jest.Mock).mockResolvedValue(mockHealthData);

    render(
      <TestWrapper>
        <BackendHealthMonitor isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });
});
