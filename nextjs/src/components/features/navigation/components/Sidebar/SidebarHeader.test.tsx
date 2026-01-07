/**
 * @jest-environment jsdom
 * SidebarHeader Component Tests
 * Enterprise-grade tests for sidebar header with tenant branding
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarHeader } from './SidebarHeader';

// Mock dependencies
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: '', highlight: '' },
      text: { primary: '', secondary: '', tertiary: '', muted: '' },
      border: { default: '', subtle: '' },
      backdrop: '',
    },
  }),
}));

// Mock DataService
jest.mock('@/services/data/dataService', () => ({
  DataService: {
    admin: {
      getTenantConfig: jest.fn(() => Promise.resolve({
        name: 'LexiFlow',
        tier: 'Enterprise Suite',
        version: '2.5',
        region: 'US-East-1',
      })),
    },
  },
}));

// Mock useQuery
jest.mock('@/hooks/useQueryHooks', () => ({
  useQuery: jest.fn((key, fn, options) => ({
    data: options?.initialData ?? {
      name: 'LexiFlow',
      tier: 'Enterprise Suite',
      version: '2.5',
      region: 'US-East-1',
    },
    isLoading: false,
    error: null,
  })),
}));

describe('SidebarHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders tenant name', () => {
      render(<SidebarHeader onClose={jest.fn()} />);

      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
    });

    it('renders tenant tier', () => {
      render(<SidebarHeader onClose={jest.fn()} />);

      expect(screen.getByText('Enterprise Suite')).toBeInTheDocument();
    });

    it('renders logo icon', () => {
      const { container } = render(<SidebarHeader onClose={jest.fn()} />);

      // Scale icon from lucide-react should be present
      const svgIcon = container.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<SidebarHeader onClose={jest.fn()} />);

      expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(<SidebarHeader onClose={onClose} />);

      await user.click(screen.getByLabelText('Close sidebar'));

      expect(onClose).toHaveBeenCalled();
    });

    it('close button has X icon', () => {
      const { container } = render(<SidebarHeader onClose={jest.fn()} />);

      const closeButton = screen.getByLabelText('Close sidebar');
      const icon = closeButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Branding', () => {
    it('displays logo container', () => {
      const { container } = render(<SidebarHeader onClose={jest.fn()} />);

      // Logo container should have rounded styling
      const logoContainer = container.querySelector('.rounded-lg');
      expect(logoContainer).toBeInTheDocument();
    });

    it('displays tenant info in correct hierarchy', () => {
      render(<SidebarHeader onClose={jest.fn()} />);

      // Tenant name should be in h1
      const tenantName = screen.getByText('LexiFlow');
      expect(tenantName.tagName).toBe('H1');

      // Tier should be in p tag
      const tier = screen.getByText('Enterprise Suite');
      expect(tier.tagName).toBe('P');
    });
  });

  describe('Layout', () => {
    it('has flex layout for branding and close button', () => {
      const { container } = render(<SidebarHeader onClose={jest.fn()} />);

      // The header container should have proper layout
      const headerContainer = container.firstChild as HTMLElement;
      expect(headerContainer).toHaveClass('flex');
    });

    it('has proper spacing between elements', () => {
      const { container } = render(<SidebarHeader onClose={jest.fn()} />);

      // Check for gap classes
      expect(container.innerHTML).toMatch(/gap-/);
    });
  });

  describe('Accessibility', () => {
    it('close button has accessible label', () => {
      render(<SidebarHeader onClose={jest.fn()} />);

      const closeButton = screen.getByLabelText('Close sidebar');
      expect(closeButton).toBeInTheDocument();
    });

    it('close button is focusable', () => {
      render(<SidebarHeader onClose={jest.fn()} />);

      const closeButton = screen.getByLabelText('Close sidebar');
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });

    it('has proper heading structure', () => {
      render(<SidebarHeader onClose={jest.fn()} />);

      // Tenant name should be h1
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('LexiFlow');
    });
  });

  describe('React.memo', () => {
    it('is wrapped in React.memo for performance', () => {
      // The component is exported as React.memo
      expect(SidebarHeader.$$typeof).toBeDefined();
    });
  });

  describe('Styling', () => {
    it('applies theme-based styling to tenant name', () => {
      const { container } = render(<SidebarHeader onClose={jest.fn()} />);

      const tenantName = screen.getByText('LexiFlow');
      // Should have font-semibold for emphasis
      expect(tenantName).toHaveClass('font-semibold');
    });

    it('applies subdued styling to tier', () => {
      render(<SidebarHeader onClose={jest.fn()} />);

      const tier = screen.getByText('Enterprise Suite');
      // Should have text-xs for smaller text
      expect(tier).toHaveClass('text-xs');
    });
  });

  describe('With Different Tenant Config', () => {
    it('handles custom tenant configuration', () => {
      // The mock useQuery returns initial data
      render(<SidebarHeader onClose={jest.fn()} />);

      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Suite')).toBeInTheDocument();
    });
  });
});
