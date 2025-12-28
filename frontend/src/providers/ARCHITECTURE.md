# Provider Architecture - Circular Dependency Prevention

## Overview

This document explains how circular dependencies were eliminated from the providers directory and establishes patterns for maintaining a dependency-free provider architecture.

## Problem Statement

**Original Issues:**
1. `WindowContext.tsx` imported `useTheme` from `./ThemeContext`
2. `SyncContext.tsx` imported `useToast` from `./ToastContext`
3. All providers exported through `index.ts` barrel file
4. Risk of circular imports when providers import from each other

## Solution Architecture

### Dependency Injection Pattern

Instead of providers directly importing and using other providers, we use **dependency injection** via props:

```typescript
// ❌ BAD: Direct import creates circular dependency risk
import { useTheme } from './ThemeContext';

export function WindowProvider({ children }) {
  const { theme } = useTheme(); // Circular risk
  // ...
}

// ✅ GOOD: Accept theme as prop
export function WindowProvider({ children, theme }) {
  // Use theme from props
  // ...
}
```

### Provider Composition Layer

The `AppProviders.tsx` file acts as the **composition layer** that:
1. Imports all individual providers
2. Connects them with proper dependency injection
3. Prevents circular dependencies by centralizing the wiring

```typescript
// AppProviders.tsx - The ONLY file that imports multiple providers
import { ThemeProvider, useTheme } from './ThemeContext';
import { ToastProvider, useToast } from './ToastContext';
import { WindowProvider } from './WindowContext';
import { SyncProvider } from './SyncContext';

function WindowProviderWithTheme({ children }) {
  const { theme } = useTheme();
  return <WindowProvider theme={theme}>{children}</WindowProvider>;
}

function SyncProviderWithToast({ children }) {
  const { success, error } = useToast();
  return <SyncProvider onSyncSuccess={success} onSyncError={error}>{children}</SyncProvider>;
}
```

## Dependency Graph

```
ThemeProvider (no dependencies)
    ↓
ToastProvider (no dependencies)
    ↓
DataSourceProvider (no dependencies)
    ↓
WindowProvider (receives theme prop)
    ↓
SyncProvider (receives notification callbacks)
```

## Rules for Maintaining Zero Circular Dependencies

### ✅ DO:

1. **Accept dependencies via props**
   ```typescript
   interface MyProviderProps {
     children: ReactNode;
     theme?: ThemeType;
     onNotify?: (msg: string) => void;
   }
   ```

2. **Import types only, not implementations**
   ```typescript
   import type { ThemeType } from './ThemeContext.types';
   ```

3. **Use the AppProviders composition layer**
   ```typescript
   // In your app root
   import { AppProviders } from '@/providers';
   
   <AppProviders>
     <App />
   </AppProviders>
   ```

4. **Keep providers independent**
   - Each provider should work standalone
   - Dependencies come from props, not imports
   - Default/fallback values when deps are undefined

### ❌ DON'T:

1. **Import hooks from other providers**
   ```typescript
   // ❌ Never do this inside a provider
   import { useTheme } from './ThemeContext';
   import { useToast } from './ToastContext';
   ```

2. **Import from the barrel export (index.ts) within providers**
   ```typescript
   // ❌ Never do this
   import { useTheme, useToast } from '.';
   import { useTheme, useToast } from './index';
   ```

3. **Create cross-dependencies**
   ```typescript
   // ❌ Provider A imports Provider B, Provider B imports Provider A
   ```

## File Structure

```
providers/
├── index.ts                       # Barrel export (hooks only)
├── AppProviders.tsx               # Composition layer (NEW)
├── ThemeContext.tsx               # Independent provider
├── ThemeContext.types.ts          # Type definitions
├── ToastContext.tsx               # Independent provider
├── ToastContext.types.ts          # Type definitions
├── WindowContext.tsx              # Receives theme via props
├── WindowContext.types.ts         # Type definitions
├── SyncContext.tsx                # Receives callbacks via props
├── SyncContext.types.ts           # Type definitions
├── DataSourceContext.tsx          # Independent provider
├── DataSourceContext.types.ts     # Type definitions
└── types.ts                       # Consolidated type exports
```

## Testing Independence

Each provider should be testable in isolation:

```typescript
// Testing WindowProvider without ThemeProvider
import { WindowProvider } from './WindowContext';

const mockTheme = {
  surface: { default: 'bg-white', muted: 'bg-gray-100' },
  // ... other theme props
};

render(
  <WindowProvider theme={mockTheme}>
    <TestComponent />
  </WindowProvider>
);
```

## Migration Guide

If you need to add a new provider:

1. **Create the provider without cross-imports**
   ```typescript
   // NewProvider.tsx
   export function NewProvider({ children, dependency1, dependency2 }) {
     // Implementation using props
   }
   ```

2. **Update AppProviders.tsx**
   ```typescript
   function NewProviderWithDeps({ children }) {
     const dep1 = useSomeDependency();
     return <NewProvider dependency1={dep1}>{children}</NewProvider>;
   }
   
   export function AppProviders({ children }) {
     return (
       <ExistingProviders>
         <NewProviderWithDeps>
           {children}
         </NewProviderWithDeps>
       </ExistingProviders>
     );
   }
   ```

3. **Export from index.ts**
   ```typescript
   export { NewProvider, useNew } from './NewContext';
   export type { NewType } from './NewContext.types';
   ```

## Benefits

1. **Zero circular dependencies** - Impossible by design
2. **Testable in isolation** - Each provider can be tested independently
3. **Clear dependency tree** - Easy to understand what depends on what
4. **Flexible composition** - Easy to reorder or conditionally include providers
5. **Type safety** - All dependencies are explicitly typed in props

## Verification

To verify no circular dependencies exist:

```bash
# Using madge or similar tool
npx madge --circular frontend/src/providers

# Should output: No circular dependencies found!
```

## Summary

By moving from **direct imports** to **dependency injection via props** and centralizing provider composition in `AppProviders.tsx`, we've eliminated all circular dependencies while maintaining clean, testable, and flexible provider architecture.
