/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiscoveryPlatform } from '../DiscoveryPlatform';

// Mock dependencies
vi.mock('@/features/theme', () => ({
  useTheme: () => ({
    theme: {
      background: 'bg-white',
      surface: { default: 'bg-white', highlight: 'bg-gray-50' },
      border: { default: 'border-gray-200' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600' },
      primary: { text: 'text-blue-600', border: 'border-blue-600' }
    }
  })
}));

vi.mock('@/hooks/useNotify', () => ({
  useNotify: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  })
}));

vi.mock('@/hooks/useQueryHooks', () => ({
  useQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  queryClient: {
    invalidate: vi.fn()
  }
}));

vi.mock('@/services/data/dataService', () => ({
  DataService: {
    discovery: {
      getRequests: vi.fn(() => Promise.resolve([])),
      syncDeadlines: vi.fn(() => Promise.resolve())
    }
  }
}));

describe('DiscoveryPlatform', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(<DiscoveryPlatform />);
    }).not.toThrow();
  });

  it('should render with initialTab prop', () => {
    const { container } = render(<DiscoveryPlatform initialTab="dashboard" />);
    expect(container).toBeInTheDocument();
  });

  it('should render with caseId prop', () => {
    const { container } = render(<DiscoveryPlatform caseId="case-123" />);
    expect(container).toBeInTheDocument();
  });
});
