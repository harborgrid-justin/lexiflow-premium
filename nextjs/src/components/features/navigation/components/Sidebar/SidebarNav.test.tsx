/**
 * @jest-environment jsdom
 * SidebarNav Component Tests
 * Enterprise-grade tests for sidebar navigation with hover prefetching
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarNav } from './SidebarNav';
import type { ModuleDefinition, NavCategory } from '@/types';

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

// Create mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <svg className={className} data-testid="mock-icon"><path d="M0 0h24v24H0z" /></svg>
);

// Mock modules
const mockModules: ModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    category: 'Main' as NavCategory,
    icon: MockIcon,
    component: null,
    hidden: false,
    requiresAdmin: false,
  },
  {
    id: 'cases',
    label: 'Cases',
    category: 'Matters' as NavCategory,
    icon: MockIcon,
    component: null,
    hidden: false,
    requiresAdmin: false,
    children: [
      {
        id: 'cases-active',
        label: 'Active Cases',
        category: 'Matters' as NavCategory,
        icon: MockIcon,
        component: null,
      },
      {
        id: 'cases-closed',
        label: 'Closed Cases',
        category: 'Matters' as NavCategory,
        icon: MockIcon,
        component: null,
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    category: 'Admin' as NavCategory,
    icon: MockIcon,
    component: null,
    hidden: false,
    requiresAdmin: true,
  },
  {
    id: 'hidden-route',
    label: 'Hidden Route',
    category: 'Main' as NavCategory,
    icon: MockIcon,
    component: null,
    hidden: true,
    requiresAdmin: false,
  },
];

// Mock ModuleRegistry
jest.mock('@/services/infrastructure/moduleRegistry', () => ({
  ModuleRegistry: {
    getAllModules: jest.fn(() => mockModules),
    subscribe: jest.fn(() => jest.fn()), // Return unsubscribe function
  },
}));

// Mock useHoverIntent
jest.mock('@/hooks/useHoverIntent', () => ({
  useHoverIntent: jest.fn(({ onHover }) => ({
    onMouseEnter: (item: any) => onHover?.(item),
    onMouseLeave: jest.fn(),
  })),
}));

// Mock queryClient
jest.mock('@/hooks/useQueryHooks', () => ({
  queryClient: {
    fetch: jest.fn(),
  },
}));

// Mock PREFETCH_MAP
jest.mock('@/config/prefetchConfig', () => ({
  PREFETCH_MAP: {
    dashboard: { key: ['dashboard-data'], fn: jest.fn() },
    cases: { key: ['cases-data'], fn: jest.fn() },
  },
}));

// Mock Scheduler
jest.mock('@/utils/scheduler', () => ({
  Scheduler: {
    defer: jest.fn((callback) => callback()),
  },
}));

describe('SidebarNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders navigation container', () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders category headers', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Administrator"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Main')).toBeInTheDocument();
        expect(screen.getByText('Matters')).toBeInTheDocument();
      });
    });

    it('renders navigation items', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Administrator"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Cases')).toBeInTheDocument();
      });
    });

    it('renders icons for navigation items', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        const icons = screen.getAllByTestId('mock-icon');
        expect(icons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Role-based Visibility', () => {
    it('shows admin items for Administrator role', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Administrator"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
    });

    it('shows admin items for Senior Partner role', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Senior Partner"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
    });

    it('hides admin items for non-admin roles', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
      });
    });

    it('hides hidden routes', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Administrator"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Hidden Route')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('calls setActiveView when item clicked', async () => {
      const user = userEvent.setup();
      const setActiveView = jest.fn();

      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={setActiveView}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Cases')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cases'));

      expect(setActiveView).toHaveBeenCalledWith('cases');
    });

    it('highlights active item', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        const dashboardButton = screen.getByText('Dashboard').closest('button');
        // Active item should have active indicator
        expect(dashboardButton?.parentElement?.querySelector('.absolute')).toBeInTheDocument();
      });
    });
  });

  describe('Submenus', () => {
    it('shows submenu when parent is active', async () => {
      render(
        <SidebarNav
          activeView="cases"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Active Cases')).toBeInTheDocument();
        expect(screen.getByText('Closed Cases')).toBeInTheDocument();
      });
    });

    it('shows submenu when child is active', async () => {
      render(
        <SidebarNav
          activeView="cases-active"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Active Cases')).toBeInTheDocument();
        expect(screen.getByText('Closed Cases')).toBeInTheDocument();
      });
    });

    it('hides submenu when parent is not active', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Active Cases')).not.toBeInTheDocument();
      });
    });

    it('navigates to child when child clicked', async () => {
      const user = userEvent.setup();
      const setActiveView = jest.fn();

      render(
        <SidebarNav
          activeView="cases"
          setActiveView={setActiveView}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Active Cases')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Active Cases'));

      expect(setActiveView).toHaveBeenCalledWith('cases-active');
    });
  });

  describe('Hover Prefetching', () => {
    it('triggers prefetch on hover', async () => {
      const { Scheduler } = require('@/utils/scheduler');

      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        const dashboardButton = screen.getByText('Dashboard').closest('button');
        fireEvent.mouseEnter(dashboardButton!);
      });

      expect(Scheduler.defer).toHaveBeenCalled();
    });
  });

  describe('Category Organization', () => {
    it('groups items by category', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Administrator"
        />
      );

      await waitFor(() => {
        // Should have category headers
        expect(screen.getByText('Main')).toBeInTheDocument();
        expect(screen.getByText('Matters')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });
    });

    it('maintains category order', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Administrator"
        />
      );

      await waitFor(() => {
        const categoryHeaders = screen.getAllByRole('heading', { level: 3 });
        // Order should be: Main, Case Work, Admin
        expect(categoryHeaders[0]).toHaveTextContent('Main');
      });
    });
  });

  describe('Empty Categories', () => {
    it('does not render empty category sections', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney" // Non-admin, so Admin category should be empty
        />
      );

      await waitFor(() => {
        // Admin category should not appear for non-admin users
        const adminHeading = screen.queryByRole('heading', { name: 'Admin' });
        expect(adminHeading).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('uses semantic navigation element', () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('nav items are focusable buttons', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('has proper heading hierarchy for categories', async () => {
      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Administrator"
        />
      );

      await waitFor(() => {
        const headings = screen.getAllByRole('heading', { level: 3 });
        expect(headings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Module Registry Integration', () => {
    it('subscribes to module changes on mount', () => {
      const { ModuleRegistry } = require('@/services/infrastructure/moduleRegistry');

      render(
        <SidebarNav
          activeView="dashboard"
          setActiveView={jest.fn()}
          currentUserRole="Attorney"
        />
      );

      expect(ModuleRegistry.subscribe).toHaveBeenCalled();
    });
  });
});
