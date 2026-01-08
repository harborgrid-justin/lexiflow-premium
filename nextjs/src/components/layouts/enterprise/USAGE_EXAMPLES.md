# Enterprise Layouts - Complete Usage Examples

This guide demonstrates real-world usage of all four enterprise layouts in a legal tech application.

## Table of Contents

1. [ListLayout Examples](#listlayout-examples)
2. [DetailLayout Examples](#detaillayout-examples)
3. [SplitViewLayout Examples](#splitviewlayout-examples)
4. [FormLayout Examples](#formlayout-examples)
5. [Complete Workflows](#complete-workflows)

---

## ListLayout Examples

### Example 1: Cases List Page

```tsx
// app/(main)/cases/page.tsx
"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ListLayout } from "@/components/layouts/enterprise"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/shadcn/badge"
import { Button } from "@/components/ui/shadcn/button"
import { Plus, Archive, Trash, Download } from "lucide-react"
import { toast } from "sonner"

interface Case {
  id: string
  caseNumber: string
  title: string
  clientName: string
  status: "active" | "closed" | "pending"
  assignedTo: string
  filingDate: Date
  nextHearing?: Date
}

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Define columns
  const columns: ColumnDef<Case>[] = [
    {
      accessorKey: "caseNumber",
      header: "Case #",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.caseNumber}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "clientName",
      header: "Client",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge
            variant={
              status === "active"
                ? "default"
                : status === "closed"
                ? "secondary"
                : "outline"
            }
          >
            {status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
    },
  ]

  // Export handlers
  const handleExportCSV = useCallback((data: Case[]) => {
    const csv = convertToCSV(data)
    downloadFile(csv, "cases.csv", "text/csv")
    toast.success("Cases exported to CSV")
  }, [])

  const handleExportPDF = useCallback((data: Case[]) => {
    generatePDF(data, "cases.pdf")
    toast.success("Cases exported to PDF")
  }, [])

  // Bulk actions
  const handleBulkArchive = useCallback(async (selectedCases: Case[]) => {
    try {
      await archiveCases(selectedCases.map((c) => c.id))
      toast.success(`${selectedCases.length} cases archived`)
      // Refresh data
    } catch (error) {
      toast.error("Failed to archive cases")
    }
  }, [])

  const handleBulkDelete = useCallback(async (selectedCases: Case[]) => {
    if (
      confirm(`Are you sure you want to delete ${selectedCases.length} cases?`)
    ) {
      try {
        await deleteCases(selectedCases.map((c) => c.id))
        toast.success(`${selectedCases.length} cases deleted`)
        // Refresh data
      } catch (error) {
        toast.error("Failed to delete cases")
      }
    }
  }, [])

  return (
    <ListLayout
      title="Cases"
      description="Manage all legal cases and matters"
      data={cases}
      columns={columns}
      isLoading={isLoading}
      searchableColumn="caseNumber"
      searchPlaceholder="Search by case number or title..."
      filters={[
        {
          id: "status",
          title: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Closed", value: "closed" },
            { label: "Pending", value: "pending" },
          ],
        },
      ]}
      actions={[
        {
          label: "New Case",
          onClick: () => router.push("/cases/create"),
          icon: Plus,
        },
      ]}
      bulkActions={[
        {
          label: "Archive",
          onClick: handleBulkArchive,
          icon: Archive,
        },
        {
          label: "Delete",
          onClick: handleBulkDelete,
          variant: "destructive",
          icon: Trash,
        },
      ]}
      onExportCSV={handleExportCSV}
      onExportPDF={handleExportPDF}
      onRowClick={(row) => router.push(`/cases/${row.id}`)}
      initialPageSize={20}
      enableStickyHeader
    />
  )
}
```

---

## DetailLayout Examples

### Example 2: Case Detail Page

```tsx
// app/(main)/cases/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DetailLayout } from "@/components/layouts/enterprise"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import {
  FileText,
  File,
  Clock,
  DollarSign,
  User,
  Building,
  Calendar,
  Edit,
  Archive,
} from "lucide-react"

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCase(params.id)
  }, [params.id])

  return (
    <DetailLayout
      title={`Case ${caseData?.caseNumber}`}
      subtitle={caseData?.title}
      status={{
        label: caseData?.status || "Active",
        variant: caseData?.status === "active" ? "default" : "secondary",
      }}
      breadcrumbs={[
        { label: "Cases", href: "/cases" },
        { label: caseData?.caseNumber || "Loading..." },
      ]}
      tabs={[
        {
          value: "overview",
          label: "Overview",
          icon: FileText,
          content: <CaseOverview case={caseData} />,
        },
        {
          value: "documents",
          label: "Documents",
          icon: File,
          badge: caseData?.documentCount,
          content: <DocumentsList caseId={params.id} />,
        },
        {
          value: "activity",
          label: "Activity",
          icon: Clock,
          content: <ActivityFeed caseId={params.id} />,
        },
        {
          value: "financials",
          label: "Financials",
          icon: DollarSign,
          content: <CaseFinancials caseId={params.id} />,
        },
      ]}
      actions={[
        {
          label: "Edit Case",
          onClick: () => router.push(`/cases/${params.id}/edit`),
          icon: Edit,
        },
        {
          label: "Archive",
          onClick: () => handleArchive(params.id),
          variant: "destructive",
          icon: Archive,
        },
      ]}
      metadata={[
        {
          label: "Client",
          value: caseData?.clientName,
          icon: User,
        },
        {
          label: "Assigned To",
          value: caseData?.assignedTo,
          icon: User,
        },
        {
          label: "Court",
          value: caseData?.court,
          icon: Building,
        },
        {
          label: "Filed Date",
          value: formatDate(caseData?.filingDate),
          icon: Calendar,
        },
        {
          label: "Next Hearing",
          value: formatDate(caseData?.nextHearing),
          icon: Calendar,
        },
      ]}
      sidebarContent={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseTimeline caseId={params.id} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Related Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <RelatedCasesList caseId={params.id} />
            </CardContent>
          </Card>
        </>
      }
      onBack={() => router.push("/cases")}
      isLoading={isLoading}
    />
  )
}
```

---

## SplitViewLayout Examples

### Example 3: Documents Split View

```tsx
// app/(main)/documents/page.tsx
"use client"

import { useState } from "react"
import { SplitViewLayout, SplitViewEmptyState } from "@/components/layouts/enterprise"
import { FileText } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: number
  lastModified: Date
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <SplitViewLayout
      listComponent={
        <div className="h-full overflow-y-auto p-4">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc)
                  setIsDrawerOpen(true)
                }}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  selectedDoc?.id === doc.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(doc.size)} • {formatDate(doc.lastModified)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      }
      detailComponent={
        selectedDoc ? (
          <div className="h-full p-6">
            <DocumentViewer document={selectedDoc} />
          </div>
        ) : (
          <SplitViewEmptyState
            title="No document selected"
            description="Select a document from the list to view details"
            icon={FileText}
          />
        )
      }
      defaultSplit={400}
      minPanelSize={300}
      maxPanelSize={600}
      storageKey="documents-split-view"
      mobileDrawer={true}
      isDetailOpen={isDrawerOpen}
      onDetailClose={() => setIsDrawerOpen(false)}
      detailTitle={selectedDoc?.name || "Document Details"}
    />
  )
}
```

---

## FormLayout Examples

### Example 4: Multi-Step Case Creation

```tsx
// app/(main)/cases/create/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FormLayout } from "@/components/layouts/enterprise"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/shadcn/form"
import { Input } from "@/components/ui/shadcn/input"
import { Textarea } from "@/components/ui/shadcn/textarea"
import { Select } from "@/components/ui/shadcn/select"

const caseSchema = z.object({
  caseNumber: z.string().min(1, "Case number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  assignedTo: z.string().min(1, "Assignment is required"),
  court: z.string().min(1, "Court is required"),
  filingDate: z.date(),
})

type CaseFormData = z.infer<typeof caseSchema>

export default function CreateCasePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  
  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      caseNumber: "",
      title: "",
      description: "",
      clientId: "",
      assignedTo: "",
      court: "",
    },
  })

  const onSubmit = async (data: CaseFormData) => {
    try {
      await createCase(data)
      toast.success("Case created successfully")
      router.push("/cases")
    } catch (error) {
      toast.error("Failed to create case")
    }
  }

  return (
    <FormLayout
      title="Create New Case"
      description="Enter case details and client information"
      steps={[
        {
          id: "basic",
          label: "Basic Info",
          description: "Case number, title, and description",
        },
        {
          id: "parties",
          label: "Parties & Court",
          description: "Client, court, and assignment",
        },
        {
          id: "dates",
          label: "Important Dates",
          description: "Filing date and deadlines",
        },
        {
          id: "review",
          label: "Review",
          description: "Review and create case",
        },
      ]}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={() => router.push("/cases")}
      isDirty={form.formState.isDirty}
      isSubmitting={form.formState.isSubmitting}
      errors={
        Object.entries(form.formState.errors).map(([field, error]) => ({
          field,
          message: error?.message || "Invalid value",
        }))
      }
    >
      <Form {...form}>
        {currentStep === 0 && (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="caseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Number</FormLabel>
                  <FormControl>
                    <Input placeholder="2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Smith v. Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the case..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Client, Court, Assignment fields */}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Date fields */}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Review summary */}
          </div>
        )}
      </Form>
    </FormLayout>
  )
}
```

---

## Complete Workflows

### Workflow: Case Management

This demonstrates how all four layouts work together in a complete user flow:

1. **List View** - User browses cases (`/cases`)
   - Uses `ListLayout` with filters, search, bulk actions
   - Clicks on a case to view details

2. **Detail View** - User views case details (`/cases/[id]`)
   - Uses `DetailLayout` with tabs, metadata, actions
   - Clicks "Edit" to modify case

3. **Form View** - User edits case (`/cases/[id]/edit`)
   - Uses `FormLayout` with validation, unsaved changes warning
   - Saves and returns to detail view

4. **Split View** - User manages documents (`/cases/[id]/documents`)
   - Uses `SplitViewLayout` for quick document preview
   - Selects documents from list, previews in right panel

### Integration Example

```tsx
// app/(main)/cases/[id]/documents/page.tsx
"use client"

import { SplitViewLayout } from "@/components/layouts/enterprise"

export default function CaseDocumentsPage({ params }: { params: { id: string } }) {
  // This page is nested under DetailLayout via URL structure
  // /cases/[id] uses DetailLayout
  // /cases/[id]/documents uses SplitViewLayout inside the "Documents" tab
  
  return (
    <SplitViewLayout
      listComponent={<DocumentList caseId={params.id} />}
      detailComponent={<DocumentPreview />}
      storageKey={`case-${params.id}-documents-split`}
    />
  )
}
```

---

## Best Practices

### 1. Loading States

Always handle loading states properly:

```tsx
{isLoading ? (
  <ListLayoutSkeleton />
) : (
  <ListLayout data={data} columns={columns} />
)}
```

### 2. Error Handling

Show errors to users:

```tsx
<ListLayout
  data={cases}
  columns={columns}
  error={error ? "Failed to load cases. Please try again." : undefined}
/>
```

### 3. Empty States

Provide helpful empty states:

```tsx
<ListLayout
  data={[]}
  emptyState={
    <div className="text-center py-12">
      <FileX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">No cases yet</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Get started by creating your first case
      </p>
      <Button onClick={() => router.push("/cases/create")} className="mt-4">
        Create Case
      </Button>
    </div>
  }
/>
```

### 4. Form Validation

Use proper validation with react-hook-form + zod:

```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
})

<FormLayout
  errors={Object.entries(form.formState.errors).map(([field, error]) => ({
    field,
    message: error?.message || "Invalid value",
  }))}
/>
```

### 5. Mobile Responsiveness

Test on mobile devices. All layouts are responsive:
- ListLayout: Table becomes scrollable
- DetailLayout: Sidebar stacks below content
- SplitViewLayout: Uses drawer on mobile
- FormLayout: Single column on mobile

---

## Common Patterns

### Pattern 1: Server Components + Client Layouts

```tsx
// app/(main)/cases/page.tsx (Server Component)
import { Suspense } from "react"
import CasesList from "./cases-list"

export default async function CasesPage() {
  // Server-side data fetching
  const initialCases = await getCases()

  return (
    <Suspense fallback={<ListLayoutSkeleton />}>
      <CasesList initialData={initialCases} />
    </Suspense>
  )
}

// cases-list.tsx (Client Component)
"use client"

import { ListLayout } from "@/components/layouts/enterprise"

export default function CasesList({ initialData }: { initialData: Case[] }) {
  const [cases, setCases] = useState(initialData)
  
  return <ListLayout data={cases} columns={columns} />
}
```

### Pattern 2: URL State Management

```tsx
"use client"

import { useSearchParams, useRouter } from "next/navigation"

export default function CasesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  return (
    <DetailLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => {
        router.push(`?tab=${tab}`)
      }}
    />
  )
}
```

---

This completes the usage examples. All layouts are production-ready and fully typed.
