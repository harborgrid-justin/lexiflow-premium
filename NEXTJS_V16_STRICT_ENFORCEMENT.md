# STRICT COMPLIANCE ENFORCEMENT - Next.js v16 & React 19

**Classification**: ENFORCEMENT DIRECTIVE
**Effective Date**: January 7, 2026
**Compliance Officer**: AI Compliance System
**Authority**: Enterprise Architecture Standards

---

## 🔴 ZERO-TOLERANCE POLICIES

These are non-negotiable requirements for LexiFlow codebase. Any deviations require explicit written approval from the CTO.

---

## 1. TypeScript Strictness (MANDATORY)

### Requirement

**tsconfig.json MUST have**:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Enforcement

- ✅ **ENABLED** as of January 7, 2026
- ❌ **CANNOT BE DISABLED** without CTO approval
- 📊 **BUILD FAILURE** on type errors
- 🚫 **`any` type banned** except with `// @ts-expect-error` comment

### Violations

```tsx
// ❌ VIOLATES POLICY
const handleClick = (e) => { }                    // Missing param type
const data: any = fetchData();                    // Implicit any
function process(value?) { return value.name; }   // Unsafe optional
const arr = [];                                    // Unknown array type

// ✅ COMPLIES
const handleClick = (e: React.MouseEvent) => { }
const data = await fetchData<DataType>();
function process(value: Value | undefined) { ... }
const arr: Item[] = [];
```

---

## 2. Server Component Patterns (MANDATORY)

### Requirement

**ALL page.tsx files MUST**:

- Be async server components by default
- Use `export async function generateMetadata()`
- Implement `export async function generateStaticParams()`
- Use `export const dynamic = 'force-static'`
- Wrap async data in `<Suspense>` boundaries

### Pattern (NON-NEGOTIABLE)

```tsx
// ✅ CORRECT PATTERN - FOLLOW EXACTLY
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await fetchData(id);
    return { title: data.title };
  } catch {
    return { title: "Not Found" };
  }
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const items = await fetchItems();
    return items.map((item) => ({ id: item.id }));
  } catch {
    return [];
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  let data;
  try {
    data = await fetchData(id);
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingUI />}>
      <DataComponent data={data} />
    </Suspense>
  );
}
```

### Violations

```tsx
// ❌ VIOLATES POLICY

// No generateMetadata
export default async function Page() {}

// Using /api endpoint instead of server-side fetch
const data = await fetch("/api/data");

// No Suspense boundary
const asyncData = await fetchData();

// No error handling
const { id } = params; // might not await

// Client component fetching server data
("use client");
const data = await serverFunction(); // ❌ WRONG
```

---

## 3. Error Boundaries (MANDATORY)

### Requirement

**EVERY route segment MUST have**:

- `error.tsx` for error handling
- `not-found.tsx` for 404 handling
- Proper error logging

### Pattern

```tsx
// segment/error.tsx
"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Segment error:", error);
    // TODO: Send to monitoring (Sentry, DataDog)
  }, [error]);

  return (
    <div className="error-container">
      <h2>Error</h2>
      <button onClick={() => reset()}>Retry</button>
    </div>
  );
}
```

### Required Error Files

```
app/
├── error.tsx                    ✅ REQUIRED
├── not-found.tsx               ✅ REQUIRED
└── (main)/
    ├── error.tsx               ✅ REQUIRED
    ├── loading.tsx             ✅ REQUIRED
    ├── [resource]/
    │   ├── error.tsx           ✅ REQUIRED
    │   └── [id]/
    │       ├── error.tsx       ✅ REQUIRED
    │       └── loading.tsx     ✅ REQUIRED
    └── admin/
        ├── error.tsx           ✅ REQUIRED
        └── users/
            └── error.tsx       ✅ REQUIRED
```

---

## 4. Route Organization (MANDATORY)

### Requirement

**Route structure MUST follow**:

```
app/
├── (auth)/              ← Public routes
├── (main)/              ← Authenticated routes ONLY
│   ├── admin/
│   ├── cases/
│   ├── documents/
│   └── [50+ other routes]
└── api/                 ← API routes
```

### Enforcement

- ❌ **NO standalone routes** at app root level
- ✅ **ALL pages** in route groups: `(auth)` or `(main)`
- ✅ **Route names** must use kebab-case
- ✅ **Singular names** for resource types

### Violations

```tsx
// ❌ VIOLATES POLICY
app / admin / page.tsx; // Should be (main)/admin
app / jurisdiction / page.tsx; // Should be (main)/jurisdictions
app / my_route / page.tsx; // Should use kebab-case

// ✅ COMPLIES
app / main / admin / page.tsx;
app / main / jurisdictions / page.tsx;
app / main / my - route / page.tsx;
```

---

## 5. Component Typing (MANDATORY)

### Requirement

**ALL components MUST have**:

- Explicit prop types
- Explicit return types
- No `React.FC<>` (use function declaration)

### Pattern

```tsx
// ✅ CORRECT
interface CardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function Card({ title, description, children }: CardProps): JSX.Element {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}

// ❌ INCORRECT
export const Card: React.FC = ({ title, description, children }) => {
  // ...
};

export const Card = ({ title, description }: any) => {
  // ...
};
```

---

## 6. Data Fetching (MANDATORY)

### Requirement

**Server-side fetching MUST**:

- Use native `fetch()` or third-party client (axios)
- Include proper error handling
- Use `Suspense` for async boundaries
- Implement ISR with `revalidate`

### Pattern

```tsx
// ✅ CORRECT - Server Component
export default async function Page() {
  try {
    const data = await fetch("/api/data", {
      next: { revalidate: 3600 },
    });
  } catch (error) {
    notFound();
  }
}

// ❌ INCORRECT - Client Component
("use client");
useEffect(() => {
  fetch("/api/data").then(setData); // ❌ Wrong pattern
}, []);
```

---

## 7. Client vs Server Components (MANDATORY)

### Requirement

**Default to Server Components**. Use `'use client'` only for:

- Interactive features (useState, event handlers)
- Browser APIs
- React hooks requiring client-side state

### Decision Tree

```
Does component need:
├─ useState/useReducer?          → Client ✓
├─ useEffect/useLayoutEffect?    → Client ✓
├─ Event handlers (onClick)?     → Client ✓
├─ Browser APIs (localStorage)?  → Client ✓
├─ Async server function calls?  → Server ✓ (default)
├─ Database access?              → Server ✓ (default)
├─ API key secrets?              → Server ✓ (default)
└─ Just rendering JSX?           → Server ✓ (default)
```

### Violations

```tsx
// ❌ VIOLATES POLICY
"use client";
const data = await fetchData(); // Fetch server data in client

// ❌ VIOLATES POLICY
export default function Page() {
  // Should be async server
  const data = await fetchData();
}

// ✅ COMPLIES
export default async function Page() {
  // Server component
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

("use client"); // Only interactive parts
export function ClientComponent({ data }: Props) {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

---

## 8. Security Headers & Configuration (MANDATORY)

### Requirements

**next.config.ts MUST have**:

```tsx
const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
      ],
    },
  ],
};
```

### Violations

```tsx
// ❌ VIOLATES POLICY
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ❌ NEVER ignore TypeScript errors
  },
};
```

---

## 9. Testing Requirements (MANDATORY)

### Requirement

**Critical paths MUST have tests**:

- ✅ Authentication flows
- ✅ Data fetching with error states
- ✅ Form submissions
- ✅ Navigation and routing
- ✅ Error boundary recovery

### Violations

```tsx
// ❌ VIOLATES POLICY
export default async function Page() {
  // No test file: page.test.tsx missing
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ COMPLIES
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
// AND has: page.test.tsx with proper tests
```

---

## 10. Commit & Code Review (MANDATORY)

### Requirement

**Before merging any PR**:

- ✅ TypeScript build passes without errors
- ✅ All lint rules pass
- ✅ Error boundaries implemented
- ✅ Metadata configured for dynamic routes
- ✅ Tests pass
- ✅ Code review approved by senior dev

### CI/CD Checks

```bash
# These MUST pass:
npm run build          # TypeScript + Next.js build
npm run test           # All tests pass
npm run lint           # ESLint + formatting
```

---

## 🚨 VIOLATION CONSEQUENCES

| Severity    | Violation                 | Consequence          |
| ----------- | ------------------------- | -------------------- |
| 🔴 Critical | Disabling strict mode     | PR REJECTED          |
| 🔴 Critical | Missing error.tsx         | PR REJECTED          |
| 🔴 Critical | Implicit `any` types      | PR REJECTED          |
| 🟡 High     | No generateMetadata       | Code review required |
| 🟡 High     | Missing Suspense boundary | Code review required |
| 🟠 Medium   | Inconsistent naming       | Request changes      |
| 🟠 Medium   | Missing JSDoc comments    | Request changes      |

---

## ✅ COMPLIANCE CHECKLIST

### Before Committing Code

- [ ] TypeScript compilation passes without errors
- [ ] No `any` types unless documented
- [ ] Server components are async by default
- [ ] Dynamic routes have `generateMetadata()`
- [ ] Error boundaries implemented (`error.tsx`)
- [ ] Suspense boundaries for async data
- [ ] Route segment config present
- [ ] All props have explicit types
- [ ] No console.log() in production code
- [ ] Security headers configured

### Before Merging PR

- [ ] All above checks pass
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm run test`
- [ ] Lint passes: `npm run lint`
- [ ] Code review approved
- [ ] No breaking changes to API
- [ ] Documentation updated

---

## 📞 ESCALATION CONTACT

**Questions about these standards?**

- Enterprise Architect: [Contact]
- Security Officer: [Contact]
- CTO: [Contact]

**Non-compliant code found?**

- Report to: [slack-channel]
- Priority: IMMEDIATE

---

## CERTIFICATION

By committing code to this repository, you certify that:

1. ✅ Code meets Next.js v16 standards
2. ✅ Code meets React 19 requirements
3. ✅ TypeScript strict mode is enabled
4. ✅ All error boundaries are implemented
5. ✅ All tests pass
6. ✅ Code has been reviewed

**Last Enforced**: January 7, 2026
**Next Audit**: January 21, 2026
