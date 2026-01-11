# Component Refactoring Implementation Guide - RC7X4M

This guide provides the exact implementation approach for completing the remaining refactoring phases.

## Phase 2: EnterpriseForm Implementation Guide

### Step 1: Create FormField.tsx
```typescript
// /workspaces/lexiflow-premium/frontend/src/components/enterprise/ui/components/FormField.tsx

import React from 'react';
import { FormField as FormFieldType } from '../EnterpriseForm';
import { FieldInput } from './FieldInput';
import { FieldTextarea } from './FieldTextarea';
import { FieldSelect } from './FieldSelect';
import { FieldCheckbox } from './FieldCheckbox';
import { FieldRadio } from './FieldRadio';
import { FieldPassword } from './FieldPassword';
import { FieldFile } from './FieldFile';

interface FormFieldProps {
  field: FormFieldType;
  value: unknown;
  error?: string;
  loading?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  error,
  loading,
  showPassword,
  onTogglePassword,
  onChange,
  onBlur,
}) => {
  const commonProps = {
    field,
    value,
    error,
    loading,
    onChange,
    onBlur,
  };

  switch (field.type) {
    case 'textarea':
      return <FieldTextarea {...commonProps} />;
    case 'select':
      return <FieldSelect {...commonProps} />;
    case 'checkbox':
      return <FieldCheckbox {...commonProps} />;
    case 'radio':
      return <FieldRadio {...commonProps} />;
    case 'password':
      return <FieldPassword {...commonProps} showPassword={showPassword} onTogglePassword={onTogglePassword} />;
    case 'file':
      return <FieldFile {...commonProps} />;
    default:
      return <FieldInput {...commonProps} />;
  }
};
```

### Step 2: Create Field-Specific Components

Each field component follows this pattern:

```typescript
// FieldInput.tsx
interface FieldInputProps {
  field: FormFieldType;
  value: unknown;
  error?: string;
  loading?: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}

export const FieldInput: React.FC<FieldInputProps> = ({ field, value, error, loading, onChange, onBlur }) => {
  // Implementation with Input component from shared UI
};

// FieldTextarea.tsx - Similar pattern
// FieldSelect.tsx - Similar pattern
// FieldCheckbox.tsx - Similar pattern
// FieldRadio.tsx - Similar pattern
```

### Step 3: Create FormSection.tsx

```typescript
// FormSection.tsx
interface FormSectionProps {
  section: FormSection;
  sectionIdx: number;
  isExpanded: boolean;
  fields: React.ReactNode[];
  onToggle: (idx: number) => void;
}

export const FormSection: React.FC<FormSectionProps> = ({
  section,
  sectionIdx,
  isExpanded,
  fields,
  onToggle,
}) => {
  return (
    <div className={/* styling */}>
      {section.title && (
        <button onClick={() => section.collapsible && onToggle(sectionIdx)}>
          <h3>{section.title}</h3>
          {section.collapsible && <ChevronIcon />}
        </button>
      )}
      <AnimatePresence>
        {isExpanded && (
          <motion.div className={`grid grid-cols-${section.columns || 1}`}>
            {fields}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

### Step 4: Create AutoSaveIndicator.tsx

```typescript
interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ isSaving, lastSaved }) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span>Last saved at {lastSaved.toLocaleTimeString()}</span>
        </>
      ) : null}
    </div>
  );
};
```

### Step 5: Refactor Main EnterpriseForm.tsx

```typescript
// Main component becomes orchestrator
export const EnterpriseForm: React.FC<EnterpriseFormProps> = ({ ... }) => {
  // State management remains here
  const [formData, setFormData] = useState(...);
  const [errors, setErrors] = useState(...);

  // Render sections using FormSection component
  return (
    <form onSubmit={handleSubmit}>
      {autoSave && <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />}

      {sections.map((section, idx) => (
        <FormSection
          key={idx}
          section={section}
          sectionIdx={idx}
          isExpanded={expandedSections[idx]}
          fields={section.fields.map(field => (
            <FormField
              key={field.name}
              field={field}
              value={formData[field.name]}
              error={errors[field.name]}
              onChange={(v) => handleFieldChange(field.name, v)}
              onBlur={() => handleBlur(field.name)}
            />
          ))}
          onToggle={toggleSection}
        />
      ))}

      {/* Form actions remain */}
    </form>
  );
};
```

## Phase 3: FinancialReports Implementation Guide

### Step 1: Extract MetricCard.tsx

```typescript
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, iconColor, trend }) => {
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          {trend && (
            <div className="mt-1 flex items-center gap-1">
              {trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`rounded-full p-3 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
```

### Step 2: Extract Report Components

Each report tab becomes a component:

```typescript
// ProfitabilityReport.tsx
interface ProfitabilityReportProps {
  profitability: ProfitabilityMetrics | null;
  formatCurrency: (amount: number) => string;
  formatPercent: (value: number) => string;
}

export const ProfitabilityReport: React.FC<ProfitabilityReportProps> = ({ profitability, formatCurrency, formatPercent }) => {
  return (
    <div className="space-y-6">
      {/* Summary Metrics using MetricCard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Gross Revenue"
          value={profitability ? formatCurrency(profitability.grossRevenue) : '-'}
          icon={DollarSign}
          iconColor="bg-blue-50"
          trend={{ value: '+12.3% YoY', direction: 'up', isPositive: true }}
        />
        {/* More metric cards */}
      </div>

      {/* Detailed Breakdown */}
      <div className="rounded-lg border p-6">
        {/* Breakdown table */}
      </div>
    </div>
  );
};

// Similar pattern for:
// - RealizationReport.tsx
// - WIPReport.tsx
// - ForecastingReport.tsx
// - PerformanceReport.tsx
```

### Step 3: Extract ReportHeader.tsx

```typescript
interface ReportHeaderProps {
  selectedPeriod: 'monthly' | 'quarterly' | 'yearly';
  onPeriodChange: (period: 'monthly' | 'quarterly' | 'yearly') => void;
  onFilterClick: () => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ selectedPeriod, onPeriodChange, onFilterClick, onExport }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2>Financial Reports & Analytics</h2>
        <p>Comprehensive financial analysis and performance metrics</p>
      </div>
      <div className="flex gap-3">
        <select value={selectedPeriod} onChange={(e) => onPeriodChange(e.target.value)}>
          {/* Options */}
        </select>
        <button onClick={onFilterClick}>
          <Filter /> Filters
        </button>
        <button onClick={() => onExport('excel')}>
          <Download /> Export
        </button>
      </div>
    </div>
  );
};
```

### Step 4: Extract ReportTabs.tsx

```typescript
type TabType = 'profitability' | 'realization' | 'wip' | 'forecasting' | 'performance';

interface ReportTabsProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const ReportTabs: React.FC<ReportTabsProps> = ({ selectedTab, onTabChange }) => {
  const tabs: TabType[] = ['profitability', 'realization', 'wip', 'forecasting', 'performance'];

  return (
    <div className="border-b">
      <nav className="flex space-x-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={selectedTab === tab ? 'border-b-2 border-blue-500' : ''}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
};
```

### Step 5: Refactor Main FinancialReports.tsx

```typescript
export const FinancialReports: React.FC<FinancialReportsProps> = ({ dateRange, onExport }) => {
  // State and data fetching remain
  const [selectedTab, setSelectedTab] = useState<TabType>('profitability');
  const [profitability, setProfitability] = useState<ProfitabilityMetrics | null>(null);
  // ... other state

  // Helper functions
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <ReportHeader
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onFilterClick={() => setShowFilters(true)}
        onExport={onExport}
      />

      <ReportTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />

      {/* Render selected tab */}
      {selectedTab === 'profitability' && (
        <ProfitabilityReport profitability={profitability} formatCurrency={formatCurrency} formatPercent={formatPercent} />
      )}
      {selectedTab === 'realization' && (
        <RealizationReport realization={realization} formatCurrency={formatCurrency} formatPercent={formatPercent} />
      )}
      {/* ... other tabs */}
    </div>
  );
};
```

## Phase 4: InvoiceBuilder Implementation Guide

### Step 1: Extract InvoiceHeader.tsx

```typescript
interface InvoiceHeaderProps {
  onPreview: () => void;
  onSave: () => void;
  onSend: () => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ onPreview, onSave, onSend }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2>Invoice Builder</h2>
        <p>Create professional invoices with advanced billing features</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onPreview}><Eye /> Preview</button>
        <button onClick={onSave}><Save /> Save Draft</button>
        <button onClick={onSend}><Send /> Send Invoice</button>
      </div>
    </div>
  );
};
```

### Step 2: Extract InvoiceDetails.tsx

```typescript
interface InvoiceDetailsProps {
  invoiceData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    periodStart: string;
    periodEnd: string;
  };
  selectedCurrency: string;
  currencies: Currency[];
  onInvoiceDataChange: (field: string, value: string) => void;
  onCurrencyChange: (currency: string) => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoiceData,
  selectedCurrency,
  currencies,
  onInvoiceDataChange,
  onCurrencyChange,
}) => {
  return (
    <div className="rounded-lg border p-6">
      <h3>Invoice Details</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Invoice number, dates, currency inputs */}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Billing period inputs */}
      </div>
    </div>
  );
};
```

### Step 3: Extract LineItemRow.tsx

```typescript
interface LineItemRowProps {
  item: InvoiceLineItem;
  formatCurrency: (amount: number) => string;
  onUpdate: (id: string, field: keyof InvoiceLineItem, value: unknown) => void;
  onRemove: (id: string) => void;
  onCopy: (item: InvoiceLineItem) => void;
}

export const LineItemRow: React.FC<LineItemRowProps> = ({
  item,
  formatCurrency,
  onUpdate,
  onRemove,
  onCopy,
}) => {
  return (
    <div className="rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-6">
        {/* Description, Type, Quantity, Rate, Amount */}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Taxable, Discount, UTBMS Code */}
      </div>
    </div>
  );
};
```

### Step 4: Extract InvoiceSummary.tsx

```typescript
interface InvoiceSummaryProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  formatCurrency: (amount: number) => string;
  onTaxRateChange: (rate: number) => void;
  onDiscountChange: (percent: number) => void;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotal,
  taxRate,
  taxAmount,
  discountPercent,
  discountAmount,
  total,
  formatCurrency,
  onTaxRateChange,
  onDiscountChange,
}) => {
  return (
    <div className="rounded-lg border p-6">
      <h3>Invoice Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <div>
            <span>Tax</span>
            <input type="number" value={taxRate} onChange={(e) => onTaxRateChange(parseFloat(e.target.value))} />
          </div>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between">
          <div>
            <span>Discount</span>
            <input type="number" value={discountPercent} onChange={(e) => onDiscountChange(parseFloat(e.target.value))} />
          </div>
          <span>-{formatCurrency(discountAmount)}</span>
        </div>
        <div className="flex justify-between border-t pt-3">
          <span>Total</span>
          <span className="text-2xl font-bold">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};
```

### Step 5: Refactor Main InvoiceBuilder.tsx

```typescript
export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onSave, onSend, onPreview }) => {
  // State management
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [invoiceData, setInvoiceData] = useState({...});

  // Calculation functions
  const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + item.amount, 0);
  const calculateTaxAmount = () => { /* logic */ };
  const calculateDiscountAmount = () => { /* logic */ };
  const calculateTotal = () => { /* logic */ };

  return (
    <div className="space-y-6">
      <InvoiceHeader onPreview={onPreview} onSave={onSave} onSend={onSend} />

      <InvoiceDetails
        invoiceData={invoiceData}
        selectedCurrency={selectedCurrency}
        currencies={currencies}
        onInvoiceDataChange={(field, value) => setInvoiceData({ ...invoiceData, [field]: value })}
        onCurrencyChange={setSelectedCurrency}
      />

      <FeeArrangementSelector
        arrangements={feeArrangements}
        selectedId={selectedFeeArrangement}
        onSelect={setSelectedFeeArrangement}
      />

      <LineItemsSection
        items={lineItems}
        onAdd={addLineItem}
        formatCurrency={formatCurrency}
        onUpdate={updateLineItem}
        onRemove={removeLineItem}
        onCopy={handleCopyLineItem}
      />

      <InvoiceSummary
        subtotal={calculateSubtotal()}
        taxRate={invoiceData.taxRate}
        taxAmount={calculateTaxAmount()}
        discountPercent={invoiceData.discountPercent}
        discountAmount={calculateDiscountAmount()}
        total={calculateTotal()}
        formatCurrency={formatCurrency}
        onTaxRateChange={(rate) => setInvoiceData({ ...invoiceData, taxRate: rate })}
        onDiscountChange={(percent) => setInvoiceData({ ...invoiceData, discountPercent: percent })}
      />

      <InvoiceNotes notes={invoiceData.notes} terms={invoiceData.terms} onChange={setInvoiceData} />
    </div>
  );
};
```

## Common Patterns Across All Phases

### 1. State Management Pattern
- **Parent component** owns state
- **Child components** receive state via props
- **Callbacks** flow up from children to parent

### 2. File Organization
```
ComponentName/
├── index.ts (re-export)
├── ComponentName.tsx (main orchestrator)
└── components/
    ├── SubComponent1.tsx
    ├── SubComponent2.tsx
    └── ...
```

### 3. Props Interface Pattern
```typescript
interface ComponentNameProps {
  // Data props
  data: DataType;

  // State props
  isLoading?: boolean;
  error?: string;

  // Callback props
  onChange: (value: ValueType) => void;
  onSubmit: () => void;

  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  className?: string;
}
```

### 4. Component Structure Pattern
```typescript
export const ComponentName: React.FC<ComponentNameProps> = ({
  data,
  isLoading,
  error,
  onChange,
  onSubmit,
  variant = 'primary',
  className,
}) => {
  const { theme } = useTheme();

  // Derived state
  const processedData = useMemo(() => processData(data), [data]);

  // Event handlers
  const handleChange = useCallback((value) => {
    onChange(value);
  }, [onChange]);

  // Render
  return (
    <div className={cn(baseStyles, className)}>
      {/* Component content */}
    </div>
  );
};
```

## Next Implementation Steps

1. **Complete Phase 2** (EnterpriseForm):
   - Create all 9 components in order
   - Test each component independently
   - Integrate into main component
   - Verify all functionality

2. **Complete Phase 3** (FinancialReports):
   - Create MetricCard first (used by multiple reports)
   - Create report components
   - Create header and tabs
   - Integrate and test

3. **Complete Phase 4** (InvoiceBuilder):
   - Create smaller components first (header, notes)
   - Create line item components
   - Create summary component
   - Integrate and test

4. **Final Validation**:
   - Run all tests
   - Check TypeScript compilation
   - Verify no regressions
   - Update documentation
