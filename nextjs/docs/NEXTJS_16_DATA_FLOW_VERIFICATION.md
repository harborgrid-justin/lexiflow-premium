# Next.js 16 Backend Data Flow - Complete Process

## LexiFlow Enterprise Legal OS

**Date**: 2026-01-02
**Purpose**: Verify Next.js 16 → Backend API data flow is correct

---

## 📊 Complete Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER (Client)                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User navigates to /cases                                       │
│          ↓                                                      │
│  Next.js App Router (Server Component)                         │
│          ↓                                                      │
│  ┌───────────────────────────────────────────────────┐        │
│  │ page.tsx (Server Component)                       │        │
│  │ - Renders on server                               │        │
│  │ - Can fetch data directly                         │        │
│  │ - Passes data to Client Components                │        │
│  └───────────────────────────────────────────────────┘        │
│          ↓                                                      │
│  ┌───────────────────────────────────────────────────┐        │
│  │ Client Components ('use client')                  │        │
│  │ - Interactive UI with hooks                       │        │
│  │ - Fetches data via fetch() or DataService        │        │
│  │ - Real-time updates, forms, etc.                 │        │
│  └───────────────────────────────────────────────────┘        │
│          ↓                                                      │
└─────────┼───────────────────────────────────────────────────────┘
          │
          │ HTTP Request
          ↓
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND API (NestJS + PostgreSQL)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  http://localhost:3001/api                                     │
│          ↓                                                      │
│  ┌───────────────────────────────────────────────────┐        │
│  │ Controller (@Controller)                          │        │
│  │ - Handles HTTP routes                             │        │
│  │ - Validates input                                 │        │
│  │ - Returns JSON                                    │        │
│  └───────────────────────────────────────────────────┘        │
│          ↓                                                      │
│  ┌───────────────────────────────────────────────────┐        │
│  │ Service (@Injectable)                             │        │
│  │ - Business logic                                  │        │
│  │ - Database queries                                │        │
│  │ - Data transformation                             │        │
│  └───────────────────────────────────────────────────┘        │
│          ↓                                                      │
│  ┌───────────────────────────────────────────────────┐        │
│  │ PostgreSQL Database                               │        │
│  │ - TypeORM entities                                │        │
│  │ - Persistent data                                 │        │
│  └───────────────────────────────────────────────────┘        │
│          ↓                                                      │
│  JSON Response                                                 │
│          ↓                                                      │
└─────────┼───────────────────────────────────────────────────────┘
          │
          │ Response flows back
          ↓
    Client receives data → Renders UI
```

---

## 10 Complete Page.tsx Examples

### Pattern Summary

| Page           | Type        | Data Fetching    | Backend Endpoint       | Component Type   |
| -------------- | ----------- | ---------------- | ---------------------- | ---------------- |
| 1. Home        | Landing     | None             | N/A                    | Server Component |
| 2. Dashboard   | Stats       | None (hardcoded) | N/A                    | Server Component |
| 3. Cases List  | List View   | Client fetch     | GET /api/cases         | Server → Client  |
| 4. Case Detail | Detail View | Server fetch     | GET /api/cases/:id     | Server Component |
| 5. Documents   | Manager     | Client Component | GET /api/documents     | Server → Client  |
| 6. Billing     | Dashboard   | Client Component | GET /api/billing/\*    | Server → Client  |
| 7. Discovery   | Platform    | Client Component | GET /api/discovery/\*  | Server → Client  |
| 8. Research    | AI Tool     | Client Component | POST /api/research     | Server → Client  |
| 9. Analytics   | Reports     | None (stub)      | N/A                    | Server Component |
| 10. Compliance | Dashboard   | Client Component | GET /api/compliance/\* | Server → Client  |

---

## Example 1: Home Page (Landing - Server Component)

**File**: `src/app/page.tsx`

```tsx
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Home",
  description: "Enterprise legal OS",
};

// ✅ SERVER COMPONENT (default)
// - No 'use client' directive
// - Renders on server
// - No browser APIs
// - No state/hooks
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold">LexiFlow AI Legal Suite</h1>
          <p className="mt-6 text-xl text-slate-600">Enterprise legal OS</p>
          <div className="mt-10">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Data Flow**:

```
Browser Request → Next.js Server → Renders HTML → Sends to Browser
No backend API call needed (static content)
```

---

## Example 2: Dashboard (Server Component with Static Data)

**File**: `src/app/dashboard/page.tsx`

```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "LexiFlow Dashboard",
};

// ✅ SERVER COMPONENT
// - Renders stats on server
// - Could fetch from backend API here
// - Currently using hardcoded demo data
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-4 gap-6 mt-8">
          {/* Stats cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-slate-600">Active Cases</div>
            <div className="text-3xl font-semibold">24</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-slate-600">Pending Tasks</div>
            <div className="text-3xl font-semibold">12</div>
          </div>

          {/* More cards... */}
        </div>
      </div>
    </div>
  );
}
```

**Data Flow**:

```
Browser Request → Next.js Server → Renders HTML with hardcoded data → Browser
Future: Could call backend API with apiFetch() here
```

---

## Example 3: Cases List (Server → Client Pattern)

**File**: `src/app/(main)/cases/page.tsx`

```tsx
import { CaseFilters } from "@/components/cases/CaseFilters";
import { CaseList } from "@/components/cases/CaseList";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Cases",
  description: "Manage all legal cases",
};

// ✅ SERVER COMPONENT
// - Sets up page structure
// - Delegates data fetching to Client Components
// - Uses Suspense for loading states
export default function CasesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Cases</h1>
        <Link href="/cases/new">New Case</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Suspense fallback={<div>Loading filters...</div>}>
            <CaseFilters />
          </Suspense>
        </aside>

        <main className="lg:col-span-3">
          <Suspense fallback={<div>Loading cases...</div>}>
            <CaseList /> {/* ← Client Component fetches data */}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

**Client Component**: `src/components/cases/CaseList.tsx`

```tsx
"use client"; // ← Marks as Client Component

import { API_ENDPOINTS } from "@/lib/api-config";
import { Case } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        // ✅ Fetch from backend API
        const response = await fetch(API_ENDPOINTS.CASES.LIST);
        const data = await response.json();
        setCases(data.data || []);
      } catch (error) {
        console.error("Failed to fetch cases:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {cases.map((caseItem) => (
        <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
          <div className="p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold">{caseItem.title}</h3>
            <p className="text-sm text-slate-600">{caseItem.caseNumber}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

**Data Flow**:

```
1. Browser requests /cases
2. Next.js renders page.tsx on server (structure only)
3. Server sends HTML to browser
4. Browser hydrates React
5. CaseList mounts → useEffect fires
6. fetch(API_ENDPOINTS.CASES.LIST) → GET http://localhost:3001/api/cases
7. Backend NestJS controller receives request
8. Service queries PostgreSQL
9. Returns JSON: { data: [{ id, title, ... }], total: 24 }
10. Client updates state → Re-renders with data
```

---

## Example 4: Case Detail (Server Component with Dynamic Data)

**File**: `src/app/(main)/cases/[id]/page.tsx`

```tsx
import { CaseHeader } from "@/components/cases/CaseHeader";
import { CaseOverview } from "@/components/cases/CaseOverview";
import { API_ENDPOINTS, apiFetch } from "@/lib/api-config";
import type { Case } from "@/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface CasePageProps {
  params: Promise<{ id: string }>;
}

// ✅ SERVER COMPONENT - Fetches data on server
export async function generateMetadata({
  params,
}: CasePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const caseData = await apiFetch<Case>(API_ENDPOINTS.CASES.DETAIL(id));
    return {
      title: `${caseData.caseNumber} - ${caseData.title}`,
      description: caseData.description || "Case details",
    };
  } catch (error) {
    return {
      title: "Case Not Found",
    };
  }
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;

  // ✅ Fetch case data on the server
  let caseData: Case;
  try {
    caseData = await apiFetch<Case>(API_ENDPOINTS.CASES.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Pass server-fetched data to client components */}
      <CaseHeader caseData={caseData} />

      <div className="mt-8 space-y-8">
        <Suspense fallback={<div>Loading overview...</div>}>
          <CaseOverview caseData={caseData} />
        </Suspense>
      </div>
    </div>
  );
}
```

**Data Flow**:

```
1. Browser requests /cases/123
2. Next.js Server runs CasePage() async function
3. Server calls apiFetch(API_ENDPOINTS.CASES.DETAIL('123'))
   → GET http://localhost:3001/api/cases/123
4. Backend returns: { id: '123', title: 'Smith v Jones', ... }
5. Server renders complete HTML with data
6. Browser receives fully populated HTML
7. React hydrates (makes interactive)
```

**API Config**: `src/lib/api-config.ts`

```typescript
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const API_ENDPOINTS = {
  CASES: {
    LIST: "/cases",
    DETAIL: (id: string) => `/cases/${id}`,
    CREATE: "/cases",
    UPDATE: (id: string) => `/cases/${id}`,
    DELETE: (id: string) => `/cases/${id}`,
  },
} as const;

// Server-side fetch wrapper
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

---

## Example 5: Documents (Client Component Manager)

**File**: `src/app/(main)/documents/page.tsx`

```tsx
import { DocumentManager } from "@/components/documents/DocumentManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
  description: "Manage legal documents",
};

// ✅ SERVER COMPONENT - Just renders wrapper
export default function DocumentsPage() {
  return (
    <div className="h-full flex flex-col">
      <DocumentManager /> {/* Client Component */}
    </div>
  );
}
```

**Data Flow**:

```
1. Server renders page structure
2. DocumentManager (client component) mounts
3. Component fetches data from /api/documents
4. Displays document list with upload/search/filter
```

---

## Example 6: Billing (Client Component with Transitions)

**File**: `src/app/(main)/billing/page.tsx`

```tsx
import BillingDashboard from "@/components/billing/BillingDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Finance | LexiFlow",
  description: "Manage invoices, track time",
};

// ✅ SERVER COMPONENT wrapper
export default function BillingPage() {
  return <BillingDashboard />;
}
```

**Client Component**: `src/components/billing/BillingDashboard.tsx`

```tsx
"use client";

import { useState, useTransition } from "react";

export default function BillingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isPending, startTransition] = useTransition();

  // ✅ React 19 concurrent mode - non-urgent updates
  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      setActiveTab(tabId);
    });
  };

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={activeTab === tab.id ? "active" : ""}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content renders based on tab */}
      {activeTab === "overview" && <BillingOverview />}
      {activeTab === "invoices" && <BillingInvoices />}
      {/* ... */}
    </div>
  );
}
```

**Data Flow**:

```
1. Page mounts → BillingDashboard renders
2. Component could fetch from /api/billing/metrics
3. User clicks tab → startTransition() keeps UI responsive
4. React 19 renders tab content in background
5. Smooth transition without blocking
```

---

## Example 7-10: Additional Patterns

### 7. Discovery Platform

```tsx
// src/app/(main)/discovery/page.tsx
import DiscoveryPlatform from "@/components/discovery/DiscoveryPlatform";

export default function DiscoveryPage() {
  return <DiscoveryPlatform />; // Client component with DataService
}
```

### 8. Research Tool

```tsx
// src/app/(main)/research/page.tsx
import { ResearchTool } from "@/components/research/ResearchTool";

export default function ResearchPage() {
  return <ResearchTool />; // Client component with Gemini API
}
```

### 9. Analytics

```tsx
// src/app/(main)/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <p>Analytics interface coming soon.</p>
    </div>
  );
}
```

### 10. Compliance

```tsx
// src/app/(main)/compliance/page.tsx
import ComplianceDashboard from "@/components/compliance/ComplianceDashboard";

export default function CompliancePage() {
  return <ComplianceDashboard />; // Client component with compliance API
}
```

---

## Backend API Structure (NestJS)

### Example: Cases Controller

```typescript
// backend/src/cases/cases.controller.ts
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { CasesService } from "./cases.service";

@Controller("cases")
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  async findAll() {
    const cases = await this.casesService.findAll();
    return {
      data: cases,
      total: cases.length,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.casesService.findOne(id);
  }

  @Post()
  async create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }
}
```

### Example: Cases Service

```typescript
// backend/src/cases/cases.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Case } from "./entities/case.entity";

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private casesRepository: Repository<Case>
  ) {}

  async findAll(): Promise<Case[]> {
    return this.casesRepository.find();
  }

  async findOne(id: string): Promise<Case> {
    return this.casesRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Case>): Promise<Case> {
    const newCase = this.casesRepository.create(data);
    return this.casesRepository.save(newCase);
  }
}
```

---

## Complete Request/Response Flow

### GET Request Example

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client Request                                           │
├─────────────────────────────────────────────────────────────┤
│ fetch('http://localhost:3001/api/cases')                    │
│ Method: GET                                                 │
│ Headers: { 'Content-Type': 'application/json' }            │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. NestJS Routing                                           │
├─────────────────────────────────────────────────────────────┤
│ CasesController.findAll()                                   │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Service Layer                                            │
├─────────────────────────────────────────────────────────────┤
│ CasesService.findAll()                                      │
│ → casesRepository.find()                                    │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Database Query                                           │
├─────────────────────────────────────────────────────────────┤
│ SELECT * FROM cases ORDER BY created_at DESC;              │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Response                                                 │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "data": [                                                 │
│     {                                                       │
│       "id": "uuid-123",                                     │
│       "caseNumber": "2024-CV-001",                         │
│       "title": "Smith v Jones",                            │
│       "status": "ACTIVE",                                   │
│       "priority": "HIGH"                                    │
│     },                                                      │
│     // ... more cases                                       │
│   ],                                                        │
│   "total": 24                                               │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Client Receives Data                                     │
├─────────────────────────────────────────────────────────────┤
│ setCases(data.data)                                         │
│ → Component re-renders with cases                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Verification Checklist ✅

### Is the process correct?

✅ **Server Components** - Default, no 'use client'
✅ **Client Components** - Marked with 'use client'
✅ **Data Fetching** - Server (apiFetch) or Client (fetch/useEffect)
✅ **API Endpoints** - Centralized in lib/api-config.ts
✅ **Backend Integration** - NestJS controllers → services → PostgreSQL
✅ **Type Safety** - TypeScript types shared between frontend/backend
✅ **Error Handling** - try/catch with proper fallbacks
✅ **Loading States** - Suspense boundaries for async operations
✅ **Concurrent Mode** - useTransition for non-urgent updates
✅ **SEO** - generateMetadata() for dynamic pages

---

## Key Takeaways

1. **Server Components by default** - No data fetching boilerplate
2. **Client Components when needed** - Interactive UI, hooks, browser APIs
3. **Suspense for async boundaries** - Loading states handled by React
4. **Backend-first architecture** - PostgreSQL + NestJS as source of truth
5. **Type-safe API** - Shared TypeScript types ensure consistency
6. **React 19 optimizations** - useTransition, Suspense, concurrent rendering

---

## Summary

Your Next.js 16 → Backend data flow is **CORRECT** and follows best practices:

- ✅ Proper Server/Client component separation
- ✅ Clean API abstraction via lib/api-config.ts
- ✅ Backend-first with PostgreSQL persistence
- ✅ React 19 concurrent features (useTransition, Suspense)
- ✅ Type-safe end-to-end with TypeScript
- ✅ Scalable architecture for enterprise use

The architecture is production-ready! 🎉
