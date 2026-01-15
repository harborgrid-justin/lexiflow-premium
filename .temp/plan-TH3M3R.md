# Implementation Plan - Theme Refactoring & Button Wiring (TH3M3R)

## References to Other Agent Work
- Previous theme work: `.temp/architecture-notes-A7K3M9.md`
- Related API work: Multiple completed agent tasks in `.temp/completed/`

## Executive Summary
**Project Scope**: Refactor 60 frontend components to replace hardcoded theme values with theme provider tokens and wire up all button actions to appropriate API endpoints.

**Key Deliverables**:
1. Replace all hardcoded Tailwind color classes with theme token inline styles
2. Connect all stub/console.log button handlers to real API implementations
3. Add proper error handling with toast notifications
4. Implement loading states for async operations
5. Add optimistic UI updates where appropriate

**Success Criteria**:
- All components use `useTheme()` hook and token-based styling
- All interactive buttons perform real operations
- Theme switching works correctly across all components
- No regression in existing functionality

**Timeline**: Batched implementation across 6 phases (10 components per phase)

## Technical Architecture Plan

### Theme Token Replacement Strategy
- [x] Use `const { tokens, theme } = useTheme()` at component top
- [x] Convert className colors to inline styles
- [x] Follow BillingSummaryCard.tsx pattern as reference
- [x] Maintain existing component structure and functionality

### Button Action Wiring Strategy
- [x] Map each button to appropriate API endpoint (billing, cases, documents, calendar, analytics, CRM)
- [x] Add loading state management
- [x] Implement error handling with toast notifications
- [x] Add optimistic UI updates for better UX
- [x] Maintain type safety throughout

### API Integration Mapping
- **Billing API** (`billing.ts`): ExpenseList, RunningTimer, LEDESBilling, BillingAnalytics
- **Cases API** (`cases.ts`): CaseListView, CaseCard, CaseHeader, CaseFilters, CaseTimeline, etc.
- **Documents API** (`documents.ts`): DocumentViewer, DocumentAnnotations, DocumentCanvas
- **Calendar API** (workflow/calendar): CalendarView, DeadlineList
- **Analytics API** (`analytics.ts`): All analytics components
- **CRM/Clients API** (`client.ts`): ClientPortalModal, ClientAnalytics, SatisfactionCard, RiskCard
- **Communications API** (`communications.ts`): Correspondence components
- **Litigation API** (`litigation.ts`): LitigationView, StrategyBuilder, PlaybookLibrary

## Implementation Phases

### Phase 1: Auth & Dashboard Core (Components 1-10)
- [ ] SessionTimeoutWarning.tsx - Theme tokens + auth API wiring
- [ ] MFASetup.tsx - Theme tokens + auth setup actions
- [ ] StatWidget.tsx - Theme tokens (display only)
- [ ] DeadlinesList.tsx - Theme tokens + deadline actions
- [ ] KPICard.tsx - Theme tokens (display only)
- [ ] ExpenseList.tsx - Theme tokens + billing API
- [ ] RunningTimer.tsx - Theme tokens + time entry API
- [ ] CaseListView.tsx - Theme tokens + cases API
- [ ] DocumentViewer.tsx - Theme tokens + document API
- [ ] DocumentAnnotations.tsx - Theme tokens + annotation API

### Phase 2: Shared Components & Utilities (Components 11-20)
- [ ] AutocompleteSelect.tsx - Theme tokens
- [ ] ConnectionStatus.tsx - Theme tokens
- [ ] ThemePreview.tsx - Theme tokens (meta component)
- [ ] AdvancedThemeCustomizer.tsx - Theme tokens (meta component)
- [ ] DocketList.tsx - Theme tokens + docket API
- [ ] ClientPortalModal.tsx - Theme tokens + client API
- [ ] ClientAnalytics.tsx - Theme tokens + analytics API
- [ ] SatisfactionCard.tsx - Theme tokens + analytics API
- [ ] RiskCard.tsx - Theme tokens + analytics API
- [ ] NotificationSystem.tsx - Theme tokens

### Phase 3: Case Management Suite (Components 21-30)
- [ ] DeleteConfirmModal.tsx - Theme tokens + delete actions
- [ ] EnhancedCaseTimeline.tsx - Theme tokens + timeline API
- [ ] CaseCard.tsx - Theme tokens + case actions
- [ ] documents.tsx (cases) - Theme tokens + document API
- [ ] FilingsTable.tsx - Theme tokens + filing actions
- [ ] PartiesTable.tsx - Theme tokens + party management
- [ ] TaskCreationModal.tsx - Theme tokens + task API
- [ ] CaseFilters.tsx - Theme tokens
- [ ] CaseTimeline.tsx - Theme tokens + timeline API
- [ ] CaseQuickActions.tsx - Theme tokens + quick actions

### Phase 4: Billing & Compliance (Components 31-40)
- [ ] billing.tsx (cases) - Theme tokens + billing API
- [ ] CaseHeader.tsx - Theme tokens + case actions
- [ ] CompliancePolicies.tsx - Theme tokens + compliance API
- [ ] CalendarView.tsx - Theme tokens + calendar API
- [ ] BillingErrorBoundary.tsx - Theme tokens
- [ ] LEDESBilling.tsx - Theme tokens + LEDES export
- [ ] PleadingDesigner.tsx - Theme tokens + pleading API
- [ ] DocumentCanvas.tsx - Theme tokens + document editing
- [ ] AIDraftingAssistant.tsx - Theme tokens + AI API
- [ ] CorrespondenceDetail.tsx - Theme tokens + correspondence API

### Phase 5: Correspondence & Forms (Components 41-50)
- [ ] ComposeCorrespondence.tsx - Theme tokens + send actions
- [ ] ComposeMessageModal.tsx - Theme tokens + message API
- [ ] CorrespondenceView.tsx - Theme tokens + correspondence API
- [ ] DynamicFormBuilder.tsx - Theme tokens + form API
- [ ] BackendHealthMonitor.tsx - Theme tokens
- [ ] DeadlineList.tsx (calendar) - Theme tokens + deadline API
- [ ] DataSourceSelector.tsx - Theme tokens
- [ ] NotificationCenter.tsx - Theme tokens + notification API
- [ ] SystemHealthDisplay.tsx - Theme tokens
- [ ] reports/index.tsx - Theme tokens + reports API

### Phase 6: Analytics & Litigation (Components 51-60)
- [ ] FilterPanel.tsx - Theme tokens
- [ ] CaseAnalytics.tsx - Theme tokens + analytics API
- [ ] DateRangeSelector.tsx - Theme tokens
- [ ] BillingAnalytics.tsx - Theme tokens + analytics API
- [ ] MetricCard.tsx - Theme tokens (display only)
- [ ] StrategyBuilder.tsx - Theme tokens + strategy API
- [ ] LitigationView.tsx - Theme tokens + litigation API
- [ ] LitigationProperties.tsx - Theme tokens + properties API
- [ ] PlaybookLibrary.tsx - Theme tokens + playbook API
- [ ] DeadlineList.tsx (duplicate check - skip if same as #4)

## Risk Assessment

**Technical Risks**:
- **Risk**: Breaking existing functionality during refactoring
  - **Mitigation**: Preserve all existing logic, only change styling and wire up stubs
- **Risk**: Inconsistent theme token application
  - **Mitigation**: Use BillingSummaryCard.tsx as reference pattern for all components
- **Risk**: API integration errors due to incorrect endpoint mapping
  - **Mitigation**: Reference existing API client implementations, add proper error handling

**Dependency Risks**:
- **Risk**: Theme provider not available in all contexts
  - **Mitigation**: Verify ThemeProvider wraps entire app, add fallbacks if needed
- **Risk**: API endpoints may not exist for all actions
  - **Mitigation**: Create placeholder implementations where needed, document TODOs

**Timeline Risks**:
- **Risk**: 60 components is large scope
  - **Mitigation**: Batch processing, systematic approach, reusable patterns

## Cross-Agent Coordination Points
- [ ] Verify theme provider setup is complete (reference A7K3M9)
- [ ] Confirm API client structure matches latest standards
- [ ] Validate error handling patterns with toast system
- [ ] Ensure no conflicts with other active refactoring work
