/**
 * @module utils/discoveryNavigation
 * @category Utils - Discovery
 * @description Discovery navigation utilities for tab hierarchy management.
 * Extracted from DiscoveryNavigation component to break circular dependency
 * with useDiscoveryPlatform hook.
 */

import React from "react";

// ============================================================================
// TYPES
// ============================================================================
export type DiscoveryView =
  | "dashboard"
  | "requests"
  | "privilege"
  | "holds"
  | "plan"
  | "doc_viewer"
  | "response"
  | "production_wizard"
  | "productions"
  | "depositions"
  | "esi"
  | "interviews"
  | "custodians"
  | "examinations"
  | "collections"
  | "processing"
  | "review"
  | "timeline";

export interface DiscoverySubTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DiscoveryParentTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subTabs: DiscoverySubTab[];
}

// ============================================================================
// CONSTANTS - Placeholder icons for pure utility module
// ============================================================================
// Note: Actual icons are used in DiscoveryNavigation.tsx component
// This constant provides the structure without React component dependencies

export const PARENT_TAB_CONFIG = [
  {
    id: "dashboard_parent",
    label: "Dashboard",
    subTabs: [{ id: "dashboard", label: "Overview" }],
  },
  {
    id: "collection",
    label: "Collection",
    subTabs: [
      { id: "esi", label: "ESI Map" },
      { id: "custodians", label: "Custodians" },
      { id: "interviews", label: "Interviews" },
      { id: "holds", label: "Legal Holds" },
    ],
  },
  {
    id: "review",
    label: "Review & Production",
    subTabs: [
      { id: "requests", label: "Requests" },
      { id: "productions", label: "Productions" },
      { id: "privilege", label: "Privilege Log" },
    ],
  },
  {
    id: "proceedings",
    label: "Proceedings",
    subTabs: [
      { id: "depositions", label: "Depositions" },
      { id: "examinations", label: "Examinations" },
      { id: "plan", label: "Discovery Plan" },
    ],
  },
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the parent tab configuration for a given view
 * @param view - The current discovery view
 * @returns The parent tab containing this view, or the dashboard parent as default
 */
export const getParentTabForView = (
  view: DiscoveryView
): (typeof PARENT_TAB_CONFIG)[number] => {
  return (
    PARENT_TAB_CONFIG.find((p) => p.subTabs.some((s) => s.id === view)) ||
    PARENT_TAB_CONFIG[0]
  );
};

/**
 * Gets the first sub-tab ID for a given parent tab
 * @param parentId - The parent tab ID
 * @returns The first sub-tab ID, or 'dashboard' as default
 */
export const getFirstTabOfParent = (parentId: string): DiscoveryView => {
  const parent = PARENT_TAB_CONFIG.find((p) => p.id === parentId);
  return parent && parent.subTabs.length > 0
    ? (parent.subTabs[0].id as DiscoveryView)
    : "dashboard";
};

/**
 * Checks if a view is a detail/modal view that should navigate back
 * @param view - The current discovery view
 * @returns True if this is a detail view
 */
export const isDetailView = (view: DiscoveryView): boolean => {
  return ["doc_viewer", "response", "production_wizard"].includes(view);
};
