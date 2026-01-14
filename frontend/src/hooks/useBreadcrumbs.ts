/**
 * @module hooks/useBreadcrumbs
 * @category Hooks
 * @description Hook to generate breadcrumb navigation based on current route path.
 */

import { ModuleRegistry } from "@/services/infrastructure/module-registry.service";
import type { BreadcrumbItem } from "@/shared/ui/molecules/Breadcrumbs";
import { useMemo } from "react";
import { useLocation, useParams } from "react-router";

/**
 * Generate breadcrumb items from current route
 */
export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  const params = useParams();

  return useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Home/Dashboard
    breadcrumbs.push({
      label: "Dashboard",
      path: "/",
    });

    // Build breadcrumbs from path segments
    let currentPath = "";
    pathSegments.forEach((segment, _index) => {
      currentPath += `/${segment}`;

      // Skip if segment is a param value (like case ID, document ID)
      if (segment.match(/^[0-9a-f-]+$/i) && segment.length > 10) {
        // This looks like an ID, check if we have a param name for it
        const paramKeys = Object.keys(params);
        const paramKey = paramKeys.find((key) => params[key] === segment);

        if (paramKey) {
          // Get a friendly name from the module or use the param key
          const label = paramKey
            .replace(/Id$/, "")
            .replace(/([A-Z])/g, " $1")
            .trim();
          breadcrumbs.push({
            label: `${label.charAt(0).toUpperCase() + label.slice(1)} #${segment.slice(0, 8)}`,
            path: currentPath,
          });
        }
        return;
      }

      // Get module info from registry
      const module = ModuleRegistry.getModule(segment);

      if (module) {
        breadcrumbs.push({
          label: module.label,
          path: currentPath,
        });
      } else {
        // Fallback: Convert kebab-case or snake_case to Title Case
        const label = segment
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        breadcrumbs.push({
          label,
          path: currentPath,
        });
      }
    });

    return breadcrumbs;
  }, [location.pathname, params]);
};
