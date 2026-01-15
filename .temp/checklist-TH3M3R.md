# Execution Checklist - Theme Refactoring & Button Wiring (TH3M3R)

## Pre-Development Setup
- [x] Review existing agent work in `.temp/`
- [x] Validate requirements and scope (60 files)
- [x] Set up development environment
- [x] Create task tracking files
- [x] Study BillingSummaryCard.tsx reference pattern
- [x] Map API endpoints to components

## Theme Replacement Pattern
**Standard pattern to apply to all 60 components:**

### Import Statement
```typescript
import { useTheme } from '@/theme';
```

### Hook Usage (top of component)
```typescript
const { tokens, theme } = useTheme();
```

### Color Replacement Patterns
- [x] `text-gray-600` → `style={{ color: tokens.colors.textMuted }}`
- [x] `bg-white dark:bg-gray-800` → `style={{ backgroundColor: tokens.colors.surface }}`
- [x] `border-gray-200` → `style={{ borderColor: tokens.colors.border }}`
- [x] `text-blue-600` → `style={{ color: tokens.colors.primary }}`
- [x] `text-green-600` → `style={{ color: tokens.colors.success }}`
- [x] `text-red-600` → `style={{ color: tokens.colors.error }}`
- [x] `text-yellow-600` → `style={{ color: tokens.colors.warning }}`
- [x] Hover states → use tokens.colors.hoverPrimary, etc.

## Button Action Wiring Checklist

### For Each Button:
- [ ] Identify the action type (create, update, delete, fetch, export, etc.)
- [ ] Map to appropriate API endpoint
- [ ] Add loading state: `const [isLoading, setIsLoading] = useState(false)`
- [ ] Implement error handling with toast
- [ ] Add optimistic UI updates where appropriate
- [ ] Test action execution

### Standard Button Action Pattern
```typescript
const handleAction = async () => {
  setIsLoading(true);
  try {
    const result = await apiClient.someAction(data);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success('Action completed successfully');
    // Update local state or refetch data
  } catch (error) {
    toast.error('An unexpected error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

## Phase 1: Auth & Dashboard Core (10 components)
- [ ] SessionTimeoutWarning.tsx
  - [ ] Theme tokens applied
  - [ ] Extend session button → auth API
  - [ ] Logout button → auth API
- [ ] MFASetup.tsx
  - [ ] Theme tokens applied
  - [ ] Enable MFA → auth API
  - [ ] Verify code → auth API
- [ ] StatWidget.tsx
  - [ ] Theme tokens applied
  - [ ] (Display only - no actions)
- [ ] DeadlinesList.tsx (dashboard)
  - [ ] Theme tokens applied
  - [ ] View deadline → navigation
  - [ ] Add deadline → calendar API
- [ ] KPICard.tsx
  - [ ] Theme tokens applied
  - [ ] (Display only - no actions)
- [ ] ExpenseList.tsx
  - [ ] Theme tokens applied
  - [ ] Add expense → billing API
  - [ ] Edit expense → billing API
  - [ ] Delete expense → billing API
- [ ] RunningTimer.tsx
  - [ ] Theme tokens applied
  - [ ] Start timer → time entry API
  - [ ] Stop timer → time entry API
  - [ ] Save entry → billing API
- [ ] CaseListView.tsx
  - [ ] Theme tokens applied
  - [ ] Create case → cases API
  - [ ] View case → navigation
  - [ ] Filter cases → local state
- [ ] DocumentViewer.tsx
  - [ ] Theme tokens applied
  - [ ] Download document → documents API
  - [ ] Share document → documents API
  - [ ] Delete document → documents API
- [ ] DocumentAnnotations.tsx
  - [ ] Theme tokens applied
  - [ ] Add annotation → documents API
  - [ ] Edit annotation → documents API
  - [ ] Delete annotation → documents API

## Phase 2: Shared Components & Utilities (10 components)
- [ ] AutocompleteSelect.tsx
  - [ ] Theme tokens applied
  - [ ] Selection handling
- [ ] ConnectionStatus.tsx
  - [ ] Theme tokens applied
  - [ ] Reconnect action
- [ ] ThemePreview.tsx
  - [ ] Theme tokens applied
  - [ ] (Meta component - uses theme)
- [ ] AdvancedThemeCustomizer.tsx
  - [ ] Theme tokens applied
  - [ ] Save theme → theme API
  - [ ] Reset theme → theme API
- [ ] DocketList.tsx
  - [ ] Theme tokens applied
  - [ ] View docket entry → docket API
  - [ ] Add docket entry → docket API
- [ ] ClientPortalModal.tsx
  - [ ] Theme tokens applied
  - [ ] Grant access → client API
  - [ ] Revoke access → client API
- [ ] ClientAnalytics.tsx
  - [ ] Theme tokens applied
  - [ ] Export data → analytics API
- [ ] SatisfactionCard.tsx
  - [ ] Theme tokens applied
  - [ ] View details → navigation
- [ ] RiskCard.tsx
  - [ ] Theme tokens applied
  - [ ] View details → navigation
- [ ] NotificationSystem.tsx
  - [ ] Theme tokens applied
  - [ ] Mark as read → notifications API
  - [ ] Dismiss notification → local state

## Phase 3: Case Management Suite (10 components)
- [ ] DeleteConfirmModal.tsx
  - [ ] Theme tokens applied
  - [ ] Confirm delete → cases API
- [ ] EnhancedCaseTimeline.tsx
  - [ ] Theme tokens applied
  - [ ] Add event → timeline API
  - [ ] Filter events → local state
- [ ] CaseCard.tsx
  - [ ] Theme tokens applied
  - [ ] View case → navigation
  - [ ] Quick actions → cases API
- [ ] documents.tsx (cases)
  - [ ] Theme tokens applied
  - [ ] Upload document → documents API
  - [ ] View document → navigation
- [ ] FilingsTable.tsx
  - [ ] Theme tokens applied
  - [ ] Add filing → cases API
  - [ ] Edit filing → cases API
- [ ] PartiesTable.tsx
  - [ ] Theme tokens applied
  - [ ] Add party → cases API
  - [ ] Edit party → cases API
  - [ ] Remove party → cases API
- [ ] TaskCreationModal.tsx
  - [ ] Theme tokens applied
  - [ ] Create task → workflow API
- [ ] CaseFilters.tsx
  - [ ] Theme tokens applied
  - [ ] Apply filters → local state
  - [ ] Reset filters → local state
- [ ] CaseTimeline.tsx
  - [ ] Theme tokens applied
  - [ ] Add event → cases API
- [ ] CaseQuickActions.tsx
  - [ ] Theme tokens applied
  - [ ] Close case → cases API
  - [ ] Archive case → cases API
  - [ ] Assign case → cases API

## Phase 4: Billing & Compliance (10 components)
- [ ] billing.tsx (cases)
  - [ ] Theme tokens applied
  - [ ] Generate invoice → billing API
  - [ ] View invoice → navigation
- [ ] CaseHeader.tsx
  - [ ] Theme tokens applied
  - [ ] Edit case → cases API
  - [ ] Star case → cases API
- [ ] CompliancePolicies.tsx
  - [ ] Theme tokens applied
  - [ ] Update policy → compliance API
  - [ ] Test policy → compliance API
- [ ] CalendarView.tsx
  - [ ] Theme tokens applied
  - [ ] Add event → calendar API
  - [ ] Edit event → calendar API
  - [ ] Delete event → calendar API
- [ ] BillingErrorBoundary.tsx
  - [ ] Theme tokens applied
  - [ ] Reset → local state
- [ ] LEDESBilling.tsx
  - [ ] Theme tokens applied
  - [ ] Export LEDES → billing API
  - [ ] Validate data → billing API
- [ ] PleadingDesigner.tsx
  - [ ] Theme tokens applied
  - [ ] Save pleading → documents API
  - [ ] Generate pleading → AI API
- [ ] DocumentCanvas.tsx
  - [ ] Theme tokens applied
  - [ ] Save changes → documents API
  - [ ] Undo/redo → local state
- [ ] AIDraftingAssistant.tsx
  - [ ] Theme tokens applied
  - [ ] Generate draft → AI API
  - [ ] Accept suggestion → local state
- [ ] CorrespondenceDetail.tsx
  - [ ] Theme tokens applied
  - [ ] Reply → correspondence API
  - [ ] Forward → correspondence API

## Phase 5: Correspondence & Forms (10 components)
- [ ] ComposeCorrespondence.tsx
  - [ ] Theme tokens applied
  - [ ] Send message → correspondence API
  - [ ] Save draft → correspondence API
- [ ] ComposeMessageModal.tsx
  - [ ] Theme tokens applied
  - [ ] Send message → communications API
  - [ ] Cancel → local state
- [ ] CorrespondenceView.tsx
  - [ ] Theme tokens applied
  - [ ] View message → navigation
  - [ ] Compose new → modal
- [ ] DynamicFormBuilder.tsx
  - [ ] Theme tokens applied
  - [ ] Save form → forms API
  - [ ] Submit form → forms API
- [ ] BackendHealthMonitor.tsx
  - [ ] Theme tokens applied
  - [ ] Refresh status → health API
- [ ] DeadlineList.tsx (calendar)
  - [ ] Theme tokens applied
  - [ ] Add deadline → calendar API
  - [ ] Complete deadline → calendar API
- [ ] DataSourceSelector.tsx
  - [ ] Theme tokens applied
  - [ ] Select source → local state
- [ ] NotificationCenter.tsx
  - [ ] Theme tokens applied
  - [ ] Mark all read → notifications API
  - [ ] Clear all → notifications API
- [ ] SystemHealthDisplay.tsx
  - [ ] Theme tokens applied
  - [ ] Refresh → health API
- [ ] reports/index.tsx
  - [ ] Theme tokens applied
  - [ ] Generate report → reports API
  - [ ] Export report → reports API

## Phase 6: Analytics & Litigation (10 components)
- [ ] FilterPanel.tsx
  - [ ] Theme tokens applied
  - [ ] Apply filters → local state
  - [ ] Reset filters → local state
- [ ] CaseAnalytics.tsx
  - [ ] Theme tokens applied
  - [ ] Export data → analytics API
  - [ ] Refresh data → analytics API
- [ ] DateRangeSelector.tsx
  - [ ] Theme tokens applied
  - [ ] Apply range → local state
- [ ] BillingAnalytics.tsx
  - [ ] Theme tokens applied
  - [ ] Export data → analytics API
  - [ ] Refresh data → analytics API
- [ ] MetricCard.tsx
  - [ ] Theme tokens applied
  - [ ] (Display only - no actions)
- [ ] StrategyBuilder.tsx
  - [ ] Theme tokens applied
  - [ ] Save strategy → litigation API
  - [ ] Load template → litigation API
- [ ] LitigationView.tsx
  - [ ] Theme tokens applied
  - [ ] Create strategy → litigation API
  - [ ] View strategy → navigation
- [ ] LitigationProperties.tsx
  - [ ] Theme tokens applied
  - [ ] Update properties → litigation API
- [ ] PlaybookLibrary.tsx
  - [ ] Theme tokens applied
  - [ ] Load playbook → litigation API
  - [ ] Save playbook → litigation API
- [ ] Duplicate check for DeadlineList.tsx (file #60)
  - [ ] Verify if same as #4 or #46, skip if duplicate

## Testing & Validation
- [ ] All 60 files updated with theme tokens
- [ ] All button actions wired to APIs or state management
- [ ] Theme switching tested across all components
- [ ] Error handling verified
- [ ] Loading states working correctly
- [ ] Optimistic updates functioning
- [ ] No console errors
- [ ] No TypeScript errors

## Completion Checklist
- [ ] All planned features implemented
- [ ] Documentation updated (if needed)
- [ ] Code reviewed and approved
- [ ] All changes maintain existing functionality
- [ ] Theme consistency verified
- [ ] Cross-browser testing complete
- [ ] Completion summary created
- [ ] Files ready to move to `.temp/completed/`
