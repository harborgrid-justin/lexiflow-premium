# React Router 7 Migration Guide

This project has been migrated to **React Router 7 in Framework Mode**.

## Key Changes

1.  **Vite Configuration**: Updated `vite.config.ts` to use `@react-router/dev/vite` plugin.
2.  **Entry Points**:
    - `src/entry.client.tsx`: Handles client-side hydration.
    - `src/entry.server.tsx`: Handles Server-Side Rendering (SSR) and streaming.
    - Legacy files (`index.html`, `App.tsx`, `index.tsx`) have been renamed to `.bak`.
3.  **Routing**:
    - Routes are defined in `src/routes.ts` (Config-Based Routing).
    - Route modules are located in `src/routes/`.
4.  **Data Fetching**:
    - Data fetching has been moved from `useEffect` to **Loaders**.
    - `src/routes/case-detail.tsx` demonstrates **Parallel Fetching** and **Streaming** using `Suspense` and `Await`.
    - `useCaseDetail` hook and `CaseDetailPage` component have been updated to accept pre-loaded data (Hydration).

## Development

To run the development server:

```bash
npm run dev
```

## Type Generation

React Router 7 automatically generates types for your routes.
To generate types manually (if not running dev server):

```bash
npx react-router typegen
```

## Next Steps

1.  **Migrate Remaining Modules**:
    - Add remaining feature modules (Docket, Discovery, etc.) to `src/routes.ts`.
    - Create route modules in `src/routes/` for each feature.
    - Refactor components to accept initial data from loaders.
2.  **Refactor CaseManagement**:
    - Update `src/features/cases/components/list/CaseManagement.tsx` to accept `initialCases`.
    - Update `src/routes/cases.tsx` to fetch cases in the loader.
3.  **Form Actions**:
    - Migrate form submissions to React Router **Actions** (`action` export in route modules).

## Reference

- [React Router 7 Documentation](https://reactrouter.com/v7)
