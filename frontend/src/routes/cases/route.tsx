/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import CaseDetailLayout from './CaseDetailLayout';
import CaseListLayout from './CaseListLayout';
import CaseListView from './CaseListView';
import { caseDetailLoader } from './detail-loader';
import { ErrorBoundary } from './errors';
import { clientLoader as listLoader } from './loader';

/**
 * Cases Route Configuration
 *
 * Defines the case management module with:
 * - Nested layouts (List vs Detail)
 * - Parallel data loading
 * - Type-safe loaders
 */
export const casesRoute = {
  path: "cases",
  errorElement: <ErrorBoundary />,
  children: [
    {
      element: <CaseListLayout />,
      loader: listLoader,
      children: [
        {
          index: true,
          element: <CaseListView />,
        },
      ],
    },
    {
      path: "create",
      lazy: () => import("./create"),
    },
    {
      path: ":caseId",
      element: <CaseDetailLayout />,
      loader: caseDetailLoader,
      children: [
        {
          index: true,
          lazy: () => import("./overview"),
        },
        {
          path: "overview",
          lazy: () => import("./overview"),
        },
        {
          path: "calendar",
          lazy: () => import("./calendar"),
        },
        {
          path: "analytics",
          lazy: () => import("./analytics"),
        },
        {
          path: "operations",
          lazy: () => import("./operations"),
        },
        {
          path: "insights",
          lazy: () => import("./insights"),
        },
        {
          path: "financials",
          lazy: () => import("./financials"),
        },
        {
          path: "parties",
          lazy: () => import("./parties"),
        },
        {
          path: "timeline",
          lazy: () => import("./timeline"),
        },
        {
          path: "documents",
          lazy: () => import("./documents"),
        },
        {
          path: "strategy",
          lazy: () => import("./strategy"),
        },
        {
          path: "discovery",
          lazy: () => import("./discovery"),
        },
        {
          path: "evidence",
          lazy: () => import("./evidence"),
        },
        {
          path: "workflow",
          lazy: () => import("./workflow"),
        },
        {
          path: "projects",
          lazy: () => import("./projects"),
        }
      ]
    }
  ],
};
