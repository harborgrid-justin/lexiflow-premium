import { DataSourceProvider } from '@/providers';
import { apiClient } from '@/services/infrastructure/apiClient';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';

// Mock apiClient
jest.mock('@/services/infrastructure/apiClient', () => ({
  apiClient: {
    healthCheck: jest.fn(),
  },
}));

// Mock BackendHealthMonitor and SystemHealthDisplay
jest.mock('@/shared/ui/organisms/BackendHealthMonitor/BackendHealthMonitor', () => ({
  BackendHealthMonitor: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="health-monitor">Health Monitor</div> : null,
}));

jest.mock('@/shared/ui/organisms/SystemHealthDisplay/SystemHealthDisplay', () => ({
  SystemHealthDisplay: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="coverage-display">Coverage Display</div> : null,
}));

const TestWrapper = ({ children, useBackendApi = true }: { children: React.ReactNode; useBackendApi?: boolean }) => (
  <DataSourceProvider initialSource={useBackendApi ? 'postgresql' : 'indexeddb'}>
    {children}
  </DataSourceProvider>
);

describe('ConnectionStatus Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders connection status indicator', async () => {
    (apiClient.healthCheck as jest.Mock).mockResolvedValue({ status: 'ok' });

    render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/PostgreSQL/i)).toBeInTheDocument();
    });
  });

  it('displays IndexedDB status when backend API is disabled', async () => {
    render(
      <TestWrapper useBackendApi={false}>
        <ConnectionStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/IndexedDB/i)).toBeInTheDocument();
    });
  });

  it('shows checking status initially', () => {
    (apiClient.healthCheck as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ status: 'ok' }), 1000))
    );

    render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    expect(screen.getByText(/Checking/i)).toBeInTheDocument();
  });

  it('displays connected status when backend is healthy', async () => {
    (apiClient.healthCheck as jest.Mock).mockResolvedValue({ status: 'ok' });

    render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/PostgreSQL/i)).toBeInTheDocument();
    });
  });

  it('displays offline status when backend health check fails', async () => {
    (apiClient.healthCheck as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Backend Offline/i)).toBeInTheDocument();
    });
  });

  it('periodically checks backend health', async () => {
    (apiClient.healthCheck as jest.Mock).mockResolvedValue({ status: 'ok' });

    render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    // Initial check
    await waitFor(() => {
      expect(apiClient.healthCheck).toHaveBeenCalledTimes(1);
    });

    // Advance time by 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(apiClient.healthCheck).toHaveBeenCalledTimes(2);
    });
  });

  it('opens health monitor when Activity button is clicked', async () => {
    (apiClient.healthCheck as jest.Mock).mockResolvedValue({ status: 'ok' });
    const user = userEvent.setup({ delay: null });

    render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/PostgreSQL/i)).toBeInTheDocument();
    });

    const activityButton = screen.getAllByRole('button')[0];
    await user.click(activityButton);

    expect(screen.getByTestId('health-monitor')).toBeInTheDocument();
  });

  it('opens coverage display when Info button is clicked', async () => {
    (apiClient.healthCheck as jest.Mock).mockResolvedValue({ status: 'ok' });
    const user = userEvent.setup({ delay: null });

    render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/PostgreSQL/i)).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const infoButton = buttons[1];
    await user.click(infoButton);

    expect(screen.getByTestId('coverage-display')).toBeInTheDocument();
  });

  it('applies custom className prop', async () => {
    (apiClient.healthCheck as jest.Mock).mockResolvedValue({ status: 'ok' });

    const { container } = render(
      <TestWrapper>
        <ConnectionStatus className="custom-class" />
      </TestWrapper>
    );

    await waitFor(() => {
      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });
  });

  it('handles online/offline events', async () => {
    (apiClient.healthCheck as jest.Mock).mockResolvedValue({ status: 'ok' });

    render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/PostgreSQL/i)).toBeInTheDocument();
    });

    // Simulate going offline
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false,
    });
    window.dispatchEvent(new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText(/No Internet/i)).toBeInTheDocument();
    });

    // Simulate coming back online
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.queryByText(/No Internet/i)).not.toBeInTheDocument();
    });
  });

  it('cleans up intervals on unmount', async () => {
    (apiClient.healthCheck as jest.Mock).mockResolvedValue({ status: 'ok' });

    const { unmount } = render(
      <TestWrapper>
        <ConnectionStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(apiClient.healthCheck).toHaveBeenCalled();
    });

    const initialCallCount = (apiClient.healthCheck as jest.Mock).mock.calls.length;

    unmount();

    // Advance time
    jest.advanceTimersByTime(60000);

    // Should not have made additional calls after unmount
    expect(apiClient.healthCheck).toHaveBeenCalledTimes(initialCallCount);
  });
});
