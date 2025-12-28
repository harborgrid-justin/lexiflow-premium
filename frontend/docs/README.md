# Providers Directory

> **Status**: ✅ Zero Circular Dependencies (as of 2025-12-28)

## Quick Start

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

## Available Providers

| Provider | Purpose | Dependencies |
|----------|---------|--------------|
| `ThemeProvider` | Dark/light mode theming | None |
| `ToastProvider` | Application notifications | None |
| `DataSourceProvider` | Data layer routing (IndexedDB/PostgreSQL) | None |
| `WindowProvider` | Orbital window management | Theme (via prop) |
| `SyncProvider` | Offline sync & queue management | Toast (via callbacks) |

## Available Hooks

```tsx
import {
  useTheme,           // Theme state and actions
  useToast,           // Toast notifications
  useDataSource,      // Data source configuration
  useWindow,          // Window management
  useSync,            // Sync state and actions
} from '@/providers';
```

## Architecture

This directory follows a **zero circular dependency** architecture using **dependency injection** via props.

### Key Principles

1. **No cross-imports**: Providers never import hooks from other providers
2. **Prop injection**: Dependencies passed via props, not imported
3. **Composition layer**: `AppProviders.tsx` wires everything together
4. **Independent testing**: Each provider testable in isolation

### Dependency Graph

```
ThemeProvider (base)
    ↓
ToastProvider (base)
    ↓
DataSourceProvider (base)
    ↓
WindowProvider (needs theme)
    ↓
SyncProvider (needs toast)
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture and patterns
- **[MIGRATION.md](./MIGRATION.md)** - How to migrate existing code
- **[CIRCULAR_DEPENDENCY_RESOLUTION_SUMMARY.md](./CIRCULAR_DEPENDENCY_RESOLUTION_SUMMARY.md)** - Resolution details

## Usage Examples

### Basic Usage

```tsx
import { AppProviders, useTheme, useToast } from '@/providers';

function MyApp() {
  return (
    <AppProviders>
      <Dashboard />
    </AppProviders>
  );
}

function Dashboard() {
  const { mode, toggleTheme } = useTheme();
  const { success, error } = useToast();
  
  return (
    <div>
      <button onClick={toggleTheme}>
        Current mode: {mode}
      </button>
      <button onClick={() => success('Action completed!')}>
        Show Toast
      </button>
    </div>
  );
}
```

### Individual Provider Usage

```tsx
import { ThemeProvider, useTheme } from '@/providers';

function ThemeAwareApp() {
  return (
    <ThemeProvider initialMode="dark">
      <Dashboard />
    </ThemeProvider>
  );
}
```

### Testing with Mock Dependencies

```tsx
import { WindowProvider } from '@/providers';

const mockTheme = {
  surface: { default: 'bg-white', muted: 'bg-gray-100' },
  // ... other theme props
};

test('window component', () => {
  render(
    <WindowProvider theme={mockTheme}>
      <WindowComponent />
    </WindowProvider>
  );
});
```

## File Structure

```
providers/
├── README.md                          # This file
├── ARCHITECTURE.md                    # Architecture details
├── MIGRATION.md                       # Migration guide
├── CIRCULAR_DEPENDENCY_RESOLUTION_SUMMARY.md  # Resolution summary
│
├── index.ts                          # Public exports
├── types.ts                          # Consolidated type exports
├── AppProviders.tsx                  # ⭐ Main composition layer
│
├── ThemeContext.tsx                  # Theme provider
├── ThemeContext.types.ts
├── ToastContext.tsx                  # Toast provider
├── ToastContext.types.ts
├── DataSourceContext.tsx             # Data source provider
├── DataSourceContext.types.ts
├── WindowContext.tsx                 # Window provider
├── WindowContext.types.ts
├── SyncContext.tsx                   # Sync provider
└── SyncContext.types.ts
```

## Adding a New Provider

1. **Create provider files**
   ```typescript
   // NewContext.tsx
   export function NewProvider({ children, dependency }) {
     // Implementation
   }
   
   // NewContext.types.ts
   export interface NewProviderProps {
     children: ReactNode;
     dependency?: SomeType;
   }
   ```

2. **Update AppProviders.tsx**
   ```typescript
   function NewProviderWithDeps({ children }) {
     const dep = useSomeDependency();
     return <NewProvider dependency={dep}>{children}</NewProvider>;
   }
   ```

3. **Export from index.ts**
   ```typescript
   export { NewProvider, useNew } from './NewContext';
   export type { NewType } from './NewContext.types';
   ```

## Rules for Maintainers

### ✅ DO:

- Accept dependencies via props
- Use type-only imports from other providers
- Test providers in isolation
- Document dependencies in provider comments
- Use AppProviders for composition

### ❌ DON'T:

- Import hooks from other providers within a provider file
- Import from index.ts within the providers directory
- Create circular provider dependencies
- Use global state when props suffice

## Verification

```bash
# Check for circular dependencies
npx madge --circular frontend/src/providers
# Expected: No circular dependencies found!

# Type check
npm run type-check

# Build
npm run build
```

## Best Practices

### Provider Design

Each provider should:
- Have a clear, single responsibility
- Work independently with defaults
- Accept dependencies via props
- Export hooks, not contexts
- Be testable in isolation

### Context Splitting

Follow the split context pattern:
```typescript
const StateContext = createContext<StateValue | undefined>(undefined);
const ActionsContext = createContext<ActionsValue | undefined>(undefined);
```

This prevents unnecessary re-renders when only actions are needed.

### Hook Naming

```typescript
// State + Actions
export function useMyProvider() { ... }

// State only
export function useMyProviderState() { ... }

// Actions only
export function useMyProviderActions() { ... }
```

## Performance Considerations

- **Split contexts** prevent re-renders (state vs actions)
- **Memoized values** using `useMemo` for provider values
- **Stable callbacks** using `useCallback` for actions
- **Refs for high-frequency** state (e.g., drag state in WindowProvider)

## Support

For questions or issues:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for patterns
2. Review [MIGRATION.md](./MIGRATION.md) for usage examples
3. See existing providers for reference implementations

## Status

- ✅ Zero circular dependencies
- ✅ Full TypeScript coverage
- ✅ Comprehensive documentation
- ✅ Independent testing support
- ✅ Production ready

---

**Last Updated**: December 28, 2025
**Verified**: Zero circular dependencies confirmed
