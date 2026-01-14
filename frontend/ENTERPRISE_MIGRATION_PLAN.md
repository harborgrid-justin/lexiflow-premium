# Enterprise React Architecture: Frontend Migration Plan

## Overview

This document outlines the transition of the `frontend/` application to the Enterprise React Architecture Standard. The primary goal is to migrate domain logic from `src/features/` into `src/routes/`, establishing a strictly one-directional data flow with authoritative server loaders.

## I. Architecture Standard

### Core Principles

1.  **Data Flows Down**: Server (Loader) -> Route -> Provider -> View -> UI.
2.  **Events Flow Up**: UI -> Handler -> Router Action -> Server.
3.  **Explicit Boundaries**: Suspense for rendering, ErrorBoundary for failures.
4.  **No "Features" Directory**: Domain logic lives with the Route that owns it.

### Target Route Structure

```
src/routes/[domain]/
├── loader.ts               # Data fetching & contracts (Server-side logic)
├── action.ts               # Mutations (Server-side logic)
├── [Domain]Page.tsx        # Route Component (Suspense/Await shell)
├── [Domain]Provider.tsx    # Feature Context (State & Domain API)
├── [Domain]View.tsx        # Pure Render (Layout & Composition)
└── components/             # Domain-specific sub-components (migrated from features/)
```

## II. Migration Strategy

The migration involves dissolving `src/features/` and moving its contents into the corresponding `src/routes/` directories. Shared logic will be moved to `src/components/common` or `src/lib`.

### Pattern: The "Feature Dissolve"

For each folder in `src/features/[feature]`:

1.  **Components**: Move `features/[feature]/components/*` to `routes/[feature]/components/*`.
2.  **Hooks**: Move `features/[feature]/hooks/*` to `routes/[feature]/_hooks/*` or integrate into `[Domain]Provider`.
3.  **Main Components**: Refactor top-level feature components (e.g., `ProfileOverview`) into the `[Domain]View.tsx` or as sub-components.
4.  **State/Context**: Migrate any Redux/Zustand/Context from `features/` into `[Domain]Provider.tsx`.
5.  **Clean Up**: Delete `src/features/[feature]`.

## III. Domain Mapping & Transition Status

| Feature Domain     | Current Location          | Target Location         | Priority | Status       |
| :----------------- | :------------------------ | :---------------------- | :------- | :----------- |
| **Admin**          | `features/admin`          | `routes/admin`          | High     | **Complete** |
| **Analytics**      | `features/analytics`      | `routes/analytics`      | Medium   | **Complete** |
| **Auth**           | `features/auth`           | `routes/auth`           | Critical | **Complete** |
| **Billing**        | `features/billing`        | `routes/billing`        | High     | **Complete** |
| **Calendar**       | `features/calendar`       | `routes/calendar`       | Medium   | **Complete** |
| **Cases**          | `features/cases`          | `routes/cases`          | Critical | **Complete** |
| **Correspondence** | `features/correspondence` | `routes/correspondence` | Low      | **Complete** |
| **Dashboard**      | `features/dashboard`      | `routes/dashboard`      | High     | **Complete** |
| **Discovery**      | `features/discovery`      | `routes/discovery`      | Medium   | **Complete** |
| **Docket**         | `features/docket`         | `routes/docket`         | High     | **Complete** |
| **Documents**      | `features/documents`      | `routes/documents`      | High     | **Complete** |
| **Drafting**       | `features/drafting`       | `routes/drafting`       | Low      | **Complete** |
| **Evidence**       | `features/evidence`       | `routes/evidence`       | Medium   | **Complete** |
| **Knowledge**      | `features/knowledge`      | `routes/[sub-routes]`   | Medium   | **Complete** |
| **Litigation**     | `features/litigation`     | `routes/litigation`     | High     | **Complete** |
| **Messages**       | `features/messaging`      | `routes/messages`       | Low      | **Complete** |
| **Profile**        | `features/profile`        | `routes/profile`        | Low      | **Complete** |
| **Real Estate**    | `features/real-estate`    | `routes/real-estate`    | Low      | **Complete** |
| **Reports**        | `features/reports`        | `routes/reports`        | Low      | **Complete** |
| **Search**         | `features/search`         | `routes/search`         | High     | **Complete** |
| **Settings**       | `features/settings`       | `routes/settings`       | Low      | **Complete** |

_(List extends to all folders in `src/features/`)_

## IV. Detailed Transition Steps (Per Route)

### 1. Loader & Data Contract

- Extract data fetching logic from `useEffect` or custom hooks in `features/`.
- Implement `loader` in `routes/[domain]/loader.ts`.
- Define strict TypeScript interfaces for Loader Data.

### 2. Provider Implementation

- Create `[Domain]Provider.tsx`.
- Move transient client state (filters, visibility, tabs) here.
- Accept `initialData` from `loader`.

### 3. View Construction

- Create `[Domain]View.tsx`.
- Move JSX structure from `features/[domain]/[MainComponent].tsx`.
- Replace complex logic with calls to `use[Domain]()`.

### 4. Page Assembly

- Update `routes/[domain]/index.tsx` (or `Page.tsx`).
- Implement `Suspense` and `Await` boundaries.
- Connect `LoaderData` to `Provider`.
- **Register Route**: Update `frontend/src/routes.ts` to point to the new route file (e.g., `route("profile", "routes/profile/index.tsx")`).

### 5. File Migration

- `mv src/features/[domain]/components src/routes/[domain]/components`
- `mv src/features/[domain]/hooks src/routes/[domain]/_hooks`
- Update imports in all moved files.

## V. Example: Profile Migration

**Before:**

- `src/features/profile/ProfileOverview.tsx` (Contains UI & Data Fetching)
- `src/features/profile/hooks/useProfile.ts`

**After:**
`src/routes/profile/`

- `loader.ts`: Fetches profile data.
- `ProfilePage.tsx`:
  ```tsx
  export function ProfilePage() {
    const data = useLoaderData<typeof loader>();
    return (
      <Suspense fallback={<Skeleton />}>
        <Await resolve={data.profile}>
          {(profile) => (
            <ProfileProvider profile={profile}>
              <ProfileView />
            </ProfileProvider>
          )}
        </Await>
      </Suspense>
    );
  }
  ```
- `ProfileProvider.tsx`: Manages "Edit Mode" state.
- `ProfileView.tsx`: Renders the form.

## VI. Implementation Order

1.  **Infrastructure**: Ensure `RouteErrorBoundary` and root providers are stable.
2.  **Core Routes**: Migrate `cases`, `docket`, `documents`.
3.  **Secondary Routes**: Migrate `profile`, `billing`, `analytics`.
4.  **Cleanup**: Remove empty `src/features` directory.
