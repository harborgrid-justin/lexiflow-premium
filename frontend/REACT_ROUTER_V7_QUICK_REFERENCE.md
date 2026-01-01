# React Router v7 - Quick Reference Guide

## Common Patterns

### 1. Creating a New Route

```typescript
// 1. Add to routes.ts
route("my-feature", "routes/my-feature/index.tsx"),

// 2. Create route file: src/routes/my-feature/index.tsx
import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "My Feature - LexiFlow" }];
}

export async function loader({}: Route.LoaderArgs) {
  const data = await api.myFeature.getAll();
  return { data };
}

export default function MyFeatureRoute({ loaderData }: Route.ComponentProps) {
  return <div>{/* Your component */}</div>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div>Error: {error.message}</div>;
}
```

### 2. Route with Dynamic Params

```typescript
// routes.ts
route("users/:userId", "routes/users/detail.tsx"),

// routes/users/detail.tsx
export async function loader({ params }: Route.LoaderArgs) {
  // params.userId is automatically typed!
  const user = await api.users.get(params.userId);
  return { user };
}
```

### 3. Form with Action

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;

  await api.create({ name });
  return redirect("/success");
}

export default function MyRoute() {
  return (
    <Form method="post">
      <input name="name" required />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### 4. Streaming Slow Data

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  const critical = await getCriticalData();

  return {
    critical,
    slow: getSlowData(), // Return promise without await
  };
}

export default function MyRoute({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <CriticalView data={loaderData.critical} />

      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData.slow}>
          {(data) => <SlowView data={data} />}
        </Await>
      </Suspense>
    </>
  );
}
```

### 5. Auth Protection

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");

  return { user };
}
```

### 6. 404 Handling

```typescript
export async function loader({ params }: Route.LoaderArgs) {
  const item = await getItem(params.id);

  if (!item) {
    throw new Response("Not Found", { status: 404 });
  }

  return { item };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (error instanceof Response && error.status === 404) {
    return <NotFoundPage />;
  }
  return <ErrorPage error={error} />;
}
```

## Navigation

```typescript
import { Link, useNavigate } from "react-router";

// Declarative
<Link to="/cases/123">View Case</Link>

// Programmatic
const navigate = useNavigate();
navigate("/cases/123");

// With state
navigate("/cases/123", { state: { from: "dashboard" } });
```

## Data Hooks

```typescript
import { useLoaderData, useActionData, useNavigation } from "react-router";

export default function MyRoute({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div>{loaderData.data}</div>
      {actionData?.error && <Error msg={actionData.error} />}
      {isSubmitting && <Spinner />}
    </>
  );
}
```

## Build Commands

```bash
# Development
npm run dev

# Type check (generates +types)
npm run type-check

# Build for production
npm run build

# Preview build
npm run preview
```

## File Structure

```
src/
├── routes/
│   ├── root.tsx              # Document + providers
│   ├── layout.tsx            # App shell
│   ├── home.tsx              # Dashboard
│   └── feature/
│       ├── index.tsx         # List view
│       ├── detail.tsx        # Detail view
│       └── +types/           # Auto-generated (don't commit)
│           ├── index.d.ts
│           └── detail.d.ts
├── routes.ts                 # Route configuration
└── providers/                # Global providers
```

## Type Safety

```typescript
// Automatically typed from route definition
import type { Route } from "./+types/users";

// ✅ TypeScript knows the shape!
loader({ params }: Route.LoaderArgs)      // params typed
meta({ data }: Route.MetaArgs)            // data typed from loader
Component({ loaderData }: Route.ComponentProps)  // loader data typed
action({ request }: Route.ActionArgs)     // request typed
ErrorBoundary({ error }: Route.ErrorBoundaryProps)  // error typed
```

## Common Gotchas

1. **Don't commit +types folder** - Auto-generated at build time
2. **Run build to generate types** - TypeScript needs them
3. **Import Route from +types** - Not from react-router
4. **Use Form not form** - For progressive enhancement
5. **Throw redirect()** - Don't return it in loaders

## Migration Checklist

- [ ] Add route to `routes.ts`
- [ ] Create route file with exports
- [ ] Add `meta()` function
- [ ] Add `loader()` for data
- [ ] Add `action()` for mutations (optional)
- [ ] Add `ErrorBoundary` export
- [ ] Import `Route` types from `+types`
- [ ] Use `<Form>` for forms
- [ ] Test in dev mode
- [ ] Build and verify types
