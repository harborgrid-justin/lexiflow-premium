# Enterprise Legal Workflow Layouts

Production-ready, specialized layouts for complex legal workflows. Built with shadcn/ui components, fully typed with TypeScript, and optimized for legal professionals.

## Layouts

### 1. DocumentEditorLayout

A three-panel document editor with template selection, rich text editing, and variable management.

**Features:**
- Template library with search and categorization
- Auto-save with visual indicator
- Word count and reading time calculation
- Variable autocomplete and insertion
- Export to DOCX/PDF
- Keyboard shortcuts (Ctrl+S to save)
- Real-time content updates

**Usage:**

```tsx
import { DocumentEditorLayout } from "@/components/layouts/enterprise";

function DocumentPage() {
  const [document, setDocument] = useState({
    id: "doc-1",
    title: "Motion to Dismiss",
    content: "Initial content...",
    wordCount: 0,
    readingTimeMinutes: 0,
  });

  const templates = [
    {
      id: "template-1",
      name: "Motion to Dismiss",
      category: "Motion",
      description: "Standard motion to dismiss template",
      variables: [
        {
          id: "var-1",
          name: "court_name",
          type: "text",
          value: "Superior Court",
          description: "Name of the court",
        },
      ],
      content: "Template content...",
    },
  ];

  const variables = [
    {
      id: "var-1",
      name: "client_name",
      type: "text",
      category: "Client",
      description: "Client's full legal name",
    },
    {
      id: "var-2",
      name: "case_number",
      type: "text",
      category: "Case",
      description: "Court case number",
    },
  ];

  const handleSave = async (content: string, variableValues: Record<string, string>) => {
    await fetch("/api/documents/save", {
      method: "POST",
      body: JSON.stringify({ content, variableValues }),
    });
  };

  const handleExport = async (format: "docx" | "pdf") => {
    const blob = await fetch(`/api/documents/${document.id}/export?format=${format}`).then(r => r.blob());
    // Handle download
  };

  return (
    <DocumentEditorLayout
      document={document}
      templates={templates}
      variables={variables}
      onSave={handleSave}
      onExport={handleExport}
      autoSaveInterval={30000} // 30 seconds
    />
  );
}
```

---

### 2. MatterIntakeLayout

A multi-step wizard for client and matter intake with validation, draft saving, and review.

**Features:**
- Progressive step navigation with visual indicators
- Field-level and step-level validation
- Save as draft functionality
- Comprehensive review step before submission
- Real-time validation feedback
- Keyboard navigation (Next/Previous)

**Usage:**

```tsx
import { MatterIntakeLayout, createDefaultIntakeSteps } from "@/components/layouts/enterprise";

function IntakePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Use default steps or create custom ones
  const steps = createDefaultIntakeSteps();

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSaveDraft = async () => {
    await fetch("/api/intake/drafts", {
      method: "POST",
      body: JSON.stringify({ formData, currentStep }),
    });
  };

  const handleSubmit = async () => {
    await fetch("/api/intake/submit", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  };

  return (
    <MatterIntakeLayout
      steps={steps}
      currentStep={currentStep}
      formData={formData}
      onStepChange={setCurrentStep}
      onFieldChange={handleFieldChange}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmit}
    />
  );
}
```

**Custom Steps Example:**

```tsx
const customSteps: IntakeStep[] = [
  {
    id: "client-info",
    title: "Client Information",
    description: "Capture client details",
    icon: User,
    fields: [
      {
        id: "name",
        name: "clientName",
        label: "Client Name",
        type: "text",
        required: true,
        validation: (value) => {
          return value.length >= 2 ? null : "Name must be at least 2 characters";
        },
      },
    ],
    validationRules: [
      {
        field: "clientEmail",
        validate: (value, formData) => {
          // Custom cross-field validation
          return null;
        },
      },
    ],
  },
];
```

---

### 3. BillingLayout

Time tracking and billing interface with timer, manual entry, and bulk operations.

**Features:**
- Running timer with elapsed time display
- Manual time entry form
- Quick entry templates for common tasks
- Tabbed views (Today, This Week, All)
- Bulk selection and operations
- Real-time totals calculation
- Billable/non-billable tracking

**Usage:**

```tsx
import { BillingLayout } from "@/components/layouts/enterprise";

function BillingPage() {
  const [runningTimer, setRunningTimer] = useState<RunningTimer | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  const matters = [
    {
      id: "matter-1",
      name: "Smith v. Jones",
      client: "John Smith",
      defaultRate: 350,
    },
  ];

  const quickTemplates = [
    {
      id: "template-1",
      label: "Research",
      description: "Legal research",
      hours: 0.5,
      activityCode: "L110",
    },
    {
      id: "template-2",
      label: "Client Call",
      description: "Client consultation",
      hours: 0.25,
      activityCode: "C100",
    },
  ];

  const handleTimerToggle = async (timer: Partial<RunningTimer> | null) => {
    setRunningTimer(timer as RunningTimer | null);
  };

  const handleEntrySubmit = async (entry: Partial<TimeEntry>) => {
    const newEntry = await fetch("/api/time-entries", {
      method: "POST",
      body: JSON.stringify(entry),
    }).then(r => r.json());

    setEntries(prev => [...prev, newEntry]);
  };

  const handleBulkSubmit = async (ids: string[]) => {
    await fetch("/api/time-entries/bulk-submit", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  };

  return (
    <BillingLayout
      entries={entries}
      runningTimer={runningTimer}
      matters={matters}
      quickEntryTemplates={quickTemplates}
      onTimerToggle={handleTimerToggle}
      onEntrySubmit={handleEntrySubmit}
      onEntryUpdate={async (id, updates) => {
        // Update entry
      }}
      onEntryDelete={async (ids) => {
        setEntries(prev => prev.filter(e => !ids.includes(e.id)));
      }}
      onBulkSubmit={handleBulkSubmit}
    />
  );
}
```

---

### 4. WarRoomLayout

Trial preparation workspace with exhibit management, witness tracking, and presentation mode.

**Features:**
- Full-screen presentation mode (F11)
- Collapsible side panels
- Exhibit and witness management
- Annotation and highlighting tools
- Zoom and rotation controls
- Keyboard navigation (Arrow keys)
- Status tracking (marked, offered, admitted, excluded)

**Usage:**

```tsx
import { WarRoomLayout } from "@/components/layouts/enterprise";

function WarRoomPage() {
  const [presentationMode, setPresentationMode] = useState(false);

  const exhibits = [
    {
      id: "ex-1",
      number: "P-001",
      title: "Employment Contract",
      description: "Executed employment agreement dated Jan 1, 2024",
      fileType: "pdf",
      status: "admitted",
      party: "plaintiff",
      tags: ["contract", "employment"],
      pages: 12,
    },
  ];

  const witnesses = [
    {
      id: "wit-1",
      name: "Dr. Jane Smith",
      type: "expert",
      party: "plaintiff",
      status: "testified",
      expectedDuration: 120,
      keyTopics: ["medical malpractice", "standard of care"],
    },
  ];

  const notes = [
    {
      id: "note-1",
      exhibitId: "ex-1",
      type: "note",
      content: "Key provision on page 3",
      color: "#FFD700",
      createdAt: new Date(),
      createdBy: "Attorney Smith",
    },
  ];

  return (
    <WarRoomLayout
      exhibits={exhibits}
      witnesses={witnesses}
      notes={notes}
      presentationMode={presentationMode}
      onPresentationModeToggle={() => setPresentationMode(!presentationMode)}
      onExhibitSelect={(id) => console.log("Selected exhibit:", id)}
      onExhibitStatusChange={async (id, status) => {
        await fetch(`/api/exhibits/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
      }}
      onAnnotationAdd={async (annotation) => {
        // Add annotation
      }}
    />
  );
}
```

---

### 5. ResearchLayout

Legal research interface with advanced search, Shepardization, and citation management.

**Features:**
- Advanced search with multiple filters
- Jurisdiction, court, and date range filtering
- Shepard's/KeyCite status indicators
- Citation formatting (Bluebook, ALWD, Universal)
- Annotation and note-taking
- Save to matter functionality
- Keyboard shortcuts (Ctrl+K for search, Ctrl+C to copy citation)

**Usage:**

```tsx
import { ResearchLayout } from "@/components/layouts/enterprise";

function ResearchPage() {
  const [searchResults, setSearchResults] = useState<LegalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const handleSearch = async (query: string, filters: SearchFilter) => {
    const results = await fetch("/api/research/search", {
      method: "POST",
      body: JSON.stringify({ query, filters }),
    }).then(r => r.json());

    setSearchResults(results);
  };

  const handleShepardize = async (documentId: string) => {
    const status = await fetch(`/api/research/shepardize/${documentId}`)
      .then(r => r.json());

    // Update document with Shepard's status
  };

  const handleCitationCopy = (citation: string) => {
    navigator.clipboard.writeText(citation);
    // Show toast notification
  };

  return (
    <ResearchLayout
      searchResults={searchResults}
      selectedDoc={selectedDoc}
      annotations={annotations}
      availableJurisdictions={["Federal", "California", "New York"]}
      availableCourts={["Supreme Court", "9th Circuit", "District Court"]}
      onSearch={handleSearch}
      onDocumentSelect={(id) => {
        const doc = searchResults.find(d => d.id === id);
        setSelectedDoc(doc || null);
      }}
      onAnnotationAdd={async (annotation) => {
        const newAnnotation = {
          ...annotation,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        setAnnotations(prev => [...prev, newAnnotation]);
      }}
      onAnnotationDelete={(id) => {
        setAnnotations(prev => prev.filter(a => a.id !== id));
      }}
      onShepardize={handleShepardize}
      onCitationCopy={handleCitationCopy}
    />
  );
}
```

---

## Common Patterns

### State Management

All layouts are controlled components that require state management:

```tsx
// Example with React Query
import { useQuery, useMutation } from "@tanstack/react-query";

function DocumentEditorPage() {
  const { data: document } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocument(documentId),
  });

  const saveMutation = useMutation({
    mutationFn: saveDocument,
    onSuccess: () => {
      // Show success toast
    },
  });

  return (
    <DocumentEditorLayout
      document={document}
      onSave={(content, variables) => saveMutation.mutate({ content, variables })}
      // ...
    />
  );
}
```

### Keyboard Shortcuts

Each layout implements relevant keyboard shortcuts:

- **Document Editor**: Ctrl+S (save)
- **War Room**: F11 (presentation mode), Arrow keys (navigate)
- **Research**: Ctrl+K (search), Ctrl+C (copy citation)
- **Billing**: (timer shortcuts can be customized)

### Responsive Behavior

Layouts adapt to different screen sizes:

- **Desktop**: Full three-panel layouts with all features
- **Tablet**: Collapsible side panels
- **Mobile**: Stack panels vertically (some layouts may need custom mobile views)

### Error Handling

All async operations should handle errors gracefully:

```tsx
const handleSave = async (content: string) => {
  try {
    await saveDocument(content);
    toast.success("Document saved");
  } catch (error) {
    toast.error("Failed to save document");
    console.error(error);
  }
};
```

## Customization

### Theming

Layouts use shadcn/ui components, which inherit from your theme:

```css
/* globals.css */
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... other CSS variables */
}
```

### Custom Renderers

Layouts accept `children` for custom content rendering:

```tsx
<DocumentEditorLayout {...props}>
  <CustomRichTextEditor />
</DocumentEditorLayout>
```

### Component Composition

Combine layouts with other components:

```tsx
<AppShell>
  <Header />
  <Sidebar />
  <Main>
    <DocumentEditorLayout {...props} />
  </Main>
</AppShell>
```

## Performance Considerations

1. **Virtualization**: For long lists (search results, time entries), consider using `react-virtual`
2. **Debouncing**: Search inputs and auto-save should be debounced
3. **Memoization**: Use `React.memo` for complex child components
4. **Code Splitting**: Lazy load layouts that aren't immediately needed

```tsx
const DocumentEditorLayout = lazy(() =>
  import("@/components/layouts/enterprise").then(m => ({
    default: m.DocumentEditorLayout
  }))
);
```

## Accessibility

All layouts follow WCAG 2.1 AA standards:

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly
- Color contrast compliance

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Part of LexiFlow Premium - Proprietary and Confidential
