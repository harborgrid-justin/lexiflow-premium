import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppShellLayout } from './AppShellLayout';

// Mock the providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      background: 'bg-white',
      text: { primary: 'text-slate-900' },
      surface: { default: 'bg-white' },
      border: { default: 'border-slate-200' },
    },
  }),
}));

// Mock hooks
jest.mock('@/hooks/useAutoTimeCapture', () => ({
  useAutoTimeCapture: () => ({
    activeTime: 0,
    isIdle: false,
  }),
}));

jest.mock('@/hooks/useGlobalQueryStatus', () => ({
  useGlobalQueryStatus: () => ({
    isFetching: false,
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('AppShellLayout', () => {
  const defaultProps = {
    sidebar: <div data-testid="sidebar">Sidebar Content</div>,
    headerContent: <div data-testid="header">Header Content</div>,
    children: <div data-testid="main-content">Main Content</div>,
  };

  describe('Rendering', () => {
    it('renders sidebar content', () => {
      render(<AppShellLayout {...defaultProps} />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    });

    it('renders header content', () => {
      render(<AppShellLayout {...defaultProps} />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('renders main content', () => {
      render(<AppShellLayout {...defaultProps} />);
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('renders all sections in correct order', () => {
      const { container } = render(<AppShellLayout {...defaultProps} />);
      const flexContainer = container.firstChild as HTMLElement;

      // Sidebar should be first child
      expect(flexContainer.firstChild).toContainElement(screen.getByTestId('sidebar'));
    });
  });

  describe('Layout Structure', () => {
    it('has full viewport height', () => {
      const { container } = render(<AppShellLayout {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('h-[100dvh]');
    });

    it('has flex layout', () => {
      const { container } = render(<AppShellLayout {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
    });

    it('prevents overflow', () => {
      const { container } = render(<AppShellLayout {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('overflow-hidden');
    });

    it('header has fixed height', () => {
      render(<AppShellLayout {...defaultProps} />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('h-16');
    });

    it('header has proper z-index', () => {
      render(<AppShellLayout {...defaultProps} />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('z-40');
    });

    it('main content area is flexible', () => {
      render(<AppShellLayout {...defaultProps} />);
      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1');
    });
  });

  describe('Theme Integration', () => {
    it('applies theme background color', () => {
      const { container } = render(<AppShellLayout {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-white');
    });

    it('applies theme text color', () => {
      const { container } = render(<AppShellLayout {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('text-slate-900');
    });

    it('applies header surface style', () => {
      render(<AppShellLayout {...defaultProps} />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-white');
    });

    it('applies header border style', () => {
      render(<AppShellLayout {...defaultProps} />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('border-slate-200');
    });
  });

  describe('Optional Props', () => {
    it('renders without activeView', () => {
      render(<AppShellLayout {...defaultProps} />);
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('renders without selectedCaseId', () => {
      render(<AppShellLayout {...defaultProps} />);
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('renders with all optional props', () => {
      render(
        <AppShellLayout
          {...defaultProps}
          activeView="dashboard"
          onNavigate={jest.fn()}
          selectedCaseId="case-123"
        />
      );
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  });

  describe('Semantic HTML', () => {
    it('uses header element for header', () => {
      render(<AppShellLayout {...defaultProps} />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('uses main element for content', () => {
      render(<AppShellLayout {...defaultProps} />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('CSS Containment', () => {
    it('main content has strict containment for performance', () => {
      render(<AppShellLayout {...defaultProps} />);
      const main = screen.getByRole('main');
      expect(main).toHaveStyle({ contain: 'strict' });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty sidebar', () => {
      render(
        <AppShellLayout
          {...defaultProps}
          sidebar={<div data-testid="empty-sidebar" />}
        />
      );
      expect(screen.getByTestId('empty-sidebar')).toBeInTheDocument();
    });

    it('handles empty header', () => {
      render(
        <AppShellLayout
          {...defaultProps}
          headerContent={<div data-testid="empty-header" />}
        />
      );
      expect(screen.getByTestId('empty-header')).toBeInTheDocument();
    });

    it('handles complex children', () => {
      render(
        <AppShellLayout
          {...defaultProps}
          children={
            <div>
              <section data-testid="section-1">Section 1</section>
              <section data-testid="section-2">Section 2</section>
            </div>
          }
        />
      );
      expect(screen.getByTestId('section-1')).toBeInTheDocument();
      expect(screen.getByTestId('section-2')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('has displayName for debugging', () => {
      expect(AppShellLayout.displayName).toBe('AppShellLayout');
    });
  });

  describe('Responsive Design', () => {
    it('has responsive padding in header', () => {
      render(<AppShellLayout {...defaultProps} />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('px-4', 'md:px-6');
    });
  });

  describe('Transitions', () => {
    it('has color transition for theme changes', () => {
      const { container } = render(<AppShellLayout {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('transition-colors');
    });
  });
});
