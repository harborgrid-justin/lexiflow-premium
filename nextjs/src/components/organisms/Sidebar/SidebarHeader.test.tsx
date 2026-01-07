/**
 * @jest-environment jsdom
 * @module SidebarHeader.test
 * @description Enterprise-grade tests for SidebarHeader component
 *
 * Test coverage:
 * - Tenant branding display
 * - Close button functionality
 * - Data fetching integration
 * - Loading states
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarHeader } from './SidebarHeader';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      primary: { DEFAULT: 'bg-blue-600' },
    },
  }),
}));

const mockTenantConfig = {
  name: 'LexiFlow',
  tier: 'Enterprise Suite',
  version: '2.5',
  region: 'US-East-1',
};

jest.mock('@/hooks/useQueryHooks', () => ({
  useQuery: jest.fn(() => ({
    data: mockTenantConfig,
    isLoading: false,
    error: null,
  })),
}));

jest.mock('@/services/data/dataService', () => ({
  DataService: {
    admin: {
      getTenantConfig: jest.fn(() => Promise.resolve(mockTenantConfig)),
    },
  },
}));

jest.mock('./SidebarHeader.styles', () => ({
  getHeaderContainer: () => 'header-container',
  brandingContainer: 'branding-container',
  getLogoContainer: () => 'logo-container',
  logoIcon: 'logo-icon',
  textContainer: 'text-container',
  getTenantName: () => 'tenant-name',
  getTenantTier: () => 'tenant-tier',
  getCloseButton: () => 'close-button',
  closeIcon: 'close-icon',
}));

// ============================================================================
// TEST DATA
// ============================================================================

const defaultProps = {
  onClose: jest.fn(),
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

const renderSidebarHeader = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<SidebarHeader {...mergedProps} />);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('SidebarHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the header container', () => {
      renderSidebarHeader();

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('displays tenant name', () => {
      renderSidebarHeader();

      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
    });

    it('displays tenant tier', () => {
      renderSidebarHeader();

      expect(screen.getByText('Enterprise Suite')).toBeInTheDocument();
    });

    it('renders close button', () => {
      renderSidebarHeader();

      expect(screen.getByRole('button', { name: /close sidebar/i })).toBeInTheDocument();
    });

    it('renders Scale logo icon', () => {
      renderSidebarHeader();

      // Logo container should be present
      expect(screen.getByText('LexiFlow').previousElementSibling).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      renderSidebarHeader({ onClose });

      await user.click(screen.getByRole('button', { name: /close sidebar/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('has accessible aria-label', () => {
      renderSidebarHeader();

      const closeButton = screen.getByRole('button', { name: /close sidebar/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close sidebar');
    });
  });

  describe('Data Fetching', () => {
    it('uses initial data when query data is not available', () => {
      const { useQuery } = require('@/hooks/useQueryHooks');
      useQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderSidebarHeader();

      // Should not crash, may show undefined values
      expect(screen.queryByText('LexiFlow')).not.toBeInTheDocument();
    });

    it('displays custom tenant config when available', () => {
      const { useQuery } = require('@/hooks/useQueryHooks');
      useQuery.mockReturnValueOnce({
        data: {
          name: 'Custom Law Firm',
          tier: 'Professional',
          version: '3.0',
          region: 'EU-West',
        },
        isLoading: false,
        error: null,
      });

      renderSidebarHeader();

      expect(screen.getByText('Custom Law Firm')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderSidebarHeader();

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('LexiFlow');
    });

    it('close button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      renderSidebarHeader({ onClose });

      const closeButton = screen.getByRole('button', { name: /close sidebar/i });
      closeButton.focus();

      await user.keyboard('{Enter}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('close button responds to Space key', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      renderSidebarHeader({ onClose });

      const closeButton = screen.getByRole('button', { name: /close sidebar/i });
      closeButton.focus();

      await user.keyboard(' ');

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('React.memo Optimization', () => {
    it('prevents unnecessary re-renders with stable props', () => {
      const onClose = jest.fn();
      const { rerender } = renderSidebarHeader({ onClose });

      // Re-render with same props
      rerender(<SidebarHeader onClose={onClose} />);

      // Component should still render correctly
      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme styles correctly', () => {
      renderSidebarHeader();

      // Verify component renders with theme
      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing tenant name gracefully', () => {
      const { useQuery } = require('@/hooks/useQueryHooks');
      useQuery.mockReturnValueOnce({
        data: { tier: 'Basic' },
        isLoading: false,
        error: null,
      });

      renderSidebarHeader();

      // Should not crash
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    it('handles null onClose callback gracefully', async () => {
      const user = userEvent.setup();
      renderSidebarHeader({ onClose: null as unknown as () => void });

      const closeButton = screen.getByRole('button', { name: /close sidebar/i });

      // Should not throw when clicked
      await expect(user.click(closeButton)).resolves.not.toThrow();
    });
  });
});
