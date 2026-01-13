/**
 * War Room Detail Route
 *
 * Displays detailed information for a single war room.
 *
 * @module routes/war-room/detail
 */

import { DataService } from '@/services/data/dataService';
import type { Advisor, Case, Expert, WarRoom } from '@/types';
import { useLoaderData, useNavigate } from 'react-router';
import { useTheme } from '@/features/theme';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/detail";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createDetailMeta({
    entityType: 'War Room',
    entityName: (data as { item: Case } | undefined)?.item?.title,
    entityId: (data as { item: Case } | undefined)?.item?.id,
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: Route.LoaderArgs) {
  const { roomId } = params;

  // CRITICAL: Validate param exists
  if (!roomId) {
    throw new Response("War Room ID is required", { status: 400 });
  }

  try {
    // Fetch case details and related war room data
    const [item, advisors, experts] = await Promise.all([
      DataService.cases.getById(roomId),
      DataService.warRoom.getAdvisors({ caseId: roomId }),
      DataService.warRoom.getExperts({ caseId: roomId })
    ]);

    if (!item) {
      throw new Response("War Room (Case) not found", { status: 404 });
    }

    return { item, advisors, experts };
  } catch (error) {
    console.error("Failed to load war room data", error);
    if (error instanceof Response) throw error;
    throw new Response("War Room not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: Route.ActionArgs) {
  const { roomId } = params;

  if (!roomId) {
    return { success: false, error: "War Room ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "update": {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const status = formData.get("status") as string;

        const updates: Partial<WarRoom> = {
          updatedAt: new Date().toISOString(),
        };

        if (name) updates.name = name;
        if (description) updates.description = description;
        if (status) updates.status = status;

        await DataService.warRoom.update(roomId, updates);
        return { success: true, message: "War room updated successfully" };
      }
      case "delete": {
        await DataService.warRoom.delete(roomId);
        return {
          success: true,
          message: "War room deleted successfully",
          redirect: "/war-room"
        };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch {
    return { success: false, error: "Action failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function WarRoomDetailRoute() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { item, advisors, experts } = useLoaderData() as { item: Case, advisors: Advisor[], experts: Expert[] };

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-sm ${theme.text.secondary} ${theme.interactive.hover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <h1 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>
        War Room: {item.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advisors Section */}
        <div className={`${theme.surface.default} rounded-lg shadow p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>Advisors</h2>
          {advisors && advisors.length > 0 ? (
            <ul className="space-y-3">
              {advisors.map((advisor) => (
                <li key={advisor.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="font-medium text-gray-900 dark:text-white">{advisor.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{advisor.specialty || 'General Advisor'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded text-center text-gray-500 dark:text-gray-400">
              No advisors assigned
            </div>
          )}
        </div>

        {/* Experts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expert Witnesses</h2>
          {experts && experts.length > 0 ? (
            <ul className="space-y-3">
              {experts.map((expert) => (
                <li key={expert.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="font-medium text-gray-900 dark:text-white">{expert.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{expert.expertType}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded text-center text-gray-500 dark:text-gray-400">
              No experts assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Handle 404 specifically
  if (error instanceof Response && error.status === 404) {
    return (
      <NotFoundError
        title="War Room Not Found"
        message="The war room you're looking for doesn't exist."
        backTo="/war-room"
        backLabel="Back to War Rooms"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load War Room"
      message="We couldn't load this war room. Please try again."
      backTo="/war-room"
      backLabel="Back to War Rooms"
    />
  );
}
