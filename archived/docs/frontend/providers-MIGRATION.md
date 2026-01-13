# Provider Migration Guide

## Quick Start

### Before (Multiple Provider Imports)

```tsx
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';
import { DataSourceProvider } from '@/providers/DataSourceContext';
import { WindowProvider } from '@/providers/WindowContext';
import { SyncProvider } from '@/providers/SyncContext';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DataSourceProvider>
          <WindowProvider>
            <SyncProvider>
              <YourApp />
            </SyncProvider>
          </WindowProvider>
        </DataSourceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### After (Single Import - Recommended)

```tsx
import { AppProviders } from '@/providers';

function App() {
  return (
    <AppProviders>
      <YourApp />
    </AppProviders>
  );
}
```

## Benefits of New Approach

1. **Single import** - No need to import multiple providers
2. **Correct dependency order** - Automatically wired correctly
3. **No circular dependencies** - Impossible by design
4. **Less boilerplate** - Cleaner app entry point
5. **Future-proof** - New providers automatically included

## Importing Hooks

Hooks can still be imported individually:

```tsx
import { useTheme, useToast, useSync, useWindow, useDataSource } from '@/providers';

function MyComponent() {
  const { mode, toggleTheme } = useTheme();
  const { success, error } = useToast();
  const { isOnline, syncStatus } = useSync();
  const { openWindow, closeWindow } = useWindow();
  const { currentSource, switchDataSource } = useDataSource();
  
  // ... component logic
}
```

## Advanced: Custom Provider Composition

If you need custom provider initialization:

```tsx
import { 
  ThemeProvider, 
  ToastProvider, 
  DataSourceProvider,
  WindowProvider,
  SyncProvider,
  useTheme,
  useToast
} from '@/providers';

// Custom wrapper
function MyCustomProviders({ children }) {
  return (
    <ThemeProvider initialMode="dark">
      <ToastProvider>
        <DataSourceProvider initialSource="postgresql">
          {/* WindowProvider needs theme */}
          <WindowProviderWithTheme>
            {/* SyncProvider needs toast */}
            <SyncProviderWithToast>
              {children}
            </SyncProviderWithToast>
          </WindowProviderWithTheme>
        </DataSourceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

function WindowProviderWithTheme({ children }) {
  const { theme } = useTheme();
  return <WindowProvider theme={theme}>{children}</WindowProvider>;
}

function SyncProviderWithToast({ children }) {
  const { success, error } = useToast();
  return <SyncProvider onSyncSuccess={success} onSyncError={error}>{children}</SyncProvider>;
}
```

## Testing

### Testing Components with Providers

```tsx
import { render } from '@testing-library/react';
import { AppProviders } from '@/providers';
import MyComponent from './MyComponent';

test('component with all providers', () => {
  render(
    <AppProviders>
      <MyComponent />
    </AppProviders>
  );
  
  // ... assertions
});
```

### Testing with Individual Providers

```tsx
import { ThemeProvider } from '@/providers';

test('component with theme only', () => {
  render(
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
  
  // ... assertions
});
```

### Testing with Mock Dependencies

```tsx
import { WindowProvider } from '@/providers';

const mockTheme = {
  surface: { default: 'bg-white', muted: 'bg-gray-100' },
  border: { default: 'border-gray-200' },
  accent: { primary: 'bg-blue-500' },
  text: { secondary: 'text-gray-700', tertiary: 'text-gray-500' },
  interactive: { hover: 'hover:bg-gray-200' }
};

test('window provider with mock theme', () => {
  render(
    <WindowProvider theme={mockTheme}>
      <MyComponent />
    </WindowProvider>
  );
  
  // ... assertions
});
```

## Troubleshooting

### Error: "useTheme must be used within a ThemeProvider"

Make sure you're wrapping your app with `<AppProviders>`:

```tsx
// ✅ Correct
<AppProviders>
  <App />
</AppProviders>

// ❌ Wrong
<App />
```

### Error: Circular dependency detected

This should no longer happen! If you see this:

1. Check that you're not importing hooks inside provider files
2. Make sure you're using `AppProviders` composition layer
3. Verify you're not importing from `index.ts` within the providers directory

### Want to customize a single provider?

You can still compose providers manually while using AppProviders as a reference:

```tsx
import { ThemeProvider } from '@/providers/ThemeContext';
// ... other individual imports

function CustomProviders({ children }) {
  // Your custom composition
}
```

## Summary

- **Recommended**: Use `<AppProviders>` for most cases
- **Advanced**: Compose manually when you need custom initialization
- **Testing**: Use individual providers or mocks as needed
- **Hooks**: Import from `@/providers` as before
