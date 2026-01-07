/**
 * @jest-environment jsdom
 * NavigationContext Tests
 * Enterprise-grade tests for navigation state management context
 */

import { render, screen, fireEvent, act, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  NavigationProvider,
  useNavigation,
  withNavigationContext,
  NavigationItem,
  NavigationContextValue,
} from './NavigationContext';
import type { UserRole } from '@/types';

// Helper component to test context
const TestConsumer = () => {
  const nav = useNavigation();
  return (
    <div>
      <span data-testid="current-item">{nav.currentItem?.label || 'none'}</span>
      <span data-testid="sidebar-open">{nav.isSidebarOpen.toString()}</span>
      <span data-testid="command-palette-open">{nav.isCommandPaletteOpen.toString()}</span>
      <span data-testid="user-role">{nav.userRole || 'none'}</span>
      <span data-testid="history-count">{nav.history.length}</span>
      <span data-testid="breadcrumbs-count">{nav.breadcrumbs.length}</span>
    </div>
  );
};

// Helper to create navigation items
const createNavItem = (overrides: Partial<NavigationItem> = {}): NavigationItem => ({
  id: 'test-item',
  label: 'Test Item',
  path: '/test',
  ...overrides,
});

describe('NavigationContext', () => {
  describe('NavigationProvider', () => {
    it('renders children', () => {
      render(
        <NavigationProvider>
          <div data-testid="child">Child Content</div>
        </NavigationProvider>
      );

      expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
    });

    it('provides initial state', () => {
      render(
        <NavigationProvider>
          <TestConsumer />
        </NavigationProvider>
      );

      expect(screen.getByTestId('current-item')).toHaveTextContent('none');
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
      expect(screen.getByTestId('command-palette-open')).toHaveTextContent('false');
      expect(screen.getByTestId('user-role')).toHaveTextContent('none');
    });

    it('accepts initialUserRole prop', () => {
      render(
        <NavigationProvider initialUserRole="Attorney">
          <TestConsumer />
        </NavigationProvider>
      );

      expect(screen.getByTestId('user-role')).toHaveTextContent('Attorney');
    });
  });

  describe('useNavigation hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        renderHook(() => useNavigation());
      }).toThrow('useNavigation must be used within a NavigationProvider');

      consoleSpy.mockRestore();
    });

    it('returns context value when used inside provider', () => {
      const { result } = renderHook(() => useNavigation(), {
        wrapper: NavigationProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.navigateTo).toBeDefined();
      expect(result.current.toggleSidebar).toBeDefined();
    });
  });

  describe('Navigation Actions', () => {
    describe('navigateTo', () => {
      it('updates currentItem', () => {
        const TestComponent = () => {
          const { navigateTo, currentItem } = useNavigation();
          return (
            <div>
              <button onClick={() => navigateTo(createNavItem({ label: 'Dashboard' }))}>
                Navigate
              </button>
              <span data-testid="current">{currentItem?.label || 'none'}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Navigate'));

        expect(screen.getByTestId('current')).toHaveTextContent('Dashboard');
      });

      it('adds item to history', () => {
        const TestComponent = () => {
          const { navigateTo, history } = useNavigation();
          return (
            <div>
              <button onClick={() => navigateTo(createNavItem({ id: 'item-1' }))}>
                Navigate
              </button>
              <span data-testid="history">{history.length}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        expect(screen.getByTestId('history')).toHaveTextContent('0');

        fireEvent.click(screen.getByText('Navigate'));

        expect(screen.getByTestId('history')).toHaveTextContent('1');
      });

      it('removes duplicate from history and adds to front', () => {
        const TestComponent = () => {
          const { navigateTo, history } = useNavigation();
          const item = createNavItem({ id: 'same-item' });
          return (
            <div>
              <button onClick={() => navigateTo(item)}>Navigate Same</button>
              <button onClick={() => navigateTo(createNavItem({ id: 'other' }))}>Navigate Other</button>
              <span data-testid="history">{history.length}</span>
              <span data-testid="first-id">{history[0]?.item.id || 'none'}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Navigate Same'));
        fireEvent.click(screen.getByText('Navigate Other'));
        fireEvent.click(screen.getByText('Navigate Same'));

        // Should have 2 items (no duplicate)
        expect(screen.getByTestId('history')).toHaveTextContent('2');
        // Most recent (same-item) should be first
        expect(screen.getByTestId('first-id')).toHaveTextContent('same-item');
      });

      it('limits history to maxHistoryEntries', () => {
        const TestComponent = () => {
          const { navigateTo, history } = useNavigation();
          return (
            <div>
              <button onClick={() => {
                for (let i = 0; i < 25; i++) {
                  navigateTo(createNavItem({ id: `item-${i}` }));
                }
              }}>
                Navigate Many
              </button>
              <span data-testid="history">{history.length}</span>
            </div>
          );
        };

        render(
          <NavigationProvider maxHistoryEntries={20}>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Navigate Many'));

        expect(screen.getByTestId('history')).toHaveTextContent('20');
      });

      it('updates breadcrumbs', () => {
        const TestComponent = () => {
          const { navigateTo, breadcrumbs } = useNavigation();
          return (
            <div>
              <button onClick={() => navigateTo(createNavItem({ label: 'Dashboard' }))}>
                Navigate
              </button>
              <span data-testid="breadcrumbs">{breadcrumbs.length}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Navigate'));

        expect(screen.getByTestId('breadcrumbs')).toHaveTextContent('1');
      });
    });

    describe('setUserRole', () => {
      it('updates user role', () => {
        const TestComponent = () => {
          const { setUserRole, userRole } = useNavigation();
          return (
            <div>
              <button onClick={() => setUserRole('Administrator')}>Set Admin</button>
              <span data-testid="role">{userRole || 'none'}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Set Admin'));

        expect(screen.getByTestId('role')).toHaveTextContent('Administrator');
      });

      it('can set role to null', () => {
        const TestComponent = () => {
          const { setUserRole, userRole } = useNavigation();
          return (
            <div>
              <button onClick={() => setUserRole('Attorney')}>Set Attorney</button>
              <button onClick={() => setUserRole(null)}>Clear</button>
              <span data-testid="role">{userRole || 'none'}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Set Attorney'));
        expect(screen.getByTestId('role')).toHaveTextContent('Attorney');

        fireEvent.click(screen.getByText('Clear'));
        expect(screen.getByTestId('role')).toHaveTextContent('none');
      });
    });

    describe('Sidebar Actions', () => {
      it('toggleSidebar toggles state', () => {
        const TestComponent = () => {
          const { toggleSidebar, isSidebarOpen } = useNavigation();
          return (
            <div>
              <button onClick={toggleSidebar}>Toggle</button>
              <span data-testid="open">{isSidebarOpen.toString()}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        expect(screen.getByTestId('open')).toHaveTextContent('false');

        fireEvent.click(screen.getByText('Toggle'));
        expect(screen.getByTestId('open')).toHaveTextContent('true');

        fireEvent.click(screen.getByText('Toggle'));
        expect(screen.getByTestId('open')).toHaveTextContent('false');
      });

      it('setSidebarOpen sets specific state', () => {
        const TestComponent = () => {
          const { setSidebarOpen, isSidebarOpen } = useNavigation();
          return (
            <div>
              <button onClick={() => setSidebarOpen(true)}>Open</button>
              <button onClick={() => setSidebarOpen(false)}>Close</button>
              <span data-testid="open">{isSidebarOpen.toString()}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Open'));
        expect(screen.getByTestId('open')).toHaveTextContent('true');

        fireEvent.click(screen.getByText('Close'));
        expect(screen.getByTestId('open')).toHaveTextContent('false');
      });
    });

    describe('Command Palette Actions', () => {
      it('toggleCommandPalette toggles state', () => {
        const TestComponent = () => {
          const { toggleCommandPalette, isCommandPaletteOpen } = useNavigation();
          return (
            <div>
              <button onClick={toggleCommandPalette}>Toggle</button>
              <span data-testid="open">{isCommandPaletteOpen.toString()}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        expect(screen.getByTestId('open')).toHaveTextContent('false');

        fireEvent.click(screen.getByText('Toggle'));
        expect(screen.getByTestId('open')).toHaveTextContent('true');
      });

      it('setCommandPaletteOpen sets specific state', () => {
        const TestComponent = () => {
          const { setCommandPaletteOpen, isCommandPaletteOpen } = useNavigation();
          return (
            <div>
              <button onClick={() => setCommandPaletteOpen(true)}>Open</button>
              <span data-testid="open">{isCommandPaletteOpen.toString()}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Open'));
        expect(screen.getByTestId('open')).toHaveTextContent('true');
      });
    });

    describe('Breadcrumb Actions', () => {
      it('setBreadcrumbs replaces breadcrumbs', () => {
        const TestComponent = () => {
          const { setBreadcrumbs, breadcrumbs } = useNavigation();
          return (
            <div>
              <button onClick={() => setBreadcrumbs([
                { id: 'b1', label: 'Home', path: '/' },
                { id: 'b2', label: 'Dashboard', path: '/dashboard' },
              ])}>
                Set
              </button>
              <span data-testid="count">{breadcrumbs.length}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Set'));
        expect(screen.getByTestId('count')).toHaveTextContent('2');
      });

      it('addBreadcrumb appends to trail', () => {
        const TestComponent = () => {
          const { addBreadcrumb, breadcrumbs } = useNavigation();
          return (
            <div>
              <button onClick={() => addBreadcrumb({ id: 'b1', label: 'Home', path: '/' })}>
                Add
              </button>
              <span data-testid="count">{breadcrumbs.length}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Add'));
        fireEvent.click(screen.getByText('Add'));

        expect(screen.getByTestId('count')).toHaveTextContent('2');
      });
    });

    describe('History Actions', () => {
      it('clearHistory clears all history', () => {
        const TestComponent = () => {
          const { navigateTo, clearHistory, history } = useNavigation();
          return (
            <div>
              <button onClick={() => navigateTo(createNavItem())}>Navigate</button>
              <button onClick={clearHistory}>Clear</button>
              <span data-testid="count">{history.length}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Navigate'));
        expect(screen.getByTestId('count')).toHaveTextContent('1');

        fireEvent.click(screen.getByText('Clear'));
        expect(screen.getByTestId('count')).toHaveTextContent('0');
      });

      it('getRecentItems returns limited history', () => {
        const TestComponent = () => {
          const { navigateTo, getRecentItems } = useNavigation();
          return (
            <div>
              <button onClick={() => {
                for (let i = 0; i < 15; i++) {
                  navigateTo(createNavItem({ id: `item-${i}` }));
                }
              }}>
                Navigate Many
              </button>
              <span data-testid="recent-5">{getRecentItems(5).length}</span>
              <span data-testid="recent-10">{getRecentItems(10).length}</span>
            </div>
          );
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        fireEvent.click(screen.getByText('Navigate Many'));

        expect(screen.getByTestId('recent-5')).toHaveTextContent('5');
        expect(screen.getByTestId('recent-10')).toHaveTextContent('10');
      });
    });

    describe('Access Control', () => {
      it('hasAccess returns true for items without role restrictions', () => {
        const TestComponent = () => {
          const { hasAccess } = useNavigation();
          const item = createNavItem({ allowedRoles: undefined });
          return <span data-testid="access">{hasAccess(item).toString()}</span>;
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        expect(screen.getByTestId('access')).toHaveTextContent('true');
      });

      it('hasAccess returns true for items with empty allowedRoles', () => {
        const TestComponent = () => {
          const { hasAccess } = useNavigation();
          const item = createNavItem({ allowedRoles: [] });
          return <span data-testid="access">{hasAccess(item).toString()}</span>;
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        expect(screen.getByTestId('access')).toHaveTextContent('true');
      });

      it('hasAccess returns false when user has no role', () => {
        const TestComponent = () => {
          const { hasAccess } = useNavigation();
          const item = createNavItem({ allowedRoles: ['Administrator' as UserRole] });
          return <span data-testid="access">{hasAccess(item).toString()}</span>;
        };

        render(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );

        expect(screen.getByTestId('access')).toHaveTextContent('false');
      });

      it('hasAccess returns true when user role is in allowedRoles', () => {
        const TestComponent = () => {
          const { hasAccess } = useNavigation();
          const item = createNavItem({ allowedRoles: ['Attorney' as UserRole, 'Administrator' as UserRole] });
          return <span data-testid="access">{hasAccess(item).toString()}</span>;
        };

        render(
          <NavigationProvider initialUserRole="Attorney">
            <TestComponent />
          </NavigationProvider>
        );

        expect(screen.getByTestId('access')).toHaveTextContent('true');
      });

      it('hasAccess returns false when user role is not in allowedRoles', () => {
        const TestComponent = () => {
          const { hasAccess } = useNavigation();
          const item = createNavItem({ allowedRoles: ['Administrator' as UserRole] });
          return <span data-testid="access">{hasAccess(item).toString()}</span>;
        };

        render(
          <NavigationProvider initialUserRole="Attorney">
            <TestComponent />
          </NavigationProvider>
        );

        expect(screen.getByTestId('access')).toHaveTextContent('false');
      });
    });
  });

  describe('withNavigationContext HOC', () => {
    it('injects navigation prop', () => {
      const Component = ({ navigation }: { navigation: NavigationContextValue }) => (
        <span data-testid="has-nav">{navigation ? 'yes' : 'no'}</span>
      );

      const WrappedComponent = withNavigationContext(Component);

      render(
        <NavigationProvider>
          <WrappedComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('has-nav')).toHaveTextContent('yes');
    });

    it('passes through other props', () => {
      const Component = ({
        navigation,
        customProp
      }: {
        navigation: NavigationContextValue;
        customProp: string;
      }) => (
        <span data-testid="custom">{customProp}</span>
      );

      const WrappedComponent = withNavigationContext(Component);

      render(
        <NavigationProvider>
          <WrappedComponent customProp="test-value" />
        </NavigationProvider>
      );

      expect(screen.getByTestId('custom')).toHaveTextContent('test-value');
    });
  });
});
