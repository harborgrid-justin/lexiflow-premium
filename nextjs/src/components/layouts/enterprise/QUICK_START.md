# Quick Start Guide - Enterprise Legal Layouts

## Installation

```bash
# All shadcn/ui components are already installed
# Just import and use the layouts
```

## Import

```typescript
import {
  DocumentEditorLayout,
  MatterIntakeLayout,
  BillingLayout,
  WarRoomLayout,
  ResearchLayout,
} from "@/components/layouts/enterprise";
```

---

## 1. Document Editor - Quickest Implementation

```tsx
"use client";

import { DocumentEditorLayout } from "@/components/layouts/enterprise";
import { useState } from "react";

export default function DocumentPage() {
  const [content, setContent] = useState("");

  return (
    <DocumentEditorLayout
      document={{
        id: "1",
        title: "Motion to Dismiss",
        content: content,
        wordCount: content.split(/\s+/).length,
        readingTimeMinutes: 5,
      }}
      templates={[]}
      variables={[]}
      onSave={async (content, vars) => {
        setContent(content);
        console.log("Saved:", content, vars);
      }}
    />
  );
}
```

---

## 2. Matter Intake - With Default Steps

```tsx
"use client";

import { MatterIntakeLayout, createDefaultIntakeSteps } from "@/components/layouts/enterprise";
import { useState } from "react";

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});

  return (
    <MatterIntakeLayout
      steps={createDefaultIntakeSteps()}
      currentStep={step}
      formData={data}
      onStepChange={setStep}
      onFieldChange={(name, value) => setData({ ...data, [name]: value })}
      onSubmit={async () => {
        console.log("Submit:", data);
      }}
    />
  );
}
```

---

## 3. Billing - Minimal Setup

```tsx
"use client";

import { BillingLayout } from "@/components/layouts/enterprise";
import { useState } from "react";

export default function BillingPage() {
  const [entries, setEntries] = useState([]);
  const [timer, setTimer] = useState(null);

  return (
    <BillingLayout
      entries={entries}
      runningTimer={timer}
      matters={[
        { id: "1", name: "Smith v. Jones", client: "Smith", defaultRate: 350 }
      ]}
      onTimerToggle={async (t) => setTimer(t)}
      onEntrySubmit={async (entry) => {
        setEntries([...entries, { ...entry, id: Date.now().toString() }]);
      }}
      onEntryUpdate={async () => {}}
      onEntryDelete={async (ids) => {
        setEntries(entries.filter(e => !ids.includes(e.id)));
      }}
    />
  );
}
```

---

## 4. War Room - Basic Trial Workspace

```tsx
"use client";

import { WarRoomLayout } from "@/components/layouts/enterprise";
import { useState } from "react";

export default function WarRoomPage() {
  const [presentation, setPresentation] = useState(false);

  return (
    <WarRoomLayout
      exhibits={[
        {
          id: "1",
          number: "P-001",
          title: "Contract",
          description: "Employment agreement",
          fileType: "pdf",
          status: "admitted",
          party: "plaintiff",
          tags: ["contract"],
        }
      ]}
      witnesses={[]}
      notes={[]}
      presentationMode={presentation}
      onPresentationModeToggle={() => setPresentation(!presentation)}
    />
  );
}
```

---

## 5. Research - Simple Search Interface

```tsx
"use client";

import { ResearchLayout } from "@/components/layouts/enterprise";
import { useState } from "react";

export default function ResearchPage() {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  return (
    <ResearchLayout
      searchResults={results}
      selectedDoc={selected}
      annotations={[]}
      availableJurisdictions={["Federal", "California"]}
      availableCourts={["Supreme Court", "9th Circuit"]}
      onSearch={async (query, filters) => {
        // Fetch search results
        console.log("Search:", query, filters);
      }}
      onDocumentSelect={(id) => {
        setSelected(results.find(r => r.id === id));
      }}
      onAnnotationAdd={async () => {}}
      onAnnotationDelete={async () => {}}
    />
  );
}
```

---

## Common Patterns

### With React Query

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";

function Page() {
  const { data } = useQuery({
    queryKey: ["data"],
    queryFn: fetchData,
  });

  const mutation = useMutation({
    mutationFn: saveData,
  });

  return <Layout data={data} onSave={mutation.mutate} />;
}
```

### With Server Actions (Next.js 14+)

```tsx
import { saveDocument } from "@/app/actions";

function Page() {
  return (
    <DocumentEditorLayout
      {...props}
      onSave={async (content) => {
        "use server";
        await saveDocument(content);
      }}
    />
  );
}
```

### With Toast Notifications

```tsx
import { toast } from "sonner";

function Page() {
  return (
    <Layout
      {...props}
      onSave={async (data) => {
        try {
          await saveData(data);
          toast.success("Saved successfully");
        } catch (error) {
          toast.error("Failed to save");
        }
      }}
    />
  );
}
```

---

## Keyboard Shortcuts

| Layout | Shortcut | Action |
|--------|----------|--------|
| Document Editor | Ctrl+S | Save document |
| War Room | F11 | Toggle presentation mode |
| War Room | Arrow Left/Right | Navigate exhibits |
| War Room | Ctrl+H | Highlight tool |
| War Room | Ctrl+N | Note tool |
| Research | Ctrl+K | Focus search |
| Research | Ctrl+C | Copy citation |

---

## TypeScript Tips

### Get prop types

```typescript
import type { DocumentEditorLayoutProps } from "@/components/layouts/enterprise";

const props: DocumentEditorLayoutProps = {
  // TypeScript will autocomplete and validate
};
```

### Extend types

```typescript
import type { TimeEntry } from "@/components/layouts/enterprise";

interface ExtendedTimeEntry extends TimeEntry {
  customField: string;
}
```

---

## Common Issues

### "Module not found"
- Ensure path aliases are configured in tsconfig.json
- Check that shadcn/ui components are installed

### "Type error in props"
- All props must match the interface exactly
- Use TypeScript's autocomplete to see required props

### "Styles not applied"
- Ensure Tailwind CSS is configured
- Check that shadcn/ui CSS variables are set in globals.css

---

## Next Steps

1. ✅ Copy a quick start example
2. ✅ Replace placeholder data with real API calls
3. ✅ Add error handling and loading states
4. ✅ Test keyboard shortcuts
5. ✅ Add authentication/authorization
6. ✅ Deploy and gather user feedback

---

## Need Help?

- 📖 Read the comprehensive [README.md](./README.md)
- 📋 Check [LEGAL_WORKFLOW_LAYOUTS.md](./LEGAL_WORKFLOW_LAYOUTS.md)
- 🔍 Review the TypeScript types in each layout file
- 📦 Reference [shadcn/ui docs](https://ui.shadcn.com/)
