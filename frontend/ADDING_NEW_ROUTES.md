# Adding New Routes - Checklist

Use this checklist when adding new routes to LexiFlow Premium.

---

## Step 1: Define Route in `routes.ts`

```typescript
// src/routes.ts
export default [
  layout("routes/root.tsx", [
    layout("routes/layout.tsx", [
      // ... existing routes ...

      // ✅ Add your new route here
      route("my-feature", "routes/my-feature/index.tsx"),
      route("my-feature/:id", "routes/my-feature/detail.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
```

**Patterns:**

- List page: `route("features", "routes/features/index.tsx")`
- Detail page: `route("features/:id", "routes/features/detail.tsx")`
- Nested routes: Use `layout()` or `prefix()`

---

## Step 2: Create Route File

```typescript
// src/routes/my-feature/index.tsx

/**
 * My Feature Route
 *
 * Description of what this route does
 */

import type { Route } from "./+types/index";

// ✅ Step 2a: Add meta tags
export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "My Feature - LexiFlow" },
    { name: "description", content: "Feature description" },
  ];
}

// ✅ Step 2b: Add loader for data fetching
export async function loader({ params, request }: Route.LoaderArgs) {
  // Fetch data here (runs on server in SSR mode)
  const data = await api.myFeature.getAll();

  // Optional: Auth check
  // const user = await getUser(request);
  // if (!user) throw redirect("/login");

  return { data };
}

// ✅ Step 2c: Add action for mutations (optional)
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // Handle create
      break;
    case "update":
      // Handle update
      break;
    case "delete":
      // Handle delete
      break;
  }

  return { success: true };
}

// ✅ Step 2d: Add component
export default function MyFeatureRoute({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-8">
      <h1>My Feature</h1>
      {/* Your UI here */}
    </div>
  );
}

// ✅ Step 2e: Add error boundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error("My Feature error:", error);

  if (error instanceof Response && error.status === 404) {
    return <div>Not Found</div>;
  }

  return (
    <div className="p-8 text-red-600">
      Error: {error instanceof Error ? error.message : "Unknown error"}
    </div>
  );
}
```

---

## Step 3: Test Your Route

```bash
# Run dev server
npm run dev

# Open in browser
open http://localhost:3400/my-feature

# Test with params (if applicable)
open http://localhost:3400/my-feature/123
```

---

## Step 4: Type Check

```bash
# Generate types and check for errors
npm run type-check
```

This will create `src/routes/my-feature/+types/index.d.ts` with:

- `Route.LoaderArgs` - Typed params
- `Route.ComponentProps` - Typed loader data
- `Route.ActionArgs` - Typed action args
- `Route.MetaArgs` - Typed meta args
- `Route.ErrorBoundaryProps` - Typed error

---

## Step 5: Build for Production

```bash
# Build and verify
npm run build
npm run preview
```

---

## Common Patterns

### ✅ List + Detail Pages

```typescript
// routes.ts
route("users", "routes/users/index.tsx"),
route("users/:userId", "routes/users/detail.tsx"),

// routes/users/index.tsx
export async function loader() {
  const users = await api.users.getAll();
  return { users };
}

// routes/users/detail.tsx
export async function loader({ params }: Route.LoaderArgs) {
  const user = await api.users.get(params.userId);
  if (!user) throw new Response("Not Found", { status: 404 });
  return { user };
}
```

### ✅ Form with Validation

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  // Validation
  if (!email || !email.includes("@")) {
    return { error: "Invalid email" };
  }

  // Process
  await api.users.create({ email });
  return redirect("/users");
}

export default function NewUserRoute({ actionData }: Route.ComponentProps) {
  return (
    <Form method="post">
      <input name="email" type="email" required />
      {actionData?.error && <span>{actionData.error}</span>}
      <button type="submit">Create</button>
    </Form>
  );
}
```

### ✅ Auth Protected Route

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);

  if (!user) {
    throw redirect("/login");
  }

  if (!user.isAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }

  return { user };
}
```

### ✅ Streaming Slow Data

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  const critical = await getCriticalData();

  return {
    critical,
    analytics: getAnalytics(), // Don't await - returns Promise
    reports: getReports(),     // Don't await - returns Promise
  };
}

export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <CriticalView data={loaderData.critical} />

      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData.analytics}>
          {(data) => <AnalyticsChart data={data} />}
        </Await>
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData.reports}>
          {(data) => <ReportList reports={data} />}
        </Await>
      </Suspense>
    </>
  );
}
```

### ✅ Nested Routes with Layout

```typescript
// routes.ts
layout("routes/admin/layout.tsx", [
  route("users", "routes/admin/users.tsx"),
  route("settings", "routes/admin/settings.tsx"),
]),

// routes/admin/layout.tsx
export default function AdminLayout() {
  return (
    <div>
      <AdminNav />
      <Outlet /> {/* Child routes render here */}
    </div>
  );
}
```

---

## Checklist Summary

- [ ] Add route definition to `src/routes.ts`
- [ ] Create route file in `src/routes/[feature]/`
- [ ] Add `meta()` function for SEO
- [ ] Add `loader()` function for data
- [ ] Add `action()` function if needed
- [ ] Add component export
- [ ] Add `ErrorBoundary` export
- [ ] Import `Route` type from `+types`
- [ ] Test in dev mode
- [ ] Run type check
- [ ] Build for production
- [ ] Update navigation config if needed (in `nav.config.ts`)

---

## Navigation Integration

If your route should appear in the sidebar:

```typescript
// src/config/nav.config.ts
export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // ... existing items ...

  {
    id: PATHS.MY_FEATURE,
    label: "My Feature",
    icon: MyIcon,
    category: "Main",
  },
];

// src/config/paths.config.ts
export const PATHS = {
  // ... existing paths ...
  MY_FEATURE: "my-feature",
} as const;
```

---

## Troubleshooting

### "Cannot find module './+types/index'"

**Solution:** Run `npm run build` or `npm run type-check` to generate types.

### Types not updating

**Solution:** Delete `.react-router/` and run `npm run build` again.

### Route not rendering

**Solution:** Check `routes.ts` - ensure path matches exactly.

### Data not loading

**Solution:** Check `loader()` function - ensure it returns data, not undefined.

### Form not submitting

**Solution:** Ensure `<Form>` (capital F) is imported from `react-router`, not HTML `<form>`.

---

## Resources

- **Full Implementation**: See `REACT_ROUTER_V7_IMPLEMENTATION.md`
- **Quick Reference**: See `REACT_ROUTER_V7_QUICK_REFERENCE.md`
- **React Router Docs**: https://reactrouter.com/dev
- **Type Safety Guide**: https://reactrouter.com/dev/guides/typescript

---

**Last Updated:** 2026-01-01
**Maintained by:** LexiFlow Development Team
