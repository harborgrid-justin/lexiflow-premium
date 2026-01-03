# Enterprise Layout System Documentation

## Overview

The LexiFlow Next.js application features a comprehensive enterprise-grade layout system with:

- **Responsive Sidebar Navigation** - Collapsible navigation with nested menu items
- **Header Navigation** - Search, notifications, and user menu
- **Page Structure** - Breadcrumbs, headers, and content areas
- **Comprehensive UI Components** - 15+ reusable components
- **Dark Mode Support** - Full dark mode theming throughout

## Architecture

### Layout Hierarchy

```
Root Layout (app/layout.tsx)
    ├── Providers (Theme, Context)
    ├── Dashboard Layout (app/dashboard/layout.tsx)
    │   ├── Sidebar (Left Navigation)
    │   ├── Header (Top Navigation)
    │   ├── Main Content Area
    │   └── Right Sidebar (Optional)
    └── Children Routes
```

## Components

### Layout Components (`src/components/layout/`)

#### Header

- **File**: `Header.tsx`
- **Features**:
  - Global search
  - Notifications dropdown
  - User menu with profile
  - Responsive design
  - Dark mode support

#### Sidebar

- **File**: `Sidebar.tsx`
- **Features**:
  - Collapsible navigation sections
  - Active route highlighting
  - Nested menu items
  - User profile card
  - Logo branding

#### PageHeader

- **File**: `PageHeader.tsx`
- **Features**:
  - Page title and description
  - Breadcrumb navigation
  - Action buttons
  - Responsive layout

#### Breadcrumb

- **File**: `Breadcrumb.tsx`
- **Features**:
  - Navigation trail
  - Clickable links
  - Current page indicator

#### RightSidebar

- **File**: `RightSidebar.tsx`
- **Features**:
  - Contextual actions
  - Optional toggle state
  - Quick access buttons

### UI Components (`src/components/ui/`)

#### Data Display

- **StatCard** - Metric display with trends
- **Badge** - Status and category labels
- **Table** - Data table with sorting
- **Card/CardBody/CardHeader/CardFooter** - Content containers

#### Form Components

- **Button** - Multiple variants (primary, secondary, outline, ghost, danger)
- **Input** - Text, email, password, clearable inputs
- **Select** - Dropdown with options

#### Feedback

- **Alert** - Success, error, warning, info messages
- **Modal** - Dialog overlays
- **EmptyState** - Placeholder for no data

#### Navigation

- **Tabs** - Tabbed interface

#### Utility

- **Skeleton** - Loading placeholders
- **Pagination** (Coming soon)

## Usage Examples

### Using the Dashboard Layout

```tsx
// Any route under /dashboard automatically gets the layout
// src/app/dashboard/page.tsx

import { PageHeader } from "@/components/layout";
import { StatCard, Button } from "@/components/ui";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your practice"
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={<Button>New Case</Button>}
      />

      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Active Cases" value={24} trend="up" trendValue="+2" />
      </div>
    </>
  );
}
```

### Using UI Components

```tsx
import { Button, Input, Select, Badge, Card } from "@/components/ui";

export function MyComponent() {
  return (
    <Card>
      <CardBody className="space-y-4">
        <Input label="Name" placeholder="Enter name" />

        <Select
          label="Category"
          options={[
            { value: "1", label: "Option 1" },
            { value: "2", label: "Option 2" },
          ]}
        />

        <div className="flex gap-2">
          <Badge variant="primary">Active</Badge>
          <Badge variant="warning">Pending</Badge>
        </div>

        <Button variant="primary">Save</Button>
      </CardBody>
    </Card>
  );
}
```

### Using Alerts and Modals

```tsx
import { Alert, Modal, Button } from "@/components/ui";
import { useState } from "react";

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Alert variant="success" title="Success">
        Your changes were saved.
      </Alert>

      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>

      <Modal
        isOpen={isOpen}
        title="Confirm"
        onClose={() => setIsOpen(false)}
        footer={
          <>
            <Button variant="secondary">Cancel</Button>
            <Button>Confirm</Button>
          </>
        }
      >
        <p>Are you sure?</p>
      </Modal>
    </>
  );
}
```

## Styling System

### Color Variants

- **Primary**: Blue (brand color)
- **Success**: Emerald (positive actions)
- **Warning**: Amber (caution)
- **Danger**: Rose (destructive actions)
- **Info**: Indigo (informational)

### Dark Mode

All components support dark mode via Tailwind CSS:

```tsx
// Works automatically with prefers-color-scheme
<div className="bg-white dark:bg-slate-900">
  Light mode: white Dark mode: dark slate
</div>
```

## Navigation Structure

The sidebar navigation includes these main sections:

1. **Dashboard** - Overview metrics
2. **Case Management** - Cases, matters, parties
3. **Documents & Discovery** - Documents, docket, discovery, evidence
4. **Legal Operations** - Research, calendar, compliance
5. **Firm Operations** - Billing, contacts, analytics
6. **Settings** - Application settings

## Responsive Design

- **Mobile** (`< 640px`): Sidebar hidden, hamburger menu in header
- **Tablet** (`640px - 1024px`): Sidebar visible, full navigation
- **Desktop** (`> 1024px`): Full layout with all features

## Component Showcase

Visit `/components` to see all components in action:

- Button variants and sizes
- Card layouts
- Form components
- Alerts and modals
- Data tables
- Badges
- Loading skeletons
- Empty states

## Future Enhancements

- [ ] Dropdown menus
- [ ] Pagination component
- [ ] Tooltip component
- [ ] Progress bars
- [ ] Breadcrumb with dropdown
- [ ] Sidebar mobile menu animation
- [ ] Custom scrollbar styling
- [ ] Keyboard navigation improvements

## File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Main dashboard layout
│   │   └── page.tsx            # Dashboard content
│   ├── components/
│   │   └── page.tsx            # Component showcase
│   └── layout.tsx              # Root layout
├── components/
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── RightSidebar.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── index.ts            # Barrel export
│   └── ui/                     # UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Alert.tsx
│       ├── Modal.tsx
│       ├── ... (other components)
│       └── index.ts            # Barrel export
└── providers/
    └── ThemeContext.tsx        # Theme management
```

## Best Practices

1. **Import from barrel exports**:

   ```tsx
   // ✅ Good
   import { Button, Card } from "@/components/ui";

   // ❌ Avoid
   import { Button } from "@/components/ui/Button";
   ```

2. **Use semantic colors**:

   ```tsx
   // ✅ Good
   <Button variant="danger">Delete</Button>

   // ❌ Avoid
   <Button className="bg-red-600">Delete</Button>
   ```

3. **Compose layouts**:

   ```tsx
   // ✅ Good - Compose components
   <PageHeader title="..." description="..." />
   <Card>
     <CardBody>...</CardBody>
   </Card>

   // ❌ Avoid - Building from scratch
   <div className="...">
     {/* Complex styling */}
   </div>
   ```

## Accessibility

- All interactive elements are keyboard navigable
- ARIA labels for screen readers
- Semantic HTML structure
- Color contrast compliant
- Focus indicators visible

## Performance

- Components are memoized where appropriate
- Lazy loading for modals and overlays
- Efficient rendering of large tables
- Optimized CSS selectors

## Maintenance

- Keep components focused and single-responsibility
- Update colors in `theme/tokens.ts`
- Document new components in this file
- Add examples to `/components` showcase
- Test dark mode support
- Verify mobile responsiveness
