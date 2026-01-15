/**
 * Theme Settings Route
 *
 * Admin page for managing application theme settings:
 * - Light/Dark mode toggle
 * - Custom theme colors
 * - Brand customization
 *
 * @module routes/admin/theme-settings
 */

import { useTheme } from '@/contexts/ThemeContext';
import { Link, type ActionFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createAdminMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createAdminMeta({
    section: 'Theme Settings',
    description: 'Customize the application appearance and branding',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  return {
    savedTheme: null,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "save-theme": {
      const themeValue = formData.get("theme") as string;
      console.log('Saving theme:', themeValue);
      return { success: true, message: "Theme saved" };
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ThemeSettingsRoute() {
  const { mode, isDark, toggleTheme, setTheme } = useTheme();

  const handleLightMode = () => setTheme('light');
  const handleDarkMode = () => setTheme('dark');

  console.log('Theme mode:', mode, 'isDark:', isDark, 'toggleTheme available:', !!toggleTheme);

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin" className="hover:text-gray-700 dark:hover:text-gray-200">
          Admin
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">Theme Settings</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Theme Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Customize the application appearance and branding
        </p>
      </div>

      {/* Theme Options */}
      <div className="max-w-2xl space-y-6">
        {/* Color Mode Section */}
        <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Color Mode
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Choose between light and dark mode for the application interface.
          </p>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleLightMode}
              className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${mode === 'light'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
            >
              <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Light
              </span>
            </button>

            <button
              type="button"
              onClick={handleDarkMode}
              className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${mode === 'dark'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
            >
              <svg className="h-8 w-8 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Dark
              </span>
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Current mode: <span className="font-medium">{mode}</span>
          </p>
        </div>

        {/* Coming Soon Section */}
        <div style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }} className="rounded-lg border border-dashed p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Custom Branding
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Custom colors, logos, and branding options coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Theme Settings"
      message="We couldn't load the theme settings page."
      backTo="/admin"
      backLabel="Back to Admin"
    />
  );
}
