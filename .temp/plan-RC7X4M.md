# Component Refactoring Plan - RC7X4M

## Overview
Break down 4 large billing and form components into smaller, focused components of approximately 90 LOC each while maintaining all existing functionality.

## Target Components
1. **CreateTrustAccountForm.tsx** (790 LOC) → ~9 components
2. **EnterpriseForm.tsx** (744 LOC) → ~8 components
3. **FinancialReports.tsx** (714 LOC) → ~8 components
4. **InvoiceBuilder.tsx** (703 LOC) → ~8 components

## Phase 1: CreateTrustAccountForm Refactoring

### Components to Extract:
1. **StepIndicator.tsx** (~60 LOC)
   - Visual progress indicator
   - Step navigation state display

2. **FormInput.tsx** (~80 LOC)
   - Reusable input component with validation
   - Error display and helper text

3. **AccountInfoStep.tsx** (~90 LOC)
   - Account number, name, type
   - Client ID and name fields

4. **BankDetailsStep.tsx** (~80 LOC)
   - Bank name, account number, routing number
   - Minimum balance, interest-bearing checkbox

5. **ComplianceStep.tsx** (~90 LOC)
   - Jurisdiction and IOLTA program ID
   - State bar approval checkboxes
   - Record retention dropdown

6. **SignatoriesStep.tsx** (~80 LOC)
   - Primary signatory input
   - Authorized signatories textarea

7. **ReviewStep.tsx** (~100 LOC)
   - Summary of all form data
   - Section-by-section review display

8. **FormNavigation.tsx** (~70 LOC)
   - Cancel, Back, Next, Submit buttons
   - Loading states

9. **CreateTrustAccountForm.tsx** (~120 LOC)
   - Main orchestrator
   - State management and validation coordination

## Phase 2: EnterpriseForm Refactoring

### Components to Extract:
1. **FormField.tsx** (~100 LOC)
   - Universal field renderer
   - Type-specific rendering logic

2. **FieldInput.tsx** (~60 LOC)
   - Text, email, number, tel, url, date inputs

3. **FieldTextarea.tsx** (~50 LOC)
   - Textarea with validation

4. **FieldSelect.tsx** (~60 LOC)
   - Select and multi-select

5. **FieldCheckbox.tsx** (~50 LOC)
   - Checkbox with inline label

6. **FieldRadio.tsx** (~60 LOC)
   - Radio button group

7. **FormSection.tsx** (~90 LOC)
   - Section wrapper with collapsible functionality
   - Grid layout management

8. **AutoSaveIndicator.tsx** (~40 LOC)
   - Auto-save status display

9. **EnterpriseForm.tsx** (~150 LOC)
   - Main form orchestrator
   - Validation and submission logic

## Phase 3: FinancialReports Refactoring

### Components to Extract:
1. **ReportHeader.tsx** (~60 LOC)
   - Title, description, period selector
   - Filter and export buttons

2. **ReportTabs.tsx** (~50 LOC)
   - Tab navigation component

3. **ProfitabilityReport.tsx** (~120 LOC)
   - Profitability metrics and breakdown

4. **RealizationReport.tsx** (~100 LOC)
   - Realization metrics and analysis

5. **WIPReport.tsx** (~100 LOC)
   - WIP summary and breakdown

6. **ForecastingReport.tsx** (~80 LOC)
   - Revenue forecasting table

7. **PerformanceReport.tsx** (~120 LOC)
   - Timekeeper and matter performance tables

8. **MetricCard.tsx** (~50 LOC)
   - Reusable metric display card

9. **FinancialReports.tsx** (~80 LOC)
   - Main orchestrator and data fetching

## Phase 4: InvoiceBuilder Refactoring

### Components to Extract:
1. **InvoiceHeader.tsx** (~60 LOC)
   - Title and action buttons (Preview, Save, Send)

2. **InvoiceDetails.tsx** (~90 LOC)
   - Invoice number, dates, currency
   - Billing period inputs

3. **FeeArrangementSelector.tsx** (~80 LOC)
   - Fee arrangement selection cards

4. **LineItemsSection.tsx** (~100 LOC)
   - Line items header and add button
   - Line item list

5. **LineItemRow.tsx** (~120 LOC)
   - Individual line item with all fields
   - Description, type, quantity, rate, amount
   - Taxable, discount, UTBMS code

6. **InvoiceSummary.tsx** (~90 LOC)
   - Subtotal, tax, discount calculations
   - Total display

7. **InvoiceNotes.tsx** (~50 LOC)
   - Notes and terms textareas

8. **RateCardModal.tsx** (~70 LOC)
   - Rate card selection modal

9. **InvoiceBuilder.tsx** (~100 LOC)
   - Main orchestrator
   - Line item state management and calculations

## Implementation Guidelines

### File Organization
- Create subdirectories for each main component
- Keep related components together
- Example: `CreateTrustAccountForm/` contains all step components

### Type Safety
- Extract shared types to separate files
- Use proper TypeScript interfaces for all props
- Maintain full type coverage

### State Management
- Pass state and handlers via props (controlled components)
- Keep state in parent component where needed
- Use proper callback memoization

### Validation
- Keep validation logic close to where it's used
- Pass validation functions as props
- Maintain existing validation behavior

### Testing Considerations
- Smaller components are easier to test
- Each component should be independently testable
- Maintain existing test coverage

## Success Criteria
- All components under ~100 LOC (target ~90 LOC)
- All existing functionality preserved
- TypeScript types properly maintained
- Imports correctly updated
- No breaking changes to external APIs
- Components remain highly cohesive
- Clear component responsibilities

## Timeline
- Phase 1: CreateTrustAccountForm - 60 minutes
- Phase 2: EnterpriseForm - 60 minutes
- Phase 3: FinancialReports - 60 minutes
- Phase 4: InvoiceBuilder - 60 minutes
- Total: ~4 hours
