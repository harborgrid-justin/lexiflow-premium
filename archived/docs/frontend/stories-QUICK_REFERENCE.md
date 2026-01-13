# Storybook Quick Reference Guide

## 🚀 Quick Start

```bash
# Start Storybook
npm run storybook

# Build for production
npm run build-storybook
```

Access at: **http://localhost:6006**

## 📂 Story Organization

```
Pages/               # 50 full-page application views
├── Dashboard
├── Matter Management
├── Case Management Hub
├── Pleading Builder
├── Discovery Platform
├── Billing Dashboard
├── Compliance Dashboard
├── Knowledge Center
├── Analytics Dashboard
└── ... (41 more)

Docket/             # 13 docket components
├── DocketRow
├── DocketTable
├── DocketManager
└── ... (10 more)

Filing/             # 1 filing component
└── FilingCenter
```

## 🎨 Story Pattern (Copy-Paste Template)

### Page Story
```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentName } from '../components/path';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';
import React from 'react';

const meta = {
  title: 'Pages/ComponentName',
  component: ComponentName,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'page'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="h-screen w-screen">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
};
```

### Component Story
```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ComponentName } from '../components/path';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';
import React from 'react';

const meta = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="w-full max-w-4xl">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    propName: {
      description: 'Prop description',
      control: 'select',
      options: ['option1', 'option2'],
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    propName: 'value',
    onAction: fn(),
  },
};
```

## 🔑 Critical Imports

```typescript
// ✅ CORRECT
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

// ❌ WRONG - These will cause errors
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
```

## 🎭 Context Providers

### Required for All Stories
```typescript
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';
import React from 'react';
```

### Decorator Pattern
```typescript
decorators: [
  (Story) => (
    <ThemeProvider>
      <ToastProvider>
        <Story />
      </ToastProvider>
    </ThemeProvider>
  ),
],
```

## 📱 Responsive Variants

```typescript
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1', // 375x667
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet', // 768x1024
    },
  },
};
```

## 🎯 Layout Options

```typescript
parameters: {
  layout: 'fullscreen',  // For pages, no padding
  // OR
  layout: 'padded',      // For components, adds padding
  // OR
  layout: 'centered',    // Centers the component
}
```

## 📝 Documentation Pattern

```typescript
/**
 * ComponentName provides [main purpose] including
 * [key feature 1], [key feature 2], and [key feature 3].
 * 
 * ## Features
 * - Feature 1
 * - Feature 2
 * - Feature 3
 * - Feature 4
 * - Feature 5
 * - ... (10 features recommended)
 */
const meta = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      description: {
        component: 'Brief one-line description for docs.',
      },
    },
  },
  // ...
};
```

## 🔍 Finding Components

### Search Pattern
```bash
# Find all Management pages
frontend/components/**/*Management.tsx

# Find all Dashboard pages
frontend/components/**/*Dashboard.tsx

# Find all Builder pages
frontend/components/**/*Builder.tsx

# Find all Center/Hub pages
frontend/components/**/*Center.tsx
frontend/components/**/*Hub.tsx
```

## 🛠️ Common Fixes

### Import Errors
```typescript
// ❌ Module not found: '@storybook/test'
import { fn } from '@storybook/test';

// ✅ Fixed
import { fn } from 'storybook/test';
```

### Provider Errors
```typescript
// ❌ useToast must be used within ToastProvider
// Missing ToastProvider in decorators

// ✅ Fixed - Add ToastProvider
decorators: [
  (Story) => (
    <ThemeProvider>
      <ToastProvider>
        <Story />
      </ToastProvider>
    </ThemeProvider>
  ),
],
```

### Styling Missing
```typescript
// ❌ No Tailwind styles
// .storybook/preview.ts missing import

// ✅ Fixed - Add to .storybook/preview.ts
import '../index.css';
```

## 📊 Statistics

- **Total Stories**: 64
- **Page Stories**: 50
- **Component Stories**: 14
- **Total Variants**: 192+
- **Framework**: Storybook 10.1.10
- **Builder**: Vite 7.3.0

## 🎉 Quick Links

- **Storybook**: http://localhost:6006
- **Documentation**: [stories/README.md](./README.md)
- **Summary**: [stories/IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Catalog**: [stories/index.ts](./index.ts)

## 💡 Pro Tips

1. **Always import React** - Required for JSX in story files
2. **Use fn() for callbacks** - Enables Storybook action logging
3. **Add responsive variants** - Mobile and tablet are standard
4. **Document features** - List 8-10 key features in JSDoc
5. **Use semantic titles** - "Pages/Dashboard" not "Dashboard/Page"
6. **Test in Storybook** - Run `npm run storybook` to validate
7. **Check console** - Fix any import or runtime errors immediately

## 🔗 Dependencies

```json
{
  "storybook": "^10.1.10",
  "@storybook/react-vite": "^10.1.10",
  "react": "^18.2.0",
  "vite": "^7.3.0",
  "typescript": "~5.9.3"
}
```
