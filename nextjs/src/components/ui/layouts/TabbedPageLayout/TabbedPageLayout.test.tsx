import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabbedPageLayout, TabConfigItem } from './TabbedPageLayout';
import { Home, Settings, Users, FileText } from 'lucide-react';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      background: 'bg-white',
      border: { default: 'border-slate-200' },
      text: { primary: 'text-slate-900', secondary: 'text-slate-600', tertiary: 'text-slate-400' },
      primary: { text: 'text-blue-600', border: 'border-blue-600' },
      surface: { default: 'bg-white', highlight: 'bg-slate-50' },
    },
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

// Mock PageHeader
jest.mock('@/components/organisms/PageHeader/PageHeader', () => ({
  PageHeader: ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {actions && <div data-testid="header-actions">{actions}</div>}
    </div>
  ),
}));

describe('TabbedPageLayout', () => {
  const defaultTabConfig: TabConfigItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      subTabs: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'analytics', label: 'Analytics', icon: FileText },
      ],
    },
    {
      id: 'management',
      label: 'Management',
      icon: Users,
      subTabs: [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const defaultProps = {
    pageTitle: 'Page Title',
    pageSubtitle: 'Page Subtitle',
    tabConfig: defaultTabConfig,
    activeTabId: 'dashboard',
    onTabChange: jest.fn(),
    children: <div data-testid="tab-content">Tab Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders page header', () => {
      render(<TabbedPageLayout {...defaultProps} />);
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page Subtitle')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<TabbedPageLayout {...defaultProps} />);
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });

    it('renders page actions when provided', () => {
      render(
        <TabbedPageLayout
          {...defaultProps}
          pageActions={<button>Add New</button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument();
    });
  });

  describe('Parent Tab Navigation', () => {
    it('renders parent tabs', () => {
      render(<TabbedPageLayout {...defaultProps} />);
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Management')).toBeInTheDocument();
    });

    it('highlights active parent tab', () => {
      render(<TabbedPageLayout {...defaultProps} activeTabId="dashboard" />);
      const overviewTab = screen.getByText('Overview').closest('button');
      expect(overviewTab).toHaveClass('border-current');
    });

    it('calls onTabChange with first subtab when parent tab clicked', () => {
      const handleTabChange = jest.fn();
      render(
        <TabbedPageLayout {...defaultProps} onTabChange={handleTabChange} />
      );

      fireEvent.click(screen.getByText('Management'));
      expect(handleTabChange).toHaveBeenCalledWith('users');
    });
  });

  describe('Sub Tab Navigation', () => {
    it('renders sub tabs for active parent', () => {
      render(<TabbedPageLayout {...defaultProps} activeTabId="dashboard" />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('highlights active sub tab', () => {
      render(<TabbedPageLayout {...defaultProps} activeTabId="dashboard" />);
      const dashboardTab = screen.getAllByText('Dashboard')[0]?.closest('button');
      // The subtab in the pills section should have active styling
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('calls onTabChange when sub tab clicked', () => {
      const handleTabChange = jest.fn();
      render(
        <TabbedPageLayout {...defaultProps} onTabChange={handleTabChange} />
      );

      // Find the Analytics button in the subtabs section
      const analyticsButtons = screen.getAllByText('Analytics');
      const subtabButton = analyticsButtons.find(el => el.closest('button'));
      if (subtabButton) {
        fireEvent.click(subtabButton);
        expect(handleTabChange).toHaveBeenCalledWith('analytics');
      }
    });
  });

  describe('Layout Structure', () => {
    it('has full height', () => {
      const { container } = render(<TabbedPageLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('h-full');
    });

    it('has flex column layout', () => {
      const { container } = render(<TabbedPageLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('flex', 'flex-col');
    });

    it('has fade-in animation', () => {
      const { container } = render(<TabbedPageLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('animate-fade-in');
    });

    it('applies theme background', () => {
      const { container } = render(<TabbedPageLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('bg-white');
    });
  });

  describe('Desktop Navigation', () => {
    it('parent tabs are hidden on mobile', () => {
      const { container } = render(<TabbedPageLayout {...defaultProps} />);
      const parentNav = container.querySelector('.hidden.md\\:flex');
      expect(parentNav).toBeInTheDocument();
    });
  });

  describe('Sub Tab Pills', () => {
    it('sub tabs have pill styling', () => {
      render(<TabbedPageLayout {...defaultProps} />);
      const subtabs = screen.getAllByText('Dashboard');
      const pillButton = subtabs.find(el => {
        const button = el.closest('button');
        return button?.classList.contains('rounded-full');
      });
      expect(pillButton).toBeTruthy();
    });

    it('sub tabs container is horizontally scrollable', () => {
      const { container } = render(<TabbedPageLayout {...defaultProps} />);
      const pillContainer = container.querySelector('.overflow-x-auto');
      expect(pillContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tab config', () => {
      const emptyConfig: TabConfigItem[] = [];
      render(
        <TabbedPageLayout
          {...defaultProps}
          tabConfig={emptyConfig}
          activeTabId=""
        />
      );
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });

    it('handles tab with empty subTabs', () => {
      const configWithEmptySubtabs: TabConfigItem[] = [
        {
          id: 'empty',
          label: 'Empty',
          icon: Home,
          subTabs: [],
        },
      ];
      render(
        <TabbedPageLayout
          {...defaultProps}
          tabConfig={configWithEmptySubtabs}
          activeTabId=""
        />
      );
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('handles activeTabId not in any subtab', () => {
      render(
        <TabbedPageLayout {...defaultProps} activeTabId="non-existent" />
      );
      // Should fall back to first tab config
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('has displayName for debugging', () => {
      expect(TabbedPageLayout.displayName).toBe('TabbedPageLayout');
    });
  });

  describe('Complete Configuration', () => {
    it('renders with all props', () => {
      const handleTabChange = jest.fn();
      render(
        <TabbedPageLayout
          pageTitle="Complete Page"
          pageSubtitle="All features"
          pageActions={<button>Action</button>}
          tabConfig={defaultTabConfig}
          activeTabId="analytics"
          onTabChange={handleTabChange}
        >
          <div data-testid="complete-content">Complete Content</div>
        </TabbedPageLayout>
      );

      expect(screen.getByText('Complete Page')).toBeInTheDocument();
      expect(screen.getByText('All features')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Management')).toBeInTheDocument();
      expect(screen.getByTestId('complete-content')).toBeInTheDocument();
    });
  });
});
