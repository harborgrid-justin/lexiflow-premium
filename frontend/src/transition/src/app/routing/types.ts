/**
 * Route Type Definitions
 */

import type { ReactNode } from "react";

export interface RouteConfig {
  path: string;
  element: ReactNode;
  public?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}
