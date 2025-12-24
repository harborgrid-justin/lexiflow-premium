# Storybook Gap Analysis & Implementation Plan
**Generated**: December 23, 2025  
**Analyzed**: 76 story files across LexiFlow Premium  
**Reference**: https://storybook.js.org/docs/api best practices

---

## Executive Summary

Our Storybook implementation has strong foundational patterns but lacks critical best practices from the official Storybook API. We have 100% adoption of autodocs and component-level decorators, but **zero adoption** of play functions, loaders, and story-level JSDoc.

### Quick Stats
- **Total Stories**: 76 files
- **Strong Areas**: autodocs (100%), decorators (100%), comprehensive meta JSDoc
- **Critical Gaps**: play functions (0%), loaders (0%), story JSDoc (0%)
- **Major Gaps**: action handlers (22.4%), argTypes (25%), composition (10.5%)

---

## Detailed Gap Analysis

### 🔴 Critical Gaps (0% Adoption)

#### 1. Play Functions - 0/76 files (0%)
**Best Practice**: Use play functions for interaction testing  
**Impact**: No automated interaction testing, manual testing required for all user flows  
**Storybook API**: https://storybook.js.org/docs/writing-stories/play-function

**Current State**:
```typescript
// We currently have no play functions at all
export const Default: Story = {
  args: {},
};
```

**Target Implementation**:
```typescript
import { expect, userEvent, within } from '@storybook/test';

export const FilledForm: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // Simulate user interactions
    await userEvent.type(
      canvas.getByLabelText('Email'), 
      'user@example.com'
    );
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    
    // Assert expected results
    await expect(
      canvas.getByText('Form submitted successfully')
    ).toBeInTheDocument();
  },
};
```

**Priority Components for Play Functions**:
1. **Forms**: DocketEntryBuilder, DocumentFilters, NewMatterIntakeForm
2. **Modals**: DocketEntryModal, DocketImportModal
3. **Interactive dashboards**: Dashboard (tab switching)
4. **Builders**: LitigationBuilder, RuleBuilder, PleadingBuilder
5. **Management interfaces**: UserManagement, WebhookManagement

---

#### 2. Loaders - 0/76 files (0%)
**Best Practice**: Use loaders for asynchronous data fetching  
**Impact**: No demonstration of loading states, mock data patterns, or async behaviors  
**Storybook API**: https://storybook.js.org/docs/writing-stories/loaders

**Current State**:
```typescript
// We define mock data inline but never use loaders
const mockData = { /* ... */ };

export const WithData: Story = {
  args: {
    data: mockData,
  },
};
```

**Target Implementation**:
```typescript
export const LoadedState: Story = {
  loaders: [
    async () => ({
      cases: await mockApiClient.cases.getAll(),
      stats: await mockApiClient.analytics.getDashboardStats(),
    }),
  ],
  render: (args, { loaded: { cases, stats } }) => (
    <Dashboard {...args} cases={cases} stats={stats} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates async data loading pattern with loaders.',
      },
    },
  },
};
```

**Priority Components for Loaders**:
1. **Dashboards**: Dashboard, AnalyticsDashboard, BillingDashboard
2. **Data tables**: DocumentTable, DocketTable, CaseList
3. **Knowledge systems**: KnowledgeCenter, ResearchAssistant
4. **Management pages**: UserManagement, ApiKeyManagement

---

#### 3. Story-Level JSDoc - 0/76 files (0%)
**Best Practice**: Document each story variant with JSDoc comments  
**Impact**: Story purpose not visible in code, only in Storybook UI  
**Storybook API**: https://storybook.js.org/docs/api/csf#storybook-export-vs-name-handling

**Current State**:
```typescript
// No JSDoc on story exports
export const Default: Story = {
  args: {},
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
```

**Target Implementation**:
```typescript
/**
 * Default dashboard view with overview tab active.
 * Shows firm-wide metrics, recent activity, and quick actions.
 */
export const Default: Story = {
  args: {
    initialTab: 'overview',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary dashboard view for desktop users with full metrics.',
      },
    },
  },
};

/**
 * Mobile-optimized dashboard with simplified navigation
 * and touch-friendly interface elements.
 */
export const Mobile: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'Responsive mobile view with streamlined UI.',
      },
    },
  },
};
```

**Benefits**:
- Code-level documentation visible in IDE
- Better maintainability
- Clear intent for each story variant
- Improved onboarding for new developers

---

### 🟡 Major Gaps (>70% Missing)

#### 4. Action Handlers (fn()) - 17/76 files (22.4%)
**Best Practice**: Use `fn()` from storybook/test for all callbacks  
**Impact**: Missing action logging in Storybook UI, harder to verify callbacks fire  
**Storybook API**: https://storybook.js.org/docs/essentials/actions

**Current State** (59 files missing):
```typescript
export const Default: Story = {
  args: {
    onSubmit: () => {}, // No action tracking
    onCancel: () => {},
  },
};
```

**Target Implementation**:
```typescript
import { fn } from 'storybook/test';

export const Default: Story = {
  args: {
    onSubmit: fn(), // Logs to Actions panel
    onCancel: fn(),
    onDelete: fn(),
  },
};
```

**Files with Good Examples**:
- Dashboard.stories.tsx - `onSelectCase: fn()`
- BillingDashboard.stories.tsx - Multiple callbacks
- Document*.stories.tsx - Consistent fn() usage
- Docket*.stories.tsx - All interactive callbacks

---

#### 5. ArgTypes - 19/76 files (25%)
**Best Practice**: Define argTypes for interactive prop controls  
**Impact**: No real-time prop manipulation in Storybook UI  
**Storybook API**: https://storybook.js.org/docs/api/arg-types

**Current State** (57 files missing):
```typescript
const meta = {
  component: MyComponent,
  // No argTypes defined
} satisfies Meta<typeof MyComponent>;
```

**Target Implementation**:
```typescript
const meta = {
  component: Dashboard,
  argTypes: {
    initialTab: {
      control: 'select',
      options: ['overview', 'tasks', 'notifications'],
      description: 'Initial tab to display',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'overview' },
      },
    },
    currentUser: {
      control: 'object',
      description: 'Current authenticated user',
    },
    onSelectCase: {
      action: 'case-selected',
      description: 'Callback when a case is selected',
    },
    theme: {
      control: 'radio',
      options: ['light', 'dark', 'auto'],
      description: 'Theme preference',
    },
  },
} satisfies Meta<typeof Dashboard>;
```

**Control Types** (from Storybook API):
- `boolean` - Checkbox
- `number` - Number input with range
- `range` - Slider
- `object` - JSON editor
- `array` - JSON array editor
- `select` - Dropdown
- `multi-select` - Multi-select dropdown
- `radio` - Radio buttons
- `inline-radio` - Inline radio buttons
- `check` - Checkboxes
- `inline-check` - Inline checkboxes
- `text` - Text input
- `color` - Color picker
- `date` - Date picker

---

#### 6. Story Composition - 8/76 files (10.5%)
**Best Practice**: Reuse story configurations via composition  
**Impact**: Code duplication, inconsistent story variants  
**Storybook API**: https://storybook.js.org/docs/writing-stories/args#args-composition

**Current State** (68 files not using):
```typescript
export const Default: Story = {
  args: {
    theme: 'light',
    size: 'medium',
    variant: 'primary',
  },
};

export const Large: Story = {
  args: {
    theme: 'light',     // Duplicated
    size: 'large',
    variant: 'primary', // Duplicated
  },
};
```

**Target Implementation**:
```typescript
export const Default: Story = {
  args: {
    theme: 'light',
    size: 'medium',
    variant: 'primary',
  },
};

export const Large: Story = {
  ...Default,
  args: {
    ...Default.args,
    size: 'large',
  },
};

export const LargeDark: Story = {
  ...Large,
  args: {
    ...Large.args,
    theme: 'dark',
  },
  parameters: {
    ...Large.parameters,
    backgrounds: { default: 'dark' },
  },
};
```

---

### 🟢 Moderate Gaps

#### 7. Args Configuration - 34/76 files (44.7%)
**Current**: 40 files have no args property  
**Target**: All stories should define args (even if empty)

#### 8. Story-Level Parameters - 34/76 files (44.7%)
**Current**: 42 files lack story-specific parameters  
**Target**: 80% of stories should have custom parameters

#### 9. Story-Level Decorators - 4/76 files (5.3%)
**Current**: Most stories only use component-level decorators  
**Note**: This is actually appropriate for our use case - we have consistent ThemeProvider/ToastProvider wrapping

#### 10. Custom Render Functions - 11/76 files (14.5%)
**Current**: 85.5% use default render  
**Note**: This is appropriate - custom renders should only be used when necessary

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal**: Establish critical best practices

#### Task 1.1: Add Play Functions (Priority 🔴)
**Files**: 10 most interactive components  
**Time**: 3 days  
**Implementation**:

```typescript
// Pattern for form interactions
export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Title'), 'Test Case');
    await userEvent.type(canvas.getByLabelText('Description'), 'Description here');
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    await expect(canvas.getByText('Success')).toBeInTheDocument();
  },
};

// Pattern for modal interactions
export const OpenModal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open/i }));
    const modal = screen.getByRole('dialog');
    await expect(modal).toBeVisible();
  },
};

// Pattern for tab switching
export const SwitchTabs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /tasks/i }));
    await expect(canvas.getByText('Task List')).toBeVisible();
  },
};
```

**Target Files**:
1. Dashboard.stories.tsx - Tab switching
2. DocketEntryBuilder.stories.tsx - Form filling
3. DocketEntryModal.stories.tsx - Modal interactions
4. DocumentFilters.stories.tsx - Filter application
5. LitigationBuilder.stories.tsx - Multi-step form
6. NewMatterIntakeForm (needs creation) - Intake workflow
7. RuleBuilder.stories.tsx - Rule configuration
8. UserManagement.stories.tsx - User CRUD operations
9. WebhookManagement.stories.tsx - Webhook setup
10. ApiKeyManagement.stories.tsx - API key generation

---

#### Task 1.2: Add Story JSDoc (Priority 🔴)
**Files**: All 76 files  
**Time**: 2 days  
**Pattern**:

```typescript
/**
 * Default view showing [primary use case description].
 * Demonstrates [key features or patterns].
 */
export const Default: Story = { /* ... */ };

/**
 * Mobile-responsive view optimized for [device type].
 * Features [specific mobile adaptations].
 */
export const Mobile: Story = { /* ... */ };

/**
 * Error state showing [error scenario].
 * Demonstrates [error handling pattern].
 */
export const Error: Story = { /* ... */ };
```

**Automation**: Create a script to add template JSDoc to all story exports

---

### Phase 2: Interactive Enhancement (Week 2)
**Goal**: Improve developer experience with better controls

#### Task 2.1: Add fn() to All Interactive Components
**Files**: 59 files missing action handlers  
**Time**: 2 days  
**Pattern**:

```typescript
import { fn } from 'storybook/test';

const meta = {
  component: MyComponent,
  args: {
    // Apply to all stories by default
    onClick: fn(),
    onSubmit: fn(),
    onCancel: fn(),
    onChange: fn(),
  },
} satisfies Meta<typeof MyComponent>;
```

**Scope**: All components with:
- Form submission callbacks
- Click handlers
- Change handlers
- Modal open/close handlers
- Navigation callbacks
- CRUD operation callbacks

---

#### Task 2.2: Define ArgTypes for Top Components
**Files**: 20 most-used components  
**Time**: 3 days  
**Priority Components**:
1. Dashboard - Tab selection, user context
2. All Document management components
3. All Docket management components
4. Billing components
5. Analytics dashboards
6. Admin interfaces

**Template**:
```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'tertiary'],
    description: 'Visual variant',
  },
  size: {
    control: 'radio',
    options: ['sm', 'md', 'lg'],
    description: 'Component size',
  },
  disabled: {
    control: 'boolean',
    description: 'Disabled state',
  },
  loading: {
    control: 'boolean',
    description: 'Loading state',
  },
},
```

---

### Phase 3: Data & Composition (Week 3)
**Goal**: Implement loaders and story composition

#### Task 3.1: Add Loaders for Data-Heavy Components
**Files**: 10-15 components with significant data  
**Time**: 3 days  
**Pattern**:

```typescript
// Create mock API client
const mockApiClient = {
  cases: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockCases;
    },
  },
};

export const LoadedData: Story = {
  loaders: [
    async () => ({
      cases: await mockApiClient.cases.getAll(),
      stats: await mockApiClient.analytics.getStats(),
    }),
  ],
  render: (args, { loaded }) => (
    <Component {...args} {...loaded} />
  ),
};

export const LoadingState: Story = {
  loaders: [
    async () => {
      await new Promise(resolve => setTimeout(resolve, 10000));
      return { cases: [] };
    },
  ],
  render: (args, { loaded }) => (
    <Component {...args} {...loaded} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows loading state while data is being fetched.',
      },
    },
  },
};
```

**Target Components**:
- Dashboard
- AnalyticsDashboard
- BillingDashboard
- DocumentTable
- DocketTable
- KnowledgeCenter
- UserManagement
- ComplianceDashboard

---

#### Task 3.2: Refactor to Use Story Composition
**Files**: Identify 20-30 files with duplication  
**Time**: 2 days  
**Pattern**:

```typescript
// Base story
export const Base: Story = {
  args: {
    theme: 'light',
    size: 'medium',
    // ... common props
  },
};

// Composed variants
export const Dark: Story = {
  ...Base,
  args: {
    ...Base.args,
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Mobile: Story = {
  ...Base,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const MobileDark: Story = {
  ...Dark,
  ...Mobile,
  args: {
    ...Dark.args,
  },
  parameters: {
    ...Dark.parameters,
    ...Mobile.parameters,
  },
};
```

---

### Phase 4: Polish & Documentation (Week 4)
**Goal**: Complete standardization and documentation

#### Task 4.1: Standardize All Args
**Files**: 40 files without args  
**Time**: 1 day  
**Action**: Add empty args object `args: {}` to all stories

---

#### Task 4.2: Add Comprehensive Parameters
**Files**: 42 files without parameters  
**Time**: 2 days  
**Template**:

```typescript
export const StoryVariant: Story = {
  args: { /* ... */ },
  parameters: {
    backgrounds: { default: 'light' },
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: 'Detailed description of this story variant.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
};
```

---

#### Task 4.3: Create Storybook Best Practices Guide
**Time**: 2 days  
**Deliverable**: `STORYBOOK_BEST_PRACTICES.md` with:
- LexiFlow-specific patterns
- Code templates
- Common pitfalls
- Examples from our codebase
- Testing patterns with play functions
- Loader patterns for async data
- Composition strategies

---

## Metrics & Success Criteria

| Metric | Current | Target | Critical? |
|--------|---------|--------|-----------|
| Play functions | 0% | 40% | ✅ Yes |
| Loaders | 0% | 20% | ✅ Yes |
| Story JSDoc | 0% | 100% | ✅ Yes |
| fn() usage | 22.4% | 80% | ⚠️ High |
| ArgTypes | 25% | 70% | ⚠️ High |
| Story composition | 10.5% | 30% | 📋 Medium |
| Args defined | 47.3% | 100% | 📋 Medium |
| Story parameters | 44.7% | 80% | 📋 Medium |

**Definition of Done**:
- [ ] All critical metrics (✅) reach target %
- [ ] High priority metrics (⚠️) reach at least 50%
- [ ] All stories have JSDoc comments
- [ ] Top 10 components have comprehensive play functions
- [ ] Top 10 data components use loaders
- [ ] Best practices guide published
- [ ] Team training session completed

---

## Quick Reference: Storybook API Patterns

### Play Function Template
```typescript
import { expect, userEvent, within } from '@storybook/test';

export const Interactive: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // Query elements
    const button = canvas.getByRole('button', { name: /submit/i });
    const input = canvas.getByLabelText('Email');
    
    // Simulate interactions
    await userEvent.type(input, 'test@example.com');
    await userEvent.click(button);
    
    // Assert results
    await expect(canvas.getByText('Success')).toBeInTheDocument();
  },
};
```

### Loader Pattern
```typescript
export const LoadedData: Story = {
  loaders: [
    async () => ({
      data: await mockApi.getData(),
    }),
  ],
  render: (args, { loaded: { data } }) => (
    <Component {...args} data={data} />
  ),
};
```

### Args with fn()
```typescript
import { fn } from 'storybook/test';

const meta = {
  args: {
    onClick: fn(),
    onSubmit: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof Component>;
```

### Story Composition
```typescript
export const Base: Story = {
  args: { /* common props */ },
};

export const Variant: Story = {
  ...Base,
  args: {
    ...Base.args,
    // Override specific props
  },
};
```

---

## Resources

- **Storybook CSF**: https://storybook.js.org/docs/api/csf
- **Args**: https://storybook.js.org/docs/writing-stories/args
- **Play Functions**: https://storybook.js.org/docs/writing-stories/play-function
- **Loaders**: https://storybook.js.org/docs/writing-stories/loaders
- **ArgTypes**: https://storybook.js.org/docs/api/arg-types
- **Parameters**: https://storybook.js.org/docs/api/parameters
- **Interaction Testing**: https://storybook.js.org/docs/writing-tests/interaction-testing

---

**Next Steps**:
1. Review this analysis with team
2. Prioritize which phases to implement
3. Assign tasks to developers
4. Set milestone dates
5. Begin Phase 1 implementation
