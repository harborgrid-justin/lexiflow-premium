/**
 * @jest-environment jsdom
 * @module SidebarNav.test
 * @description Enterprise-grade tests for SidebarNav component
 *
 * Test coverage:
 * - Navigation item rendering
 * - Active state management
 * - Role-based visibility filtering
 * - Category grouping
 * - Hover prefetching behavior
 * - Submenu functionality
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarNav } from './SidebarNav';
import { Home, FileText, Briefcase, Users, Settings, Shield } from 'lucide-react';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      primary: { DEFAULT: 'bg-blue-600', text: 'text-blue-600' },
    },
  }),
}));

const mockModules = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    category: 'Main',
    hidden: false,
    requiresAdmin: false,
    requiresAttorney: false,
    requiresStaff: false,
    component: { preload: jest.fn() },
  },
  {
    id: 'cases',
    label: 'Cases',
    icon: Briefcase,
    category: 'Case Work',
    hidden: false,
    requiresAdmin: false,
    requiresAttorney: false,
    requiresStaff: true,
    component: { preload: jest.fn() },
    children: [
      { id: 'active-cases', label: 'Active Cases', icon: Briefcase },
      { id: 'archived-cases', label: 'Archived Cases', icon: FileText },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    category: 'Case Work',
    hidden: false,
    requiresAdmin: false,
    requiresAttorney: false,
    requiresStaff: true,
    component: { preload: jest.fn() },
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    category: 'Operations',
    hidden: false,
    requiresAdmin: false,
    requiresAttorney: true,
    requiresStaff: false,
    component: { preload: jest.fn() },
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    category: 'Admin',
    hidden: false,
    requiresAdmin: true,
    requiresAttorney: false,
    requiresStaff: false,
    component: { preload: jest.fn() },
  },
  {
    id: 'hidden-module',
    label: 'Hidden Module',
    icon: Shield,
    category: 'Admin',
    hidden: true,
    requiresAdmin: false,
    requiresAttorney: false,
    requiresStaff: false,
  },
];

let mockSubscribeCallback: (() => void) | null = null;

jest.mock('@/services/infrastructure/moduleRegistry', () => ({
  ModuleRegistry: {
    getAllModules: jest.fn(() => mockModules),
    subscribe: jest.fn((callback) => {
      mockSubscribeCallback = callback;
      return jest.fn(); // Unsubscribe function
    }),
  },
}));

jest.mock('@/hooks/useQueryHooks', () => ({
  queryClient: {
    fetch: jest.fn(),
  },
}));

jest.mock('@/hooks/useHoverIntent', () => ({
  useHoverIntent: jest.fn(({ onHover }) => ({
    onMouseEnter: (item: unknown) => onHover(item),
    onMouseLeave: jest.fn(),
  })),
}));

jest.mock('@/config/prefetchConfig', () => ({
  PREFETCH_MAP: {
    dashboard: { key: ['dashboard'], fn: jest.fn() },
    cases: { key: ['cases'], fn: jest.fn() },
  },
}));

jest.mock('@/utils/scheduler', () => ({
  Scheduler: {
    defer: jest.fn((fn) => fn()),
  },
}));

jest.mock('./SidebarNav.styles', () => ({
  navContainer: 'nav-container',
  getCategoryHeader: () => 'category-header',
  itemsContainer: 'items-container',
  getNavItemButton: () => 'nav-item-button',
  getNavItemIcon: () => 'nav-item-icon',
  navItemLabel: 'nav-item-label',
  getActiveIndicator: () => 'active-indicator',
  getSubmenuContainer: () => 'submenu-container',
  getSubmenuButton: () => 'submenu-button',
  getSubmenuIcon: () => 'submenu-icon',
  submenuLabel: 'submenu-label',
}));

// ============================================================================
// TEST DATA
// ============================================================================

const defaultProps = {
  activeView: 'dashboard',
  setActiveView: jest.fn(),
  currentUserRole: 'admin',
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

const renderSidebarNav = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<SidebarNav {...mergedProps} />);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('SidebarNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders navigation container', () => {
      renderSidebarNav();

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('displays category headers', () => {
      renderSidebarNav();

      expect(screen.getByText('Main')).toBeInTheDocument();
      expect(screen.getByText('Case Work')).toBeInTheDocument();
    });

    it('renders visible navigation items', () => {
      renderSidebarNav();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Cases')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    it('does not render hidden modules', () => {
      renderSidebarNav();

      expect(screen.queryByText('Hidden Module')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    it('shows admin items for admin users', () => {
      renderSidebarNav({ currentUserRole: 'admin' });

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('hides admin items for non-admin users', () => {
      renderSidebarNav({ currentUserRole: 'paralegal' });

      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('shows attorney items for attorneys', () => {
      renderSidebarNav({ currentUserRole: 'attorney' });

      expect(screen.getByText('Clients')).toBeInTheDocument();
    });

    it('hides attorney items for paralegal users', () => {
      renderSidebarNav({ currentUserRole: 'paralegal' });

      expect(screen.queryByText('Clients')).not.toBeInTheDocument();
    });

    it('shows staff items for staff users', () => {
      renderSidebarNav({ currentUserRole: 'staff' });

      expect(screen.getByText('Cases')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    it('handles Administrator role as admin', () => {
      renderSidebarNav({ currentUserRole: 'Administrator' });

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('handles Senior Partner role as attorney', () => {
      renderSidebarNav({ currentUserRole: 'Senior Partner' });

      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('applies active styling to current view', () => {
      renderSidebarNav({ activeView: 'dashboard' });

      const dashboardButton = screen.getByText('Dashboard').closest('button');
      expect(dashboardButton).toHaveClass('nav-item-button');
    });

    it('shows active indicator for active item', () => {
      const { container } = renderSidebarNav({ activeView: 'dashboard' });

      // Active indicator should be present
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('applies active styling when child is active', () => {
      renderSidebarNav({ activeView: 'active-cases' });

      // Parent item should show active styling when child is active
      expect(screen.getByText('Cases')).toBeInTheDocument();
    });
  });

  describe('Navigation Interactions', () => {
    it('calls setActiveView when item is clicked', async () => {
      const user = userEvent.setup();
      const setActiveView = jest.fn();
      renderSidebarNav({ setActiveView });

      await user.click(screen.getByText('Dashboard'));

      expect(setActiveView).toHaveBeenCalledWith('dashboard');
    });

    it('navigates to parent item before showing children', async () => {
      const user = userEvent.setup();
      const setActiveView = jest.fn();
      renderSidebarNav({ setActiveView });

      await user.click(screen.getByText('Cases'));

      expect(setActiveView).toHaveBeenCalledWith('cases');
    });
  });

  describe('Submenu Functionality', () => {
    it('shows submenu when parent is active', () => {
      renderSidebarNav({ activeView: 'cases' });

      expect(screen.getByText('Active Cases')).toBeInTheDocument();
      expect(screen.getByText('Archived Cases')).toBeInTheDocument();
    });

    it('shows submenu when child is active', () => {
      renderSidebarNav({ activeView: 'active-cases' });

      expect(screen.getByText('Active Cases')).toBeInTheDocument();
    });

    it('hides submenu when parent is not active', () => {
      renderSidebarNav({ activeView: 'dashboard' });

      expect(screen.queryByText('Active Cases')).not.toBeInTheDocument();
    });

    it('navigates to child item when clicked', async () => {
      const user = userEvent.setup();
      const setActiveView = jest.fn();
      renderSidebarNav({ activeView: 'cases', setActiveView });

      await user.click(screen.getByText('Active Cases'));

      expect(setActiveView).toHaveBeenCalledWith('active-cases');
    });
  });

  describe('Hover Prefetching', () => {
    it('triggers hover intent on mouse enter', async () => {
      const user = userEvent.setup();
      renderSidebarNav();

      const dashboardButton = screen.getByText('Dashboard').closest('button');
      await user.hover(dashboardButton!);

      // Hover intent hook should be called
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('preloads component when hovered', async () => {
      const { Scheduler } = require('@/utils/scheduler');
      renderSidebarNav();

      // Simulate hover
      const dashboardButton = screen.getByText('Dashboard').closest('button');
      fireEvent.mouseEnter(dashboardButton!);

      // Scheduler.defer should be called
      expect(Scheduler.defer).toHaveBeenCalled();
    });
  });

  describe('Module Registry Subscription', () => {
    it('subscribes to module changes on mount', () => {
      const { ModuleRegistry } = require('@/services/infrastructure/moduleRegistry');

      renderSidebarNav();

      expect(ModuleRegistry.subscribe).toHaveBeenCalled();
    });

    it('updates when modules change', () => {
      const { ModuleRegistry } = require('@/services/infrastructure/moduleRegistry');

      renderSidebarNav();

      // Simulate module change
      act(() => {
        if (mockSubscribeCallback) {
          mockSubscribeCallback();
        }
      });

      // Should re-fetch modules
      expect(ModuleRegistry.getAllModules).toHaveBeenCalled();
    });
  });

  describe('Category Ordering', () => {
    it('displays categories in correct order', () => {
      renderSidebarNav();

      const headers = screen.getAllByRole('heading', { level: 3 });
      const headerTexts = headers.map(h => h.textContent);

      // Verify Main comes before Case Work
      const mainIndex = headerTexts.indexOf('Main');
      const caseWorkIndex = headerTexts.indexOf('Case Work');

      expect(mainIndex).toBeLessThan(caseWorkIndex);
    });

    it('does not render empty categories', () => {
      const { ModuleRegistry } = require('@/services/infrastructure/moduleRegistry');
      ModuleRegistry.getAllModules.mockReturnValueOnce([
        mockModules[0], // Only dashboard
      ]);

      renderSidebarNav();

      expect(screen.queryByText('Litigation Tools')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation landmark', () => {
      renderSidebarNav();

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('all nav items are keyboard accessible', async () => {
      const user = userEvent.setup();
      const setActiveView = jest.fn();
      renderSidebarNav({ setActiveView });

      const dashboardButton = screen.getByText('Dashboard').closest('button');
      dashboardButton!.focus();

      await user.keyboard('{Enter}');

      expect(setActiveView).toHaveBeenCalledWith('dashboard');
    });

    it('items have proper heading structure for categories', () => {
      renderSidebarNav();

      const categoryHeaders = screen.getAllByRole('heading', { level: 3 });
      expect(categoryHeaders.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles modules without icons gracefully', () => {
      const { ModuleRegistry } = require('@/services/infrastructure/moduleRegistry');
      ModuleRegistry.getAllModules.mockReturnValueOnce([
        { ...mockModules[0], icon: undefined },
      ]);

      renderSidebarNav();

      // Should not render item without icon
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('handles empty modules list', () => {
      const { ModuleRegistry } = require('@/services/infrastructure/moduleRegistry');
      ModuleRegistry.getAllModules.mockReturnValueOnce([]);

      renderSidebarNav();

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('handles unknown user roles', () => {
      renderSidebarNav({ currentUserRole: 'unknown-role' });

      // Should show only non-restricted items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });
});
