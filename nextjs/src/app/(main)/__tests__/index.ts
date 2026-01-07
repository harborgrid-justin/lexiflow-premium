/**
 * Enterprise Test Suite Index
 *
 * Central export point for all test utilities and configurations
 * for the (main) route group pages.
 *
 * Test Coverage Summary:
 * =====================
 *
 * Layout & Core Components:
 * - layout.tsx: Main authenticated layout with Sidebar and Header
 * - error.tsx: Error boundary with categorization and recovery
 * - loading.tsx: Loading UI with animations
 *
 * List Pages:
 * - cases/page.tsx: Cases listing with filters
 * - clients/page.tsx: Client management
 * - documents/page.tsx: Document management
 * - tasks/page.tsx: Task management
 *
 * Detail Pages:
 * - cases/[id]/page.tsx: Case detail with tabs
 * - clients/[id]/page.tsx: Client profile with ISR
 *
 * Test Utilities:
 * - test-utils.tsx: Custom render, mock factories, helpers
 * - mocks/api-mocks.ts: API mock implementations
 * - page-test-generator.ts: Reusable test templates
 *
 * @module __tests__
 */

// Export all test utilities
export * from './test-utils';

// Export mock data and implementations
export * from './mocks/api-mocks';

// Export page test generators
export * from './page-test-generator';

/**
 * Test file locations for reference:
 *
 * Core Tests:
 * - __tests__/layout.test.tsx
 * - __tests__/error.test.tsx
 * - __tests__/loading.test.tsx
 *
 * Page Tests:
 * - __tests__/cases/page.test.tsx
 * - __tests__/cases/[id]/page.test.tsx
 * - __tests__/clients/[id]/page.test.tsx
 * - __tests__/tasks/page.test.tsx
 * - __tests__/documents/page.test.tsx
 *
 * Utilities:
 * - __tests__/test-utils.tsx
 * - __tests__/mocks/api-mocks.ts
 * - __tests__/page-test-generator.ts
 */

/**
 * Running Tests:
 *
 * All tests:
 * npm test -- --testPathPattern="src/app/\\(main\\)"
 *
 * Specific page:
 * npm test -- --testPathPattern="cases/page.test"
 *
 * With coverage:
 * npm test -- --coverage --testPathPattern="src/app/\\(main\\)"
 *
 * Watch mode:
 * npm test -- --watch --testPathPattern="src/app/\\(main\\)"
 */
