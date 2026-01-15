/**
 * ================================================================================
 * ROUTE TEMPLATE - COPY THIS FOR NEW ROUTES
 * ================================================================================
 *
 * INSTRUCTIONS:
 * 1. Copy this entire folder structure
 * 2. Replace [Feature] with your feature name (e.g., Reports, Cases, etc.)
 * 3. Implement loader with your data fetching logic
 * 4. Implement action if you need mutations
 * 5. Implement provider with your domain logic
 * 6. Implement view with your presentation logic
 * 7. Export from index.ts for router lazy loading
 *
 * FILES IN THIS TEMPLATE:
 * - loader.ts              # Data fetching
 * - action.ts              # Mutations (optional)
 * - [Feature]Page.tsx      # Orchestration layer
 * - [Feature]Provider.tsx  # Domain context
 * - [Feature]View.tsx      # Pure presentation
 * - index.ts               # Exports for router
 *
 * ================================================================================
 */

/**
 * ============================================================================
 * FILE: loader.ts
 * ============================================================================
 */

import { DataService } from "@/services/data/data-service.service";
import { handleLoaderAuthError } from "@/utils/loader-helpers";
import { defer, type LoaderFunctionArgs } from "react-router";

export interface[Feature]LoaderData {
  // Define your data contract here
  items: unknown[];
  metadata: Record<string, unknown>;
}

export async function loader(args: LoaderFunctionArgs) {
  try {
    // Fetch data in parallel
    const itemsPromise = DataService.[feature].getAll();
    const metadataPromise = DataService.[feature].getMetadata();

    // Option 1: Await all before returning (critical data)
    const [items, metadata] = await Promise.all([
      itemsPromise,
      metadataPromise,
    ]);

    return { items, metadata };

    // Option 2: Defer for streaming (progressive rendering)
    // return defer({
    //   items: itemsPromise,
    //   metadata: metadataPromise,
    // });
  } catch (error) {
    handleLoaderAuthError(error, args);
    return { items: [], metadata: null };
  }
}

export const clientLoader = loader;

/**
 * ============================================================================
 * FILE: action.ts (OPTIONAL - only if you have mutations)
 * ============================================================================
 */

import { DataService } from "@/services/data/data-service.service";
import { redirect, type ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create": {
        const data = Object.fromEntries(formData);
        await DataService.[feature].create(data);
        return redirect("/[feature]");
      }

      case "update": {
        const id = formData.get("id") as string;
        const data = Object.fromEntries(formData);
        await DataService.[feature].update(id, data);
        return { success: true };
      }

      case "delete": {
        const id = formData.get("id") as string;
        await DataService.[feature].delete(id);
        return { success: true };
      }

      default:
        return { error: "Invalid intent" };
    }
  } catch (error) {
    console.error(`[${Feature} Action] Error:`, error);
    return { error: error.message };
  }
}

export const clientAction = action;

/**
 * ============================================================================
 * FILE: [Feature]Page.tsx
 * ============================================================================
 */

import { PageFrame } from "@/layouts/PageFrame";
import React, { Suspense, startTransition } from "react";
import {
  Await,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router";
import { [Feature]Provider } from "./[Feature]Provider";
import { [Feature]View } from "./[Feature]View";
import type { loader } from "./loader";

export function [Feature]Page() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isNavigating = navigation.state !== "idle";

  const handleNavigate = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  return (
    <PageFrame
      title="[Feature Name]"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "[Feature]" }]}
    >
      <Suspense fallback={< [Feature]Skeleton />}>
      {/* If using defer(), wrap in Await */}
      {/* <Await resolve={data.items}> */}
      {/*   {(resolved) => ( */}
      <[Feature]Provider initialData={data}>
      <[Feature]View
      onNavigate={handleNavigate}
      isNavigating={isNavigating}
          />
    </[Feature]Provider >
      {/*   )} */ }
  {/* </Await> */ }
      </Suspense >
    </PageFrame >
  );
}

function [Feature]Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div
        style={{ backgroundColor: "var(--color-surfaceHover)" }}
        className="h-48 rounded-lg"
      />
      <div
        style={{ backgroundColor: "var(--color-surfaceHover)" }}
        className="h-64 rounded-lg"
      />
    </div>
  );
}

export function [Feature]Error() {
  return (
    <PageFrame title="Error">
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-rose-600">
          Failed to load [feature]
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Refresh
        </button>
      </div>
    </PageFrame>
  );
}

/**
 * ============================================================================
 * FILE: [Feature]Provider.tsx
 * ============================================================================
 */

import React, { createContext, useContext, useMemo, useState } from "react";

interface[Feature]ContextValue {
  // State
  items: unknown[];
  selectedItem: unknown | null;

  // Computed
  filteredItems: unknown[];
  itemCount: number;

  // Actions
  selectItem: (id: string) => void;
  filterItems: (query: string) => void;
  refetch: () => void;
}

const [Feature]Context = createContext < [Feature]ContextValue | null > (null);

interface[Feature]ProviderProps {
  children: React.ReactNode;
  initialData: [Feature]LoaderData;
}

export function [Feature]Provider({
  children,
  initialData,
}: [Feature]ProviderProps) {
  const [items] = useState(initialData.items || []);
  const [selectedItem, setSelectedItem] = useState<unknown | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  // Computed state
  const filteredItems = useMemo(() => {
    if (!filterQuery) return items;
    return items.filter((item) =>
      item.name?.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [items, filterQuery]);

  const itemCount = filteredItems.length;

  // Actions
  const selectItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    setSelectedItem(item || null);
  };

  const filterItems = (query: string) => {
    setFilterQuery(query);
  };

  const refetch = () => {
    // Implement refetch logic
  };

  const value: [Feature]ContextValue = {
    items: filteredItems,
    selectedItem,
    filteredItems,
    itemCount,
    selectItem,
    filterItems,
    refetch,
  };

  return (
    < [Feature]Context.Provider value = { value } >
    { children }
    </</[Feature]Context.Provider >
  );
}

export function use[Feature](): [Feature]ContextValue {
  const context = useContext([Feature]Context);
  if (!context) {
    throw new Error("use[Feature] must be used within [Feature]Provider");
  }
  return context;
}

/**
 * ============================================================================
 * FILE: [Feature]View.tsx
 * ============================================================================
 */

import React from "react";
import { use[Feature] } from "./[Feature]Provider";

interface[Feature]ViewProps {
  onNavigate: (path: string) => void;
  isNavigating: boolean;
}

export function [Feature]View({
  onNavigate,
  isNavigating,
}: [Feature]ViewProps) {
  const { items, itemCount, selectItem } = use[Feature]();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p style={{ color: "var(--color-textMuted)" }}>
          {itemCount} items total
        </p>
        <button
          onClick={() => onNavigate("/[feature]/create")}
          disabled={isNavigating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          Create New
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            style={{ backgroundColor: "var(--color-surface)" }}
            className="p-4 rounded-lg cursor-pointer hover:shadow-md transition"
            onClick={() => selectItem(item.id)}
          >
            <h3 className="font-semibold">{item.name}</h3>
            <p
              style={{ color: "var(--color-textMuted)" }}
              className="text-sm"
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * FILE: index.ts
 * ============================================================================
 */

export { loader, clientLoader } from "./loader";
export { action, clientAction } from "./action"; // Optional
export { [Feature]Page as default } from "./[Feature]Page";
export { [Feature]Error as ErrorBoundary } from "./[Feature]Page";

export function meta() {
  return [
    { title: "[Feature] - LexiFlow" },
    { name: "description", content: "[Feature] management" },
  ];
}
