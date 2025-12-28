# Quick Reference - Providers

## 🚀 Getting Started

```tsx
import { AppProviders } from '@/providers';

<AppProviders>
  <YourApp />
</AppProviders>
```

## 🎣 Available Hooks

```tsx
import {
  useTheme,        // { mode, theme, isDark, toggleTheme, setTheme }
  useToast,        // { toasts, addToast, success, error, info, warning }
  useDataSource,   // { currentSource, isBackendApiEnabled, switchDataSource }
  useWindow,       // { windows, openWindow, closeWindow, minimizeWindow }
  useSync,         // { isOnline, syncStatus, pendingCount, performMutation }
} from '@/providers';
```

## 📋 Common Patterns

### Theme Toggle
```tsx
const { mode, toggleTheme } = useTheme();
<button onClick={toggleTheme}>
  {mode === 'dark' ? '🌙' : '☀️'}
</button>
```

### Show Notification
```tsx
const { success, error } = useToast();
success('Saved successfully!');
error('Something went wrong');
```

### Open Window
```tsx
const { openWindow } = useWindow();
openWindow('doc-1', 'Document Viewer', <DocumentViewer id="doc-1" />);
```

### Check Sync Status
```tsx
const { isOnline, syncStatus, pendingCount } = useSync();
{isOnline ? '🟢 Online' : '🔴 Offline'}
{pendingCount > 0 && `${pendingCount} pending`}
```

## 🧪 Testing

```tsx
import { WindowProvider } from '@/providers';

const mockTheme = {
  surface: { default: 'bg-white', muted: 'bg-gray-100' },
  border: { default: 'border-gray-200' },
  accent: { primary: 'bg-blue-500' },
  text: { secondary: 'text-gray-700', tertiary: 'text-gray-500' },
  interactive: { hover: 'hover:bg-gray-200' }
};

test('window', () => {
  render(
    <WindowProvider theme={mockTheme}>
      <Component />
    </WindowProvider>
  );
});
```

## ✅ Rules

### DO
- ✅ Use `<AppProviders>` for app-wide providers
- ✅ Import hooks from `@/providers`
- ✅ Test providers with mock props
- ✅ Accept dependencies via props in new providers

### DON'T
- ❌ Import hooks from other providers within a provider file
- ❌ Import from `@/providers/index` inside providers directory
- ❌ Create circular dependencies
- ❌ Bypass the composition layer

## 📚 Documentation

- **README.md** - Overview and quick start
- **ARCHITECTURE.md** - Detailed architecture
- **MIGRATION.md** - Migration guide
- **VISUAL_GUIDE.md** - Visual diagrams

## 🔍 Verification

```bash
# Check for circular dependencies
npx madge --circular frontend/src/providers

# Expected: No circular dependencies found! ✅
```

## 🆘 Troubleshooting

### "useTheme must be used within ThemeProvider"
Wrap your app with `<AppProviders>`:
```tsx
<AppProviders><App /></AppProviders>
```

### Circular dependency warning
Check that providers don't import hooks from each other. Use props instead.

### Need custom initialization?
See MIGRATION.md "Advanced: Custom Provider Composition"

---

**Status**: ✅ Zero Circular Dependencies
**Updated**: December 28, 2025
