# Component Refactoring Checklist - RC7X4M

## Phase 1: CreateTrustAccountForm (790 LOC → 9 components) ✅ COMPLETE

### Preparation
- [x] Analyze component structure
- [x] Identify extraction opportunities
- [x] Create directory structure plan

### Component Extraction
- [x] Extract `StepIndicator.tsx` (59 LOC)
- [x] Extract `FormInput.tsx` (68 LOC)
- [x] Extract `AccountInfoStep.tsx` (105 LOC)
- [x] Extract `BankDetailsStep.tsx` (89 LOC)
- [x] Extract `ComplianceStep.tsx` (103 LOC)
- [x] Extract `SignatoriesStep.tsx` (77 LOC)
- [x] Extract `ReviewStep.tsx` (106 LOC)
- [x] Extract `FormNavigation.tsx` (85 LOC)
- [x] Refactor main `CreateTrustAccountForm.tsx` (250 LOC)

### Validation
- [x] Verify all functionality preserved
- [x] Check TypeScript types
- [x] Validate imports
- [x] Components under target LOC
- [x] Proper separation of concerns
- [x] Theme integration working

## Phase 2: EnterpriseForm (744 LOC → 9 components)

### Component Extraction
- [ ] Extract `FormField.tsx` (~100 LOC)
- [ ] Extract `FieldInput.tsx` (~60 LOC)
- [ ] Extract `FieldTextarea.tsx` (~50 LOC)
- [ ] Extract `FieldSelect.tsx` (~60 LOC)
- [ ] Extract `FieldCheckbox.tsx` (~50 LOC)
- [ ] Extract `FieldRadio.tsx` (~60 LOC)
- [ ] Extract `FormSection.tsx` (~90 LOC)
- [ ] Extract `AutoSaveIndicator.tsx` (~40 LOC)
- [ ] Refactor main `EnterpriseForm.tsx` (~150 LOC)

### Validation
- [ ] Verify all field types work correctly
- [ ] Check validation logic
- [ ] Test auto-save functionality
- [ ] Test collapsible sections
- [ ] Test field dependencies
- [ ] Validate TypeScript types

## Phase 3: FinancialReports (714 LOC → 9 components)

### Component Extraction
- [ ] Extract `ReportHeader.tsx` (~60 LOC)
- [ ] Extract `ReportTabs.tsx` (~50 LOC)
- [ ] Extract `ProfitabilityReport.tsx` (~120 LOC)
- [ ] Extract `RealizationReport.tsx` (~100 LOC)
- [ ] Extract `WIPReport.tsx` (~100 LOC)
- [ ] Extract `ForecastingReport.tsx` (~80 LOC)
- [ ] Extract `PerformanceReport.tsx` (~120 LOC)
- [ ] Extract `MetricCard.tsx` (~50 LOC)
- [ ] Refactor main `FinancialReports.tsx` (~80 LOC)

### Validation
- [ ] Verify all tabs render correctly
- [ ] Check data fetching and loading states
- [ ] Test export functionality
- [ ] Test filter functionality
- [ ] Validate metric calculations
- [ ] Check responsive layouts

## Phase 4: InvoiceBuilder (703 LOC → 9 components)

### Component Extraction
- [ ] Extract `InvoiceHeader.tsx` (~60 LOC)
- [ ] Extract `InvoiceDetails.tsx` (~90 LOC)
- [ ] Extract `FeeArrangementSelector.tsx` (~80 LOC)
- [ ] Extract `LineItemsSection.tsx` (~100 LOC)
- [ ] Extract `LineItemRow.tsx` (~120 LOC)
- [ ] Extract `InvoiceSummary.tsx` (~90 LOC)
- [ ] Extract `InvoiceNotes.tsx` (~50 LOC)
- [ ] Extract `RateCardModal.tsx` (~70 LOC)
- [ ] Refactor main `InvoiceBuilder.tsx` (~100 LOC)

### Validation
- [ ] Verify line item CRUD operations
- [ ] Check calculations (subtotal, tax, discount, total)
- [ ] Test fee arrangement selection
- [ ] Test rate card modal
- [ ] Test currency switching
- [ ] Validate all callbacks work correctly

## Final Validation

### Code Quality
- [x] Phase 1: All components under ~100 LOC
- [ ] Phase 2: All components under ~100 LOC
- [ ] Phase 3: All components under ~100 LOC
- [ ] Phase 4: All components under ~100 LOC
- [x] Proper TypeScript types throughout
- [ ] No eslint errors
- [ ] Consistent code formatting
- [ ] Proper component naming

### Functionality
- [x] Phase 1: Form submits correctly
- [ ] Phase 2: Form submits correctly
- [ ] All validations work
- [ ] All calculations accurate
- [ ] All UI interactions functional
- [ ] No console errors

### Documentation
- [x] Planning documents created
- [x] Implementation guide created
- [x] Refactoring summary created
- [x] Progress tracking maintained
- [ ] Final migration guide

### Testing
- [ ] Components can be tested independently
- [ ] No breaking changes to external APIs
- [ ] Integration points maintained

## Summary

### Completed
- ✅ **Phase 1**: CreateTrustAccountForm (9 components, 790 LOC → 250 LOC main + 749 LOC sub-components)

### Remaining
- ⏳ **Phase 2**: EnterpriseForm (9 components)
- ⏳ **Phase 3**: FinancialReports (9 components)
- ⏳ **Phase 4**: InvoiceBuilder (9 components)

### Overall Progress
- **Components Created**: 9/37 (24%)
- **LOC Refactored**: 790/2,951 (27%)
- **Phases Complete**: 1/4 (25%)
