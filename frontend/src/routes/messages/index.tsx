/**
 * Secure Messenger Route
 *
 * Secure messaging system for client and team communication with:
 * - Server-side data loading via loader
 * - Real-time message updates
 * - Thread management
 * - Attachment handling
 *
 * @module routes/messages/index
 */

import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  const unreadCount = data?.unreadCount || 0;
  const title = unreadCount > 0
    ? `(${unreadCount}) Secure Messenger - LexiFlow`
    : 'Secure Messenger - LexiFlow';

  return createMeta({
    title: 'Secure Messenger',
    description: 'Encrypted messaging for confidential client and team communication',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Implement message fetching
  // const [conversations, unreadCount] = await Promise.all([
  //   api.messages.getConversations(),
  //   api.messages.getUnreadCount(),
  // ]);

  return {
    conversations: [],
    unreadCount: 0,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "send-message":
      // TODO: Handle message sending
      return { success: true, message: "Message sent" };

    case "mark-read":
      // TODO: Handle marking as read
      return { success: true };

    case "archive":
      // TODO: Handle conversation archival
      return { success: true };

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function MessagesIndexRoute({ loaderData }: Route.ComponentProps) {
  const { conversations, unreadCount } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Secure Messenger
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Encrypted messaging for confidential communication
          </p>
        </div>

        <Link
          to="/messages/compose"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Message
        </Link>
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Placeholder Content */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Messenger Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Secure messaging features coming soon.
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {conversations.length} conversations
        </p>
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
      title="Failed to Load Messages"
      message="We couldn't load your messages. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
