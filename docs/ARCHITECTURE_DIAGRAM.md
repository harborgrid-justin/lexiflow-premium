# React Router v7 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER REQUEST                              │
│                              ↓                                       │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      REACT ROUTER v7 SERVER                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  entry.server.tsx                                             │  │
│  │  - Renders ServerRouter                                       │  │
│  │  - Streams HTML with renderToPipeableStream                   │  │
│  │  - Bot detection (isbot)                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               ↓                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  routes.ts Configuration                                      │  │
│  │  - Declarative route definitions (120+ routes)                │  │
│  │  - Nested layouts                                             │  │
│  │  - Type-safe params                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               ↓                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Route Matching & Loader Execution                            │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ routes/root.tsx                                         │  │  │
│  │  │ - Document structure                                    │  │  │
│  │  │ - Global providers (Theme, Auth, QueryClient)          │  │  │
│  │  │ - Meta tags                                             │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                          ↓                                     │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ routes/layout.tsx                                       │  │  │
│  │  │ - App shell (Sidebar, Header)                           │  │  │
│  │  │ - Auth loader                                           │  │  │
│  │  │ - Global hotkeys                                        │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                          ↓                                     │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ routes/cases/index.tsx                                  │  │  │
│  │  │ ✓ meta() - SEO tags                                     │  │  │
│  │  │ ✓ loader() - Parallel data fetch                        │  │  │
│  │  │   - api.cases.getAll()                                  │  │  │
│  │  │   - api.billing.getInvoices()                           │  │  │
│  │  │ ✓ action() - Form handling                              │  │  │
│  │  │ ✓ Component - Type-safe props                           │  │  │
│  │  │ ✓ ErrorBoundary - Isolated errors                       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               ↓                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  HTML Streaming (with Suspense)                               │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │  │
│  │  │ Critical Data  │  │ Slow Data      │  │ Slow Data      │  │  │
│  │  │ (Awaited)      │  │ (Streamed)     │  │ (Streamed)     │  │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      BROWSER CLIENT                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  entry.client.tsx                                             │  │
│  │  - Hydrates with HydratedRouter                              │  │
│  │  - StrictMode + startTransition                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               ↓                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Interactive React App                                        │  │
│  │  - Type-safe navigation                                       │  │
│  │  - Form progressive enhancement                               │  │
│  │  - Suspense boundaries for streaming data                     │  │
│  │  - Client-side routing (no full page reloads)                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────

TYPE GENERATION FLOW:

┌─────────────────────────────────────────────────────────────────────┐
│  routes/cases/index.tsx                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ export async function loader({ params }) { ... }            │    │
│  │ export default function Component({ loaderData }) { ... }   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                               ↓ npm run build
┌─────────────────────────────────────────────────────────────────────┐
│  routes/cases/+types/index.d.ts (AUTO-GENERATED)                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ export namespace Route {                                    │    │
│  │   export type LoaderArgs = { params: { ... } };            │    │
│  │   export type ComponentProps = { loaderData: { ... } };    │    │
│  │   export type ActionArgs = { ... };                        │    │
│  │   export type MetaArgs = { ... };                          │    │
│  │   export type ErrorBoundaryProps = { ... };                │    │
│  │ }                                                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                               ↓ import
┌─────────────────────────────────────────────────────────────────────┐
│  import type { Route } from "./+types/index";                        │
│  ✓ Full TypeScript type safety                                      │
│  ✓ Autocomplete for params                                          │
│  ✓ Type errors at compile time                                      │
└─────────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────

DATA FLOW:

SERVER (SSR):
  Request → Loader → Render → Stream HTML → Client

CLIENT (After Hydration):
  Navigate → Loader (fetch) → Update → No full reload

FORM SUBMISSION:
  <Form> → Action (POST) → Process → Redirect/Return
           ↓
  Works without JavaScript (Progressive Enhancement)

STREAMING EXAMPLE:
  loader() {
    return {
      critical: await getData(),  ← Wait for this
      slow: getSlowData()        ← Stream this later
    }
  }

  Component:
    <Suspense fallback={<Spinner />}>
      <Await resolve={slow}>
        {data => <View data={data} />}
      </Await>
    </Suspense>

───────────────────────────────────────────────────────────────────────

DIRECTORY STRUCTURE:

frontend/
├── src/
│   ├── routes/                     ← All route files
│   │   ├── root.tsx               ← Document + providers
│   │   ├── layout.tsx             ← App shell
│   │   ├── home.tsx               ← Dashboard
│   │   ├── cases/
│   │   │   ├── index.tsx          ← List page
│   │   │   ├── create.tsx         ← Create page
│   │   │   ├── case-detail.tsx    ← Detail page
│   │   │   └── +types/            ← Auto-generated (gitignore)
│   │   │       ├── index.d.ts
│   │   │       ├── create.d.ts
│   │   │       └── case-detail.d.ts
│   │   └── ... (120+ more routes)
│   ├── routes.ts                   ← Route configuration
│   ├── entry.client.tsx            ← Client entry
│   ├── entry.server.tsx            ← Server entry
│   └── providers/                  ← Global providers
├── react-router.config.ts          ← RR configuration
└── vite.config.ts                  ← Vite + RR plugin

───────────────────────────────────────────────────────────────────────
```
