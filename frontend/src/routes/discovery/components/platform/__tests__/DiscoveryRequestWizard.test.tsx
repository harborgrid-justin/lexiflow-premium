/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiscoveryRequestWizard } from '../DiscoveryRequestWizard';

// Mock dependencies
vi.mock('@/features/theme', () => ({
  useTheme: () => ({
    theme: {
      background: 'bg-white',
      surface: { default: 'bg-white', input: 'bg-white' },
      border: { default: 'border-gray-200' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600' }
    }
  })
}));

vi.mock('@/hooks/useNotify', () => ({
  useNotify: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}));

vi.mock('@/hooks/useQueryHooks', () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false
  })),
  queryClient: {
    invalidate: vi.fn()
  }
}));

describe('DiscoveryRequestWizard', () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  it('should render the wizard form', () => {
    render(
      <DiscoveryRequestWizard
        caseId="case-123"
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Create New Discovery Request')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    render(
      <DiscoveryRequestWizard
        caseId="case-123"
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should display form fields', () => {
    render(
      <DiscoveryRequestWizard
        caseId="case-123"
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Propounding Party/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Responding Party/i)).toBeInTheDocument();
  });
});
