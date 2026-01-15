/**
 * ================================================================================
 * ROUTE PROVIDER INTEGRATION EXAMPLES
 * ================================================================================
 *
 * This file demonstrates how routes should integrate with providers from
 * /workspaces/lexiflow-premium/frontend/src/providers/
 *
 * ARCHITECTURE OVERVIEW:
 * ----------------------
 * 1. Infrastructure Layer (RootLayout)    → Theme, Config, Session
 * 2. Application Layer (ApplicationLayer) → Auth, User, Entitlements, Role, Flags, Layout, State
 * 3. Domain Layer (Route-specific)        → BillingProvider, CaseListProvider, etc.
 *
 * PROVIDER ACCESS PATTERN:
 * ------------------------
 * Routes access providers via centralized hooks from '@/hooks/provider-hooks'
 *
 * @module docs/ROUTE_PROVIDER_INTEGRATION_EXAMPLES
 */


// ============================================================================
// EXAMPLE 1: ADMIN ROUTE WITH ROLE + PERMISSIONS
// ============================================================================

/**
 * Admin route demonstrating:
 * - Role-based access control
 * - Permission checks
 * - Feature flags
 */
import { useAuth, useFlagsState, usePermissions, useRoleState } from '@/hooks/provider-hooks';

export function AdminDashboardExample() {
  // Access auth state
  const { user, isAuthenticated } = useAuth();

  // Access role checks
  const { role, hasRole, isAtLeast } = useRoleState();

  // Access feature flags
  const { flags, isEnabled } = useFlagsState();

  // Or use combined permissions hook
  const { hasPermission } = usePermissions();

  // Guard: Require authentication
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  // Guard: Require admin role
  if (!hasRole('admin')) {
    return <div>Access denied. Admin role required.</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <p>Your role: {role}</p>

      {/* Conditional features based on flags */}
      {isEnabled('adminTools') && (
        <section>
          <h2>Admin Tools</h2>
          {hasPermission('admin.users.write') && <button>Manage Users</button>}
          {hasPermission('admin.settings.write') && <button>System Settings</button>}
        </section>
      )}

      {/* Hierarchical role check */}
      {isAtLeast('manager') && (
        <section>
          <h2>Manager+ Features</h2>
          <p>All managers and above can see this</p>
        </section>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: DASHBOARD WITH USER PREFERENCES
// ============================================================================

/**
 * Dashboard demonstrating:
 * - User profile access
 * - Global app state (bookmarks, recent items)
 * - Layout coordination
 */
import { useAuthUser, useGlobalState, useLayout, useTheme } from '@/hooks/provider-hooks';

export function DashboardExample() {
  // Combined auth + user hook
  const { user, profile, preferences, updatePreferences } = useAuthUser();

  // Global app state
  const { bookmarks, recentItems } = useGlobalState();

  // Layout state
  const { sidebarCollapsed, toggleSidebarCollapsed } = useLayout();

  // Theme
  const { theme, mode, setMode } = useTheme();

  const handleToggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={sidebarCollapsed ? 'full-width' : 'with-sidebar'}>
      <header>
        <h1>Welcome, {profile?.firstName || user?.email}</h1>
        <button onClick={handleToggleTheme}>
          Theme: {mode} ({theme.colors.primary})
        </button>
        <button onClick={toggleSidebarCollapsed}>
          {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
        </button>
      </header>

      <section>
        <h2>Recent Items</h2>
        <ul>
          {recentItems.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Bookmarks</h2>
        <ul>
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id}>{bookmark.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Preferences</h2>
        <label>
          <input
            type="checkbox"
            checked={preferences?.emailNotifications ?? true}
            onChange={(e) =>
              updatePreferences({ emailNotifications: e.target.checked })
            }
          />
          Email Notifications
        </label>
      </section>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: FEATURE-GATED COMPONENT
// ============================================================================

/**
 * Component demonstrating:
 * - Feature flag checks
 * - Entitlement checks
 * - Permission-based rendering
 */
import { useEntitlements } from '@/hooks/provider-hooks';

export function AIAssistantFeatureExample() {
  // Feature flags
  const { isEnabled } = useFlagsState();

  // Entitlements (plan-based features)
  const { entitlements, hasPermission } = useEntitlements();

  // Check if AI feature is enabled
  if (!isEnabled('aiAssistant')) {
    return null; // Feature disabled
  }

  // Check if user's plan allows AI
  if (!entitlements.canUseAdminTools) {
    return (
      <div>
        <p>AI Assistant is only available on Pro plans and above.</p>
        <button>Upgrade Now</button>
      </div>
    );
  }

  // Check specific permission
  if (!hasPermission('ai.assistant.use')) {
    return <div>You don't have permission to use AI Assistant</div>;
  }

  return (
    <div>
      <h2>AI Assistant</h2>
      <p>Plan: {entitlements.plan}</p>
      {/* AI assistant UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: CASE DETAIL WITH ROLE-BASED ACTIONS
// ============================================================================

/**
 * Case detail demonstrating:
 * - Multiple provider integration
 * - Role-based action buttons
 * - Permission-gated features
 */

export function CaseDetailExample({ caseId }: { caseId: string }) {
  // Combined permissions hook
  const { hasPermission, hasRole, isAtLeast } = usePermissions();

  // Feature flags
  const { isEnabled } = useFlagsState();

  // Layout state (for responsive actions)
  const { sidebarOpen } = useLayout();

  return (
    <div>
      <header>
        <h1>Case #{caseId}</h1>

        <div className="actions">
          {/* Basic viewing - all authenticated users */}
          <button>View Documents</button>

          {/* Editing - requires write permission */}
          {hasPermission('cases.write') && (
            <>
              <button>Edit Case</button>
              <button>Add Note</button>
            </>
          )}

          {/* Attorney-only features */}
          {hasRole('attorney') && (
            <button>Legal Analysis</button>
          )}

          {/* Manager+ features */}
          {isAtLeast('manager') && (
            <>
              <button>Assign Attorney</button>
              <button>Close Case</button>
            </>
          )}

          {/* Admin-only features */}
          {hasRole('admin') && (
            <button>Delete Case</button>
          )}
        </div>
      </header>

      <main className={sidebarOpen ? 'with-sidebar' : 'full-width'}>
        {/* Case content */}

        {/* AI features */}
        {isEnabled('aiAssistant') && hasPermission('ai.assistant.use') && (
          <aside>
            <h3>AI Insights</h3>
            {/* AI-powered analysis */}
          </aside>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: SETTINGS PAGE WITH STATE PERSISTENCE
// ============================================================================

/**
 * Settings demonstrating:
 * - User preferences
 * - Global state actions
 * - Theme customization
 * - Layout preferences
 */
import {
  useGlobalStateActions
} from '@/hooks/provider-hooks';

export function SettingsExample() {
  // User state
  const { profile, preferences, updateProfile, updatePreferences } = useAuthUser();

  // Global state actions
  const { updatePreferences: updateGlobalPrefs } = useGlobalStateActions();

  // Theme
  const { mode, setMode, colors } = useTheme();

  // Layout
  const { sidebarCollapsed, toggleSidebarCollapsed } = useLayout();

  return (
    <div>
      <h1>Settings</h1>

      <section>
        <h2>Profile</h2>
        <input
          type="text"
          value={profile?.firstName || ''}
          onChange={(e) => updateProfile({ firstName: e.target.value })}
          placeholder="First Name"
        />
      </section>

      <section>
        <h2>Theme</h2>
        <label>
          <input
            type="radio"
            checked={mode === 'light'}
            onChange={() => setMode('light')}
          />
          Light
        </label>
        <label>
          <input
            type="radio"
            checked={mode === 'dark'}
            onChange={() => setMode('dark')}
          />
          Dark
        </label>
        <div>Primary Color: {colors.primary}</div>
      </section>

      <section>
        <h2>Layout</h2>
        <label>
          <input
            type="checkbox"
            checked={sidebarCollapsed}
            onChange={toggleSidebarCollapsed}
          />
          Collapse sidebar by default
        </label>
      </section>

      <section>
        <h2>Notifications</h2>
        <label>
          <input
            type="checkbox"
            checked={preferences?.emailNotifications ?? true}
            onChange={(e) =>
              updatePreferences({ emailNotifications: e.target.checked })
            }
          />
          Email notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={preferences?.pushNotifications ?? false}
            onChange={(e) =>
              updatePreferences({ pushNotifications: e.target.checked })
            }
          />
          Push notifications
        </label>
      </section>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: PROTECTED ROUTE LOADER
// ============================================================================

/**
 * Loader demonstrating:
 * - Auth guards in loaders
 * - Role checks before data loading
 * - Redirect patterns
 */
import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';

/**
 * IMPORTANT: Loaders run BEFORE providers are available
 * Use utility functions from @/utils/route-guards instead
 */
import { DataService } from '@/services/data/data-service.service';
import { requireAuthLoader } from '@/utils/route-guards';

// Simple auth guard
export const adminLoader = requireAuthLoader;

// Complex loader with data fetching
export async function protectedLoader({ request }: LoaderFunctionArgs) {
  // Check authentication
  const user = getCurrentUser(); // From utils/route-guards

  if (!user) {
    throw redirect('/auth/login');
  }

  // Check role (example)
  if (user.role !== 'admin') {
    throw redirect('/dashboard?error=unauthorized');
  }

  // Fetch data
  const data = await DataService.admin.getUsers();

  return { data, user };
}

/**
 * In the route component, you can then access providers normally:
 */
export function ProtectedRouteExample() {
  const { user } = useAuth(); // Now available
  const { hasRole } = useRoleState();

  // Additional client-side checks
  if (!hasRole('admin')) {
    return <div>Access denied</div>;
  }

  return <div>Admin content</div>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Mock function - use real implementation from @/utils/route-guards
 */
function getCurrentUser() {
  const userJson = localStorage.getItem('lexiflow-current-user');
  return userJson ? JSON.parse(userJson) : null;
}

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * PROVIDER INTEGRATION CHECKLIST:
 * ================================
 *
 * ✅ Infrastructure Providers (Always Available)
 *    - useTheme() for theme/colors
 *    - useConfig() for app config (rare)
 *    - useSession() for session (rare, use useAuth)
 *
 * ✅ Application Providers (Always Available)
 *    - useAuth() / useAuthState() / useAuthActions()
 *    - useUserState() / useUserActions() / useCurrentUser()
 *    - useEntitlements() / useEntitlementsState() / useEntitlementsActions()
 *    - useRoleState() / useRoleActions()
 *    - useFlagsState() / useFlagsActions()
 *    - useLayout()
 *    - useGlobalState() / useGlobalStateActions()
 *
 * ✅ Domain Providers (Route-Specific)
 *    - useBilling() - in /routes/billing/
 *    - useCases() - in /routes/cases/
 *    - useCRM() - in /routes/crm/
 *    - etc.
 *
 * ✅ Convenience Hooks
 *    - useAuthUser() - combines auth + user
 *    - usePermissions() - combines entitlements + role
 *
 * ✅ Import Pattern
 *    import { useAuth, useRole, useFlags } from '@/hooks/provider-hooks';
 *    // NOT: import { useAuth } from '@/providers/application/authprovider';
 *
 * ✅ Loader Pattern
 *    - Use route-guards utilities, NOT hooks
 *    - Loaders run before providers are available
 *    - Use requireAuthLoader or getCurrentUser()
 *
 * ✅ Component Pattern
 *    - Access providers via hooks
 *    - Split contexts for performance
 *    - Conditional rendering based on permissions/flags/roles
 *    - Coordinate with layout state
 */
