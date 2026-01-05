/**
 * User Profile Route
 *
 * User profile and settings page with:
 * - Server-side data loading via loader
 * - Profile update actions
 * - Password and security settings
 * - Notification preferences
 *
 * @module routes/profile/index
 */

import { api } from '@/api';
import { Form, Link, useNavigation } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return createMeta({
    title: 'My Profile',
    description: 'Manage your profile, settings, and preferences',
  });
}

// ============================================================================
// Client Loader (client-side only for localStorage auth)
// ============================================================================

export async function clientLoader({ request: _ }: Route.ClientLoaderArgs) {
  try {
    const user = await api.auth.getCurrentUser();

    // Load preferences from localStorage or use defaults
    const storedPrefs = typeof localStorage !== 'undefined' ? localStorage.getItem('user_preferences') : null;
    const preferences = storedPrefs ? JSON.parse(storedPrefs) : {
      notifications: true,
      emailDigest: 'daily',
      theme: 'system',
    };

    return {
      user,
      preferences,
    };
  } catch (error) {
    console.error("Failed to load profile:", error);
    // In a real app, we might redirect to login here
    return {
      user: null,
      preferences: {
        notifications: true,
        emailDigest: 'daily',
        theme: 'system',
      },
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    const user = await api.auth.getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    switch (intent) {
      case "update-profile": {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;

        await api.auth.users.update(user.id, {
          firstName,
          lastName,
          email,
          phone
        });
        return { success: true, message: "Profile updated successfully" };
      }
      case "change-password": {
        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword !== confirmPassword) {
          return { success: false, error: "New passwords do not match" };
        }

        await api.auth.auth.changePassword(currentPassword, newPassword);
        return { success: true, message: "Password changed successfully" };
      }
      case "update-preferences": {
        const notifications = formData.get("notifications") === "on";
        const emailDigest = formData.get("emailDigest") as string;
        const theme = formData.get("theme") as string;

        const preferences = { notifications, emailDigest, theme };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user_preferences', JSON.stringify(preferences));
        }

        return { success: true, message: "Preferences updated successfully" };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error: any) {
    console.error("Action failed:", error);
    return { success: false, error: error.message || "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ProfileIndexRoute({ loaderData }: Route.ComponentProps) {
  const { user, preferences } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile Not Found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
        <Link to="/login" className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar / Navigation */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
              {/* Avatar placeholder */}
              <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {user.role}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Personal Information</h3>
            <Form method="post" className="mt-4 space-y-4">
              <input type="hidden" name="intent" value="update-profile" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    defaultValue={user.firstName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    defaultValue={user.lastName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={user.email}
                  disabled
                  className="mt-1 block w-full cursor-not-allowed rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </Form>
          </div>

          {/* Preferences */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Preferences</h3>
            <Form method="post" className="mt-4 space-y-4">
              <input type="hidden" name="intent" value="update-preferences" />
              <div className="flex items-center justify-between">
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Receive emails about activity</span>
                </span>
                <button
                  type="button"
                  className={`${preferences.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  role="switch"
                  aria-checked={preferences.notifications}
                >
                  <span
                    aria-hidden="true"
                    className={`${preferences.notifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Save Preferences
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Profile"
      message="We couldn't load your profile. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
