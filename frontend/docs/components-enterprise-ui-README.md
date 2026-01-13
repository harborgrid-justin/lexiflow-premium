# Enterprise UI Components

A comprehensive suite of enterprise-grade UI components for LexiFlow Premium, built with React 18, TypeScript, Tailwind CSS, and Framer Motion.

## 📦 Components

### 1. EnterpriseDataTable

Advanced data table with enterprise features for handling large datasets.

**Features:**
- ✅ Virtualized rows using `react-window` for optimal performance with thousands of rows
- ✅ Column resizing and reordering
- ✅ Multi-select with bulk actions
- ✅ Export to CSV and PDF (using jsPDF)
- ✅ Saved views and filters
- ✅ Advanced filtering and search
- ✅ Sortable columns
- ✅ Responsive design

**Usage:**
```tsx
import { EnterpriseDataTable } from '@/components/enterprise/ui';

const MyTable = () => {
  const columns = [
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'email', header: 'Email', accessor: 'email', filterable: true },
    { id: 'status', header: 'Status', accessor: 'status' },
  ];

  const data = [...]; // Your data array

  return (
    <EnterpriseDataTable
      data={data}
      columns={columns}
      selectable
      exportable
      bulkActions={[
        {
          label: 'Delete',
          icon: Trash2,
          onClick: (rows) => handleDelete(rows),
          variant: 'danger'
        }
      ]}
    />
  );
};
```

---

### 2. CommandPalette

Global command palette with keyboard shortcuts (Cmd+K / Ctrl+K).

**Features:**
- ✅ Global keyboard shortcut activation
- ✅ Quick actions and commands
- ✅ Global search integration
- ✅ Recent items tracking
- ✅ Fuzzy search
- ✅ Keyboard navigation (arrows, enter, esc)
- ✅ Nested command hierarchies

**Usage:**
```tsx
import { CommandPalette } from '@/components/enterprise/ui';

const App = () => {
  const actions = [
    {
      id: 'new-case',
      label: 'New Case',
      description: 'Create a new case',
      icon: FileText,
      shortcut: ['⌘', 'N'],
      onSelect: () => navigate('/cases/new'),
    },
    // More actions...
  ];

  const handleSearch = async (query: string) => {
    // Implement your search logic
    return searchResults;
  };

  return (
    <CommandPalette
      actions={actions}
      onSearch={handleSearch}
      recentItems={recentItems}
    />
  );
};
```

---

### 3. EnterpriseModal

Advanced modal system supporting multi-step wizards, drawers, and confirmation dialogs.

**Features:**
- ✅ Multi-step wizard with progress tracking
- ✅ Drawer panel variant (slide from left/right)
- ✅ Confirmation dialogs with customizable actions
- ✅ Form validation integration
- ✅ Responsive sizing (sm, md, lg, xl, full)
- ✅ Keyboard navigation and accessibility
- ✅ Backdrop click handling

**Usage:**
```tsx
import { EnterpriseModal } from '@/components/enterprise/ui';

// Standard Modal
<EnterpriseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Profile"
  size="md"
>
  {/* Modal content */}
</EnterpriseModal>

// Multi-step Wizard
const steps = [
  {
    id: 'step1',
    title: 'Basic Info',
    content: <StepOneForm />,
    isValid: isStep1Valid,
  },
  {
    id: 'step2',
    title: 'Details',
    content: <StepTwoForm />,
  },
];

<EnterpriseModal
  isOpen={isOpen}
  onClose={onClose}
  title="New Case Wizard"
  variant="modal"
  steps={steps}
  onComplete={handleComplete}
  showProgress
/>

// Drawer
<EnterpriseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Filters"
  variant="drawer"
  drawerPosition="right"
  drawerWidth="24rem"
>
  {/* Drawer content */}
</EnterpriseModal>

// Confirmation Dialog
<EnterpriseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Delete Confirmation"
  variant="confirmation"
  confirmationType="error"
  confirmationMessage="Are you sure you want to delete this item?"
  onConfirm={handleDelete}
  onCancel={onClose}
  confirmLabel="Delete"
  cancelLabel="Cancel"
/>
```

---

### 4. EnterpriseForm

Complex form component with validation, auto-save, and field dependencies.

**Features:**
- ✅ Complex form layouts (1-4 columns, sections)
- ✅ Real-time validation with visual feedback
- ✅ Auto-save with debouncing
- ✅ Field dependencies and conditional rendering
- ✅ Multiple field types (text, email, password, select, checkbox, etc.)
- ✅ Password visibility toggle
- ✅ Collapsible sections
- ✅ Accessibility features

**Usage:**
```tsx
import { EnterpriseForm } from '@/components/enterprise/ui';

const MyForm = () => {
  const sections = [
    {
      title: 'Personal Information',
      columns: 2,
      fields: [
        {
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          validation: [
            { type: 'required', message: 'First name is required' },
            { type: 'minLength', value: 2 }
          ]
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          validation: [
            { type: 'required' },
            { type: 'email' }
          ]
        },
      ]
    },
    // More sections...
  ];

  return (
    <EnterpriseForm
      sections={sections}
      onSubmit={handleSubmit}
      autoSave
      autoSaveDelay={2000}
      onAutoSave={handleAutoSave}
      submitLabel="Save"
    />
  );
};
```

---

### 5. NotificationSystem

Comprehensive notification system with toasts, notification center, and push handling.

**Features:**
- ✅ Toast notifications with auto-dismiss
- ✅ Notification center with history
- ✅ Push notification handling
- ✅ Multiple notification types (success, error, warning, info)
- ✅ Action buttons in notifications
- ✅ Sound alerts
- ✅ Mark as read/unread
- ✅ Persistent notifications

**Usage:**
```tsx
import {
  NotificationProvider,
  NotificationBell,
  useToast
} from '@/components/enterprise/ui';

// Wrap your app with NotificationProvider
const App = () => (
  <NotificationProvider>
    <YourApp />
  </NotificationProvider>
);

// Use the notification bell
const Header = () => (
  <div className="header">
    <NotificationBell />
  </div>
);

// Use toast notifications
const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed', 'Your changes have been saved');
  };

  const handleError = () => {
    toast.error('Operation failed', 'Please try again');
  };

  // Advanced usage with actions
  const { addNotification } = useNotifications();

  const notify = () => {
    addNotification({
      type: 'info',
      title: 'New message',
      message: 'You have a new message from John',
      actions: [
        {
          label: 'View',
          onClick: () => navigate('/messages')
        }
      ],
      persistent: true,
      sound: true
    });
  };

  return <button onClick={notify}>Notify</button>;
};
```

---

### 6. StatusBadge

Enhanced status badge with animations and multiple variants.

**Features:**
- ✅ Multiple status variants (success, warning, error, info, pending, etc.)
- ✅ Animated appearance
- ✅ Optional status dot indicator
- ✅ Size variants (sm, md, lg)

**Usage:**
```tsx
import { StatusBadge } from '@/components/enterprise/ui';

<StatusBadge
  status="Active"
  variant="success"
  size="md"
  animated
  showDot
/>
```

---

### 7. MetricCard

Metric card component for displaying KPIs and statistics with animated counters.

**Features:**
- ✅ Animated counter with easing
- ✅ Trend indicators (up, down, neutral)
- ✅ Icon support with customizable colors
- ✅ Multiple formats (number, currency, percentage)
- ✅ Click handler support
- ✅ Responsive design

**Usage:**
```tsx
import { MetricCard } from '@/components/enterprise/ui';
import { Users } from 'lucide-react';

<MetricCard
  label="Total Users"
  value={1234}
  previousValue={1100}
  format="number"
  icon={Users}
  trend="up"
  trendValue="+12.2%"
  description="Active users this month"
  onClick={() => navigate('/users')}
/>

<MetricCard
  label="Revenue"
  value={45678}
  format="currency"
  prefix="$"
  trend="up"
  trendValue="+8.5%"
/>
```

---

### 8. ActivityFeed

Real-time activity feed component with filtering and animations.

**Features:**
- ✅ Timeline-style activity feed
- ✅ Activity type filtering
- ✅ Relative timestamps
- ✅ Activity type icons and colors
- ✅ Metadata support
- ✅ Click handlers
- ✅ Loading and empty states
- ✅ Smooth animations

**Usage:**
```tsx
import { ActivityFeed } from '@/components/enterprise/ui';

const activities = [
  {
    id: '1',
    type: 'create',
    user: { name: 'John Doe', avatar: '/avatars/john.jpg' },
    action: 'created a new case',
    target: 'Case #12345',
    timestamp: new Date(),
    metadata: { status: 'Open', priority: 'High' }
  },
  // More activities...
];

<ActivityFeed
  activities={activities}
  maxHeight={600}
  showFilter
  onItemClick={(activity) => handleClick(activity)}
/>
```

---

## 🎨 Styling

All components use:
- **Tailwind CSS** for styling
- **Theme system** via `useTheme()` hook for consistent dark/light mode
- **Framer Motion** for smooth animations
- **Lucide React** for icons

## 🔧 Technical Details

### Dependencies

All components are built with:
- React 18.2.0
- TypeScript
- Tailwind CSS 3.4+
- Framer Motion 12.23+
- lucide-react 0.562+
- react-window 2.2+ (for virtualization)
- jspdf 3.0+ (for PDF export)

### Best Practices

1. **Performance**: Components use React.memo and optimized re-renders
2. **Accessibility**: ARIA labels, keyboard navigation, focus management
3. **Type Safety**: Full TypeScript support with comprehensive types
4. **Responsive**: Mobile-first design with responsive breakpoints
5. **Theme Support**: Full dark mode support via theme context
6. **Error Handling**: Graceful error states and loading indicators

### File Structure

```
enterprise/ui/
├── ActivityFeed.tsx          # Activity feed component
├── CommandPalette.tsx         # Command palette (Cmd+K)
├── EnterpriseDataTable.tsx    # Advanced data table
├── EnterpriseForm.tsx         # Form builder with validation
├── EnterpriseModal.tsx        # Modal/drawer/wizard system
├── MetricCard.tsx             # KPI metric cards
├── NotificationSystem.tsx     # Notification provider & toasts
├── StatusBadge.tsx            # Status badges
├── index.ts                   # Barrel exports
└── README.md                  # This file
```

## 📝 Examples

See the component usage examples above. Each component is fully documented with JSDoc comments and TypeScript types.

## 🚀 Getting Started

1. Import components from `@/components/enterprise/ui`:
```tsx
import {
  EnterpriseDataTable,
  CommandPalette,
  useToast
} from '@/components/enterprise/ui';
```

2. Wrap your app with `NotificationProvider` for notification support:
```tsx
<NotificationProvider>
  <App />
</NotificationProvider>
```

3. Use the theme context for consistent styling:
```tsx
const { theme } = useTheme();
```

## 🎯 Design Principles

- **Enterprise-Ready**: Built for professional business applications
- **Scalable**: Optimized for large datasets and complex workflows
- **Accessible**: WCAG compliant with keyboard navigation
- **Customizable**: Flexible props and styling options
- **Performant**: Virtualization, memoization, and optimized renders
- **Type-Safe**: Full TypeScript support

---

**Built with ❤️ for LexiFlow Premium**
