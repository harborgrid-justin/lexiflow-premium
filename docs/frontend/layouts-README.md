# Enterprise Layout System

## Overview
This directory contains a comprehensive collection of **reusable layout components** designed for enterprise applications. Layouts are purely structural components that define spatial arrangement without business logic.

## Layout Philosophy

### Pure Structural Components
- **Layouts = Structure + Spacing + Responsiveness**
- No business logic or state management
- Purely presentational and composable
- Theme-aware where appropriate

### Component Hierarchy
```
Layouts (Structure)
  ↓
Pages (Composition + Routing)
  ↓
Features (Business Logic)
  ↓
Organisms (Complex Components)
  ↓
Molecules & Atoms (UI Primitives)
```

## Layout Categories

### 1. Application Shells (1 layout)
Full-page layouts that define the entire application structure.

#### **AppShellLayout**
- **Purpose**: Main application container with sidebar, header, and content
- **Use Case**: Root application wrapper
- **Features**: Time tracking, fetching indicator, viewport handling
- **Props**: `sidebar`, `headerContent`, `children`, `activeView`, `selectedCaseId`

```tsx
import { AppShellLayout } from '@/components/layouts';

<AppShellLayout
  sidebar={<Sidebar />}
  headerContent={<TopBar />}
  activeView="dashboard"
>
  {children}
</AppShellLayout>
```

---

### 2. Page Layouts (4 layouts)
Page-level layouts for different content types.

#### **PageContainerLayout**
- **Purpose**: Simple centered page with max-width
- **Use Case**: Standard content pages
- **Features**: Responsive max-width, consistent spacing
- **Props**: `children`, `className`, `maxWidth` (sm → 7xl)

```tsx
import { PageContainerLayout } from '@/components/layouts';

<PageContainerLayout maxWidth="5xl">
  <ContentComponent />
</PageContainerLayout>
```

#### **TabbedPageLayout**
- **Purpose**: Page with parent/child tab navigation
- **Use Case**: Complex multi-section pages (billing, compliance, etc.)
- **Features**: Hierarchical tabs, mobile-responsive
- **Props**: `pageTitle`, `pageSubtitle`, `pageActions`, `tabConfig`, `activeTabId`, `onTabChange`

```tsx
import { TabbedPageLayout } from '@/components/layouts';

<TabbedPageLayout
  pageTitle="Billing Dashboard"
  pageSubtitle="Manage invoices and time entries"
  pageActions={<ExportButton />}
  tabConfig={BILLING_TAB_CONFIG}
  activeTabId={activeTab}
  onTabChange={setActiveTab}
>
  {content}
</TabbedPageLayout>
```

#### **ManagerLayout**
- **Purpose**: Management interface with header, filters, sidebar, and content
- **Use Case**: Data management pages (document manager, CRM, etc.)
- **Features**: Optional sidebar, filter panel, responsive
- **Props**: `title`, `subtitle`, `actions`, `filterPanel`, `sidebar`, `children`, `sidebarWidth`

```tsx
import { ManagerLayout } from '@/components/layouts';

<ManagerLayout
  title="Document Manager"
  subtitle="Manage all case documents"
  actions={<Button>Upload</Button>}
  sidebar={<DocumentSidebar />}
  filterPanel={<FilterPanel />}
>
  <DocumentList />
</ManagerLayout>
```

#### **StickyHeaderLayout**
- **Purpose**: Layout with sticky header and scrollable content
- **Use Case**: Long-form content with persistent controls
- **Features**: Sticky positioning, theme-aware borders
- **Props**: `header`, `children`, `headerClassName`, `contentClassName`

```tsx
import { StickyHeaderLayout } from '@/components/layouts';

<StickyHeaderLayout
  header={<Toolbar />}
>
  <LongFormContent />
</StickyHeaderLayout>
```

---

### 3. Content Layouts (5 layouts)
Flexible layouts for arranging content within pages.

#### **SplitViewLayout**
- **Purpose**: Master/detail or list/detail split view
- **Use Case**: Email clients, file browsers, inbox interfaces
- **Features**: Left/right positioning, responsive, configurable widths
- **Props**: `sidebar`, `content`, `showSidebarOnMobile`, `sidebarPosition`, `sidebarWidth`

```tsx
import { SplitViewLayout } from '@/components/layouts';

<SplitViewLayout
  sidebar={<MessageList />}
  content={<MessageDetail />}
  sidebarWidth="md"
  sidebarPosition="left"
/>
```

#### **TwoColumnLayout**
- **Purpose**: Side-by-side dual panel layout
- **Use Case**: Comparison views, editing workflows, before/after
- **Features**: Configurable widths, mobile stacking
- **Props**: `leftColumn`, `rightColumn`, `leftWidth`, `gap`, `stackOnMobile`

```tsx
import { TwoColumnLayout } from '@/components/layouts';

<TwoColumnLayout
  leftColumn={<EditorPane />}
  rightColumn={<PreviewPane />}
  leftWidth="2/3"
  gap="lg"
/>
```

#### **ThreeColumnLayout**
- **Purpose**: Advanced multi-panel interface
- **Use Case**: Complex workflows (nav + content + details)
- **Features**: Configurable column widths, responsive hiding
- **Props**: `leftColumn`, `centerColumn`, `rightColumn`, `leftWidth`, `rightWidth`, `gap`, `showOnMobile`

```tsx
import { ThreeColumnLayout } from '@/components/layouts';

<ThreeColumnLayout
  leftColumn={<Navigation />}
  centerColumn={<Content />}
  rightColumn={<Inspector />}
  leftWidth="md"
  rightWidth="lg"
/>
```

#### **GridLayout**
- **Purpose**: Responsive grid for cards and items
- **Use Case**: Dashboards, galleries, card grids
- **Features**: Auto-fit option, configurable columns and gaps
- **Props**: `children`, `columns`, `gap`, `autoFit`, `minItemWidth`

```tsx
import { GridLayout } from '@/components/layouts';

// Fixed columns
<GridLayout columns={3} gap="md">
  {items.map(item => <Card key={item.id} {...item} />)}
</GridLayout>

// Auto-fit
<GridLayout autoFit minItemWidth="300px" gap="lg">
  {items.map(item => <Card key={item.id} {...item} />)}
</GridLayout>
```

#### **StackLayout**
- **Purpose**: Linear arrangement (vertical or horizontal)
- **Use Case**: Forms, toolbars, button groups, lists
- **Features**: Consistent spacing, alignment, justification
- **Props**: `direction`, `spacing`, `align`, `justify`, `wrap`, `children`

```tsx
import { StackLayout } from '@/components/layouts';

// Vertical stack (form)
<StackLayout direction="vertical" spacing="lg">
  <Input label="Name" />
  <Input label="Email" />
  <Button>Submit</Button>
</StackLayout>

// Horizontal stack (toolbar)
<StackLayout direction="horizontal" spacing="sm" align="center">
  <Button>Save</Button>
  <Button>Cancel</Button>
</StackLayout>
```

---

### 4. Utility Layouts (1 layout)

#### **CenteredLayout**
- **Purpose**: Center content vertically and/or horizontally
- **Use Case**: Auth pages, empty states, loading screens, modals
- **Features**: Configurable max-width and vertical centering
- **Props**: `children`, `maxWidth`, `verticalCenter`

```tsx
import { CenteredLayout } from '@/components/layouts';

<CenteredLayout maxWidth="md" verticalCenter>
  <LoginForm />
</CenteredLayout>
```

---

## Layout Selection Guide

| Need | Use This Layout |
|------|----------------|
| Full app structure | AppShellLayout |
| Simple page | PageContainerLayout |
| Tabbed sections | TabbedPageLayout |
| Management interface | ManagerLayout |
| List + Detail | SplitViewLayout |
| Side-by-side content | TwoColumnLayout |
| Complex multi-panel | ThreeColumnLayout |
| Card grid | GridLayout |
| Linear items | StackLayout |
| Persistent header | StickyHeaderLayout |
| Centered content | CenteredLayout |

## Composition Patterns

### Pattern 1: Nested Layouts
```tsx
<AppShellLayout sidebar={<Sidebar />} headerContent={<Header />}>
  <PageContainerLayout>
    <TwoColumnLayout
      leftColumn={<Editor />}
      rightColumn={<Preview />}
    />
  </PageContainerLayout>
</AppShellLayout>
```

### Pattern 2: Layout in Page
```tsx
export const MyPage = () => (
  <ManagerLayout title="Documents" sidebar={<Sidebar />}>
    <GridLayout columns={3} gap="md">
      {items.map(item => <Card {...item} />)}
    </GridLayout>
  </ManagerLayout>
);
```

### Pattern 3: Responsive Layout Switching
```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

return isMobile ? (
  <StackLayout direction="vertical">
    {content}
  </StackLayout>
) : (
  <TwoColumnLayout leftColumn={left} rightColumn={right} />
);
```

## Theme Integration

All layouts that need theme support use the `useTheme` hook:
- **AppShellLayout**: Background, text, surface colors
- **TabbedPageLayout**: Primary, border, surface colors
- **ManagerLayout**: Background, surface, border colors
- **SplitViewLayout**: Surface, border colors
- **StickyHeaderLayout**: Surface, border colors

Layouts without theme dependencies (Grid, Stack, Centered, etc.) are pure structural components.

## Responsive Design

All layouts include mobile-first responsive design:
- **Mobile**: Single column, stacked layout
- **Tablet (md)**: Two-column, sidebar appears
- **Desktop (lg)**: Full multi-column layout
- **Wide (xl)**: Maximum columns, all panels visible

Breakpoints follow Tailwind's default scale:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Performance Considerations

### CSS Containment
AppShellLayout uses `contain: 'strict'` for performance optimization in large apps.

### Memoization
Consider wrapping expensive layout children with `React.memo()` to prevent unnecessary re-renders.

### Virtualization
For long lists within layouts, use VirtualList or VirtualGrid organisms.

## Accessibility

All layouts support:
- ✅ Keyboard navigation (focus management)
- ✅ Screen reader compatibility (semantic HTML)
- ✅ ARIA labels where appropriate
- ✅ Responsive touch targets (mobile)

## Migration from Templates

Layouts replace the old `templates/` directory:

| Old Template | New Layout |
|-------------|-----------|
| AppShell | AppShellLayout |
| PageContainer | PageContainerLayout |
| TabbedPageLayout | TabbedPageLayout (same) |
| ManagerLayout | ManagerLayout (enhanced) |
| - | SplitViewLayout (new) |
| - | TwoColumnLayout (new) |
| - | ThreeColumnLayout (new) |
| - | GridLayout (new) |
| - | StackLayout (new) |
| - | CenteredLayout (new) |
| - | StickyHeaderLayout (new) |

Update imports:
```tsx
// Old
import { PageContainer } from '@/components/templates/PageContainer';

// New
import { PageContainerLayout } from '@/components/layouts';
```

## File Structure
```
frontend/src/components/layouts/
├── index.ts                      # Barrel exports
├── README.md                     # This file
│
├── AppShellLayout.tsx            # Application shell
│
├── PageContainerLayout.tsx       # Simple page wrapper
├── TabbedPageLayout.tsx          # Tabbed page
├── ManagerLayout.tsx             # Management interface
├── StickyHeaderLayout.tsx        # Sticky header
│
├── SplitViewLayout.tsx           # List/detail split
├── TwoColumnLayout.tsx           # Two columns
├── ThreeColumnLayout.tsx         # Three columns
├── GridLayout.tsx                # Responsive grid
├── StackLayout.tsx               # Linear stack
│
└── CenteredLayout.tsx            # Centered content
```

## Testing

Each layout should be tested for:
1. **Rendering**: Proper DOM structure
2. **Responsive**: Behavior across breakpoints
3. **Props**: All prop variations work
4. **Theme**: Theme integration (if applicable)
5. **Accessibility**: ARIA labels, keyboard nav

## Best Practices

### DO ✅
- Use layouts for structural arrangement only
- Compose layouts for complex interfaces
- Pass theme-aware components as children
- Use semantic HTML within layouts
- Follow mobile-first responsive design

### DON'T ❌
- Put business logic in layouts
- Hardcode colors (use theme)
- Create deeply nested layouts (max 2-3 levels)
- Ignore mobile breakpoints
- Mix layout concerns with data fetching

## Related Documentation

- `/frontend/src/components/pages/README.md` - Page architecture
- `/frontend/src/components/organisms/README.md` - Complex components
- `/.github/copilot-instructions.md` - Project conventions

---

**Last Updated**: December 27, 2025  
**Total Layouts**: 11 layouts  
**Status**: ✅ Production Ready
