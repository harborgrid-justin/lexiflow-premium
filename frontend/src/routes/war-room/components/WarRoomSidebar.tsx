/**
 * @module components/war-room/WarRoomSidebar
 * @category WarRoom
 * @description Sidebar for the War Room, displaying quick access links and case logistics.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors for backgrounds,
 * text, and borders, ensuring a consistent look in both light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Target, Gavel } from "lucide-react";
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { cn } from '@/lib/cn';
import { useTheme } from "@/providers";

// Utils & Constants

// Types
import type { Case } from "@/types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface WarRoomSidebarProps {
  /** The case data object containing details for the sidebar. */
  caseData?: Case;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const WarRoomSidebar: React.FC<WarRoomSidebarProps> = ({ caseData }) => {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Loading state when case data is not yet available
  if (!caseData) {
    return (
      <div
        className={cn(
          "w-64 border-r hidden md:block",
          theme.surface.highlight,
          theme.border.default,
        )}
      >
        <div className="p-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div
      className={cn(
        "w-64 border-r hidden md:block",
        theme.surface.highlight,
        theme.border.default,
      )}
    >
      <div className="p-4">
        <h3
          className={cn(
            "px-2 text-sm font-semibold uppercase tracking-wide mb-2",
            theme.text.secondary,
          )}
        >
          Quick Access
        </h3>
        <div className="space-y-1 mt-2">
          <a
            href="#"
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded text-sm font-medium border shadow-sm transition-all",
              theme.text.primary,
              theme.surface.default,
              theme.border.default,
              "hover:shadow-md",
              theme.primary.border,
            )}
          >
            <span className="flex items-center">
              <Gavel className={cn("h-4 w-4 mr-2", theme.primary.text)} /> Judge
              Profile
            </span>
          </a>
          <a
            href="#"
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-all",
              theme.text.secondary,
              `hover:${theme.surface.default} hover:shadow-sm`,
            )}
          >
            <span className="flex items-center">
              <Target className="h-4 w-4 mr-2" /> Opposing Counsel
            </span>
          </a>
        </div>
      </div>

      <div className={cn("p-4 border-t", theme.border.default)}>
        <h3
          className={cn(
            "px-2 text-sm font-semibold uppercase tracking-wide mb-2",
            theme.text.secondary,
          )}
        >
          Logistics
        </h3>
        <div
          className={cn("space-y-3 text-sm px-2 mt-2", theme.text.secondary)}
        >
          <p className="break-words">
            <strong>Court:</strong> {caseData.court}
          </p>
          <p>
            <strong>Judge:</strong> {caseData.judge}
          </p>
          <p>
            <strong>Clerk:</strong> {caseData.magistrateJudge || "Unassigned"}
          </p>
          <p className={cn("text-xs mt-2 italic", theme.text.tertiary)}>
            Wireless creds unavailable.
          </p>
        </div>
      </div>
    </div>
  );
};
