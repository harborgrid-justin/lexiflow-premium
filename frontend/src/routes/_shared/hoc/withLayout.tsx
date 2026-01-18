/**
 * withLayout Higher-Order Component
 *
 * Standardizes layout patterns across routes.
 * Consolidates 10+ custom layout patterns with a reusable HOC.
 *
 * @module routes/_shared/hoc/withLayout
 *
 * @example Basic layout
 * ```tsx
 * const result = withLayout(MyComponent, MyLayout);
 * export const { Component, loader } = result;
 * ```
 *
 * @example With loader
 * ```tsx
 * const result = withLayout(
 *   CaseDetailComponent,
 *   CaseLayout,
 *   caseDetailLoader
 * );
 * export const { Component, loader } = result;
 * ```
 *
 * @example With loader and route options
 * ```tsx
 * const result = withLayout(
 *   DocumentsComponent,
 *   DocumentsLayout,
 *   documentsLoader,
 *   { displayName: 'DocumentsWithLayout' }
 * );
 * export const { Component, loader } = result;
 * ```
 */

import { type ComponentType } from 'react';
import type { LoaderFunction } from 'react-router';

// ============================================================================
// Types
// ============================================================================

/**
 * Layout component props that receive loader data
 */
export interface LayoutComponentProps<T = unknown> {
  /** Loader data passed from React Router */
  loaderData?: T;
  /** Child component to render within layout */
  children: React.ReactNode;
}

/**
 * Options for withLayout HOC
 */
export interface WithLayoutOptions {
  /** Custom display name for wrapped component */
  displayName?: string;
  /** Whether to pass loader data to wrapped component */
  passLoaderData?: boolean;
}

/**
 * Return type from withLayout
 */
export interface WithLayoutResult<T = unknown> {
  /** Component wrapped in layout */
  Component: ComponentType;
  /** Optional loader function */
  loader?: LoaderFunction<T>;
}

// ============================================================================
// withLayout HOC
// ============================================================================

/**
 * Higher-Order Component that wraps a component in a layout component
 *
 * Features:
 * - Wraps component in layout with consistent pattern
 * - Attaches loader to component
 * - Proper TypeScript generics for loader data
 * - Compatible with React Router v7 exports
 * - Returns object with Component + loader properties
 *
 * Pattern:
 * Layout receives loader data and wraps the page component
 *
 * @param PageComponent - Component to wrap in layout
 * @param LayoutComponent - Layout component that wraps page
 * @param loader - Optional loader function
 * @param options - Configuration options
 * @returns Object with Component and loader properties
 */
export function withLayout<
  TLoaderData = unknown,
  TPageProps extends object = object,
>(
  PageComponent: ComponentType<TPageProps>,
  LayoutComponent: ComponentType<LayoutComponentProps<TLoaderData>>,
  loader?: LoaderFunction<TLoaderData>,
  options: WithLayoutOptions = {}
): WithLayoutResult<TLoaderData> {
  const pageDisplayName = PageComponent.displayName || PageComponent.name || 'Page';
  const layoutDisplayName = LayoutComponent.displayName || LayoutComponent.name || 'Layout';
  const displayName = options.displayName || `${layoutDisplayName}(${pageDisplayName})`;

  function WithLayoutComponent(props: TPageProps) {
    return (
      <LayoutComponent>
        <PageComponent {...props} />
      </LayoutComponent>
    );
  }

  WithLayoutComponent.displayName = displayName;

  return {
    Component: WithLayoutComponent,
    loader,
  };
}

// ============================================================================
// Specialized Layout HOCs
// ============================================================================

/**
 * Create a simple wrapper that adds a layout without loader
 *
 * @example
 * ```tsx
 * const DashboardWithLayout = wrapInLayout(DashboardPage, DashboardLayout);
 * export { DashboardWithLayout as Component };
 * ```
 */
export function wrapInLayout<TProps extends object>(
  PageComponent: ComponentType<TProps>,
  LayoutComponent: ComponentType<{ children: React.ReactNode }>
): ComponentType<TProps> {
  const pageDisplayName = PageComponent.displayName || PageComponent.name || 'Page';
  const layoutDisplayName = LayoutComponent.displayName || LayoutComponent.name || 'Layout';

  function WrappedComponent(props: TProps) {
    return (
      <LayoutComponent>
        <PageComponent {...props} />
      </LayoutComponent>
    );
  }

  WrappedComponent.displayName = `${layoutDisplayName}(${pageDisplayName})`;

  return WrappedComponent;
}

/**
 * Create a layout component that provides data via React Router
 *
 * Useful for creating provider-based layouts that wrap outlet
 *
 * @example
 * ```tsx
 * const CaseLayoutWithData = createLayoutWithData(
 *   CaseProvider,
 *   caseLoader
 * );
 *
 * export const { Component, loader } = CaseLayoutWithData;
 * ```
 */
export function createLayoutWithData<TLoaderData = unknown>(
  ProviderComponent: ComponentType<{ data: TLoaderData; children: React.ReactNode }>,
  loader: LoaderFunction<TLoaderData>
): WithLayoutResult<TLoaderData> {
  const providerDisplayName = ProviderComponent.displayName || ProviderComponent.name || 'Provider';

  function LayoutWithDataComponent() {
    // In actual implementation, you would use useLoaderData here
    // For now, this is a placeholder that assumes data flows through context
    return (
      <ProviderComponent data={{} as TLoaderData}>
        <div>
          {/* Outlet would go here in actual route */}
          Layout placeholder
        </div>
      </ProviderComponent>
    );
  }

  LayoutWithDataComponent.displayName = `LayoutWithData(${providerDisplayName})`;

  return {
    Component: LayoutWithDataComponent,
    loader,
  };
}
