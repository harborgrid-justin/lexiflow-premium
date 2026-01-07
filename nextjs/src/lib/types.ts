/**
 * Shared Type Definitions for Next.js 16
 * Enterprise-grade type safety for route parameters and props
 *
 * @see ENTERPRISE GUIDELINES FOR Next.js v16 page.tsx - Guideline 15
 */

/**
 * Standard PageProps for dynamic routes in Next.js 16
 *
 * In Next.js 16, params and searchParams are now Promises
 * that must be awaited before accessing their values.
 *
 * @example
 * ```tsx
 * export default async function Page({ params, searchParams }: PageProps<{ id: string }>) {
 *   const { id } = await params;
 *   const query = await searchParams;
 *   // Use id and query...
 * }
 * ```
 */
export interface PageProps<
  TParams extends Record<string, string | string[]> = Record<string, never>,
  TSearchParams extends Record<string, string | string[] | undefined> = Record<
    string,
    never
  >,
> {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
}

/**
 * Simplified PageProps for pages without search params
 *
 * @example
 * ```tsx
 * export default async function Page({ params }: PagePropsWithParams<{ id: string }>) {
 *   const { id } = await params;
 * }
 * ```
 */
export interface PagePropsWithParams<
  TParams extends Record<string, string | string[]>,
> {
  params: Promise<TParams>;
}

/**
 * Simplified PageProps for pages without dynamic params
 *
 * @example
 * ```tsx
 * export default async function Page({ searchParams }: PagePropsWithSearchParams) {
 *   const query = await searchParams;
 * }
 * ```
 */
export interface PagePropsWithSearchParams<
  TSearchParams extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> {
  searchParams: Promise<TSearchParams>;
}

/**
 * Layout Props for Next.js 16
 * Standard props for layout components
 */
export interface LayoutProps<
  TParams extends Record<string, string | string[]> = Record<string, never>,
> {
  children: React.ReactNode;
  params: Promise<TParams>;
}

/**
 * Error Boundary Props
 * Standard props for error.tsx components
 */
export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
