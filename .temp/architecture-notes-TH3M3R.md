# Architecture Notes - Theme Refactoring (TH3M3R)

## Analysis of Actual Scope

After reviewing multiple components, the actual situation is:

### Button Actions Status
**Finding**: Most components already have button actions properly wired to:
- React Router Form submissions
- Auth context actions (extendSession, logout, enableMFA)
- Local state management
- Navigation links

**Components with pre-wired actions:**
- SessionTimeoutWarning: ✅ Already wired (extendSession, logout)
- MFASetup: ✅ Already wired (enableMFA, verification)
- ExpenseList: ✅ Already wired (approve, edit, delete via Form)
- RunningTimer: ✅ Already wired (start, pause, stop with localStorage)

**Actual Work Needed**: Minimal - only a few components may have console.log stubs that need replacing

### Theme Token Status
**Finding**: Mixed implementation - some components partially updated, others not at all

**Components Status:**
- SessionTimeoutWarning: ✅ COMPLETED - All theme tokens applied
- MFASetup: 🟡 PARTIAL - Header and Step 1 done, Steps 2-3 need updating
- StatWidget: ✅ MOSTLY COMPLETE - Uses theme tokens, minor hardcoded colors in change indicator
- ExpenseList: 🟡 PARTIAL - Form section has tokens, table needs updating
- RunningTimer: ❌ NOT STARTED - All hardcoded Tailwind classes

## Theme Replacement Pattern

### Standard Conversion Map

```typescript
// Import
import { useTheme } from '@/theme';

// Hook usage (top of component)
const { tokens, theme } = useTheme();

// Color conversions:
'text-gray-600' → style={{ color: tokens.colors.textMuted }}
'text-gray-900' → style={{ color: tokens.colors.text }}
'text-blue-600' → style={{ color: tokens.colors.primary }}
'text-green-600' → style={{ color: tokens.colors.success }}
'text-red-600' → style={{ color: tokens.colors.error }}
'text-yellow-600' → style={{ color: tokens.colors.warning }}

'bg-white dark:bg-gray-800' → style={{ backgroundColor: tokens.colors.surface }}
'bg-gray-50 dark:bg-gray-900' → style={{ backgroundColor: tokens.colors.backgroundSecondary }}
'bg-gray-100' → style={{ backgroundColor: tokens.colors.backgroundTertiary }}

'border-gray-200 dark:border-gray-700' → style={{ borderColor: tokens.colors.border }}

'bg-blue-600 hover:bg-blue-700' → style={{ backgroundColor: tokens.colors.primary }}
  + onMouseEnter/Leave handlers for hover

'rounded-lg' → style={{ borderRadius: tokens.borderRadius.lg }}
'shadow-sm' → style={{ boxShadow: tokens.shadows.sm }}
```

### Button Action Pattern

Most buttons already use one of:
1. **Form submission**: `<Form method="post">` (React Router)
2. **Context actions**: `onClick={authAction}` from context
3. **Local state**: `onClick={() => setState(...)}`
4. **Navigation**: `<Link to="...">`

**Pattern for remaining stubs:**
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    const result = await apiClient.action(data);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success('Success');
    // Update state or refetch
  } catch (error) {
    toast.error('Error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

## Revised Implementation Strategy

1. **Priority 1**: Complete theme tokens for components with partial implementation
   - MFASetup (Steps 2-3)
   - ExpenseList (table section)
   - StatWidget (change indicator fix)

2. **Priority 2**: Add theme tokens to components without any implementation
   - RunningTimer
   - CaseListView
   - Document viewers
   - Other components in phases 2-6

3. **Priority 3**: Wire any actual stub/console.log actions (minimal)
   - Scan components for `console.log` or `// TODO` in handlers
   - Wire to appropriate APIs

## Component Categorization

### Category A: Display-Only (No Actions Needed)
- StatWidget
- KPICard
- MetricCard
- RiskCard
- SatisfactionCard
- DeadlinesList (display)

### Category B: Already Wired + Need Theme Tokens
- SessionTimeoutWarning ✅ DONE
- MFASetup (partial)
- ExpenseList (partial)
- RunningTimer
- CaseListView
- DocumentViewer
- Most components

### Category C: May Need Action Wiring (To Verify)
- Check during implementation
- Likely minimal

## Technical Decisions

### Decision 1: Inline Styles vs CSS Variables
**Chosen**: Inline styles with theme tokens
**Rationale**:
- Matches BillingSummaryCard.tsx reference pattern
- Direct access to TypeScript type safety
- No CSS variable coordination needed
- Theme switching works immediately

### Decision 2: Hover State Handling
**Chosen**: onMouseEnter/onMouseLeave event handlers
**Example**:
```typescript
onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tokens.colors.hoverPrimary}
onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.primary}
```
**Rationale**:
- Works with inline styles
- Type-safe
- Consistent with theme token approach

### Decision 3: Conditional Dark Mode Classes
**Avoid**: `dark:` Tailwind prefix classes
**Replace with**: Theme tokens that automatically adjust based on theme mode
**Rationale**: Theme provider handles light/dark switching

## Integration Points

- Theme Provider: `/frontend/src/theme/ThemeContext.tsx`
- Theme Tokens: `/frontend/src/theme/tokens.ts`
- API Clients: `/frontend/src/lib/frontend-api/*`
- Toast System: Assume available globally (verify during implementation)

## Risk Mitigation

- **Breaking Changes**: Preserve all existing logic, only update styling
- **Theme Provider**: Verify available in all component contexts
- **Type Safety**: Leverage TypeScript for theme token access
- **Testing**: Manual verification of theme switching after each batch
