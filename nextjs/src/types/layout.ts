/**
 * Layout Types - Type-only exports to break circular dependencies
 *
 * This file contains ONLY type definitions to be used in config files.
 * No runtime code, no component imports.
 */

import type { LucideIcon } from "lucide-react";

export interface TabConfigItem {
  id: string;
  label: string;
  icon: LucideIcon;
  subTabs?: TabConfigItem[];
  component?: React.ComponentType<any>;
  path?: string;
}

export interface NavItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string | number;
  children?: NavItemConfig[];
}

export type LayoutType = "shell" | "stack" | "centered" | "tabbed" | "split";
