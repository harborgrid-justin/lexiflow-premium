/**
 * ProductionWizard.tsx
 * Multi-step Production Set Creation Wizard
 * Industry-standard production workflow with Bates stamping
 */

import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { TextArea } from '@/components/ui/atoms/TextArea';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { DISCOVERY_QUERY_KEYS, DiscoveryRepository } from '@/services/data/repositories/DiscoveryRepository';
import { ProductionSet } from '@/types';
import { cn } from '@/utils/cn';
import { Check, CheckCircle, ChevronLeft, ChevronRight, FileText, Package, Settings } from 'lucide-react';
import React, { useState } from 'react';

interface ProductionWizardProps {
  caseId?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const ProductionWizard: React.FC<ProductionWizardProps> = ({ caseId, onComplete, onCancel }) => {
  const { theme } = useTheme();
  const notify = useNotify();

  // Access Discovery Repository
  const discoveryRepo = DataService.discovery as unknown as DiscoveryRepository;

  // Fetch documents count for initial selection
  const { data: documentsCount } = useQuery(
    ['documents', 'count', caseId],
    async () => {
      if (!caseId) return 0;
      const docs = await DataService.documents.getByCaseId(caseId);
      return docs.length;
    },
    { enabled: !!caseId }
  );

  const { mutate: createProduction, isLoading: isCreating } = useMutation(
    async (newProduction: Partial<ProductionSet>) => {
      return discoveryRepo.createProduction(newProduction);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(DISCOVERY_QUERY_KEYS.productions.all());
        notify.success('Production set created successfully');
        onComplete();
      },
      onError: () => {
        notify.error('Failed to create production set');
      }
    }
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    productionNumber: '',
    productionName: '',
    producingParty: '',
    receivingParty: '',
    productionType: 'initial' as 'initial' | 'supplemental' | 'rolling',
    dueDate: '',
    format: 'pdf' as 'native' | 'pdf' | 'tiff' | 'mixed',
    loadFileType: 'dat' as 'dat' | 'opt' | 'lfp' | 'csv',
    includeMetadata: true,
    includeText: true,
    confidentialityDesignation: '',
    batesPrefix: '',
    batesStart: '',
    notes: '',
    // Document selection
    selectedDocuments: 0,
    documentFilters: {
      responsive: true,
      dateRange: '',
      custodians: [] as string[]
    }
  });

  React.useEffect(() => {
    if (documentsCount !== undefined) {
      setFormData(prev => ({ ...prev, selectedDocuments: documentsCount }));
    }
  }, [documentsCount]);

  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Documents', icon: Package },
    { number: 3, title: 'Format', icon: Settings },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    createProduction({
      name: formData.productionName,
      productionNumber: formData.productionNumber,
      producingParty: formData.producingParty,
      receivingParty: formData.receivingParty,
      type: formData.productionType,
      dueDate: formData.dueDate,
      format: formData.format,
      loadFileType: formData.loadFileType,
      includeMetadata: formData.includeMetadata,
      includeText: formData.includeText,
      confidentialityDesignation: formData.confidentialityDesignation,
      batesPrefix: formData.batesPrefix,
      batesStart: formData.batesStart,
      notes: formData.notes,
      docCount: formData.selectedDocuments,
      status: 'Staging',
      size: '0 MB', // Initial size
      date: new Date().toISOString().split('T')[0]
    } as unknown as Partial<ProductionSet>);
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={cn("p-6 border-b", theme.border.default)}>
        <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Create Production Set</h2>
        <p className={cn("text-sm mt-1", theme.text.secondary)}>
          Follow the steps to create a new document production
        </p>
      </div>

      {/* Progress Steps */}
      <div className={cn("px-6 py-4 border-b", theme.border.default)}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors",
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isActive
                          ? "bg-blue-600 text-white"
                          : cn(theme.surface.highlight, theme.text.tertiary, theme.border.default, "border")
                    )}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className={cn("text-xs uppercase font-bold", theme.text.secondary)}>
                      Step {step.number}
                    </div>
                    <div className={cn("font-medium", isActive ? theme.text.primary : theme.text.secondary)}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-4", isCompleted ? "bg-green-600" : theme.surface.highlight)} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentStep === 1 && (
          <div className="max-w-2xl space-y-4 animate-fade-in">
            <h3 className={cn("font-bold text-lg mb-4", theme.text.primary)}>Production Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Production Number"
                value={formData.productionNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('productionNumber', e.target.value)}
                placeholder="e.g., PROD-001"
                required
              />
              <Input
                label="Production Type"
                value={formData.productionType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('productionType', e.target.value)}
                placeholder="Initial, Supplemental, or Rolling"
              />
            </div>

            <Input
              label="Production Name"
              value={formData.productionName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('productionName', e.target.value)}
              placeholder="e.g., Initial Document Production"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Producing Party"
                value={formData.producingParty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('producingParty', e.target.value)}
                placeholder="e.g., Defendant XYZ Corp"
                required
              />
              <Input
                label="Receiving Party"
                value={formData.receivingParty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('receivingParty', e.target.value)}
                placeholder="e.g., Plaintiff ABC Inc"
                required
              />
            </div>

            <Input
              label="Production Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('dueDate', e.target.value)}
            />

            <TextArea
              label="Notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('notes', e.target.value)}
              placeholder="Additional production notes..."
              rows={3}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-2xl space-y-4 animate-fade-in">
            <h3 className={cn("font-bold text-lg mb-4", theme.text.primary)}>Select Documents</h3>

            <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={cn("font-medium", theme.text.primary)}>Selected Documents</div>
                  <div className={cn("text-sm", theme.text.secondary)}>
                    {formData.selectedDocuments} documents selected
                  </div>
                </div>
                <Badge variant="info">{formData.selectedDocuments} docs</Badge>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.documentFilters.responsive}
                    onChange={(e) => updateFormData('documentFilters', {
                      ...formData.documentFilters,
                      responsive: e.target.checked
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className={cn("text-sm", theme.text.primary)}>Include only responsive documents</span>
                </label>

                <div>
                  <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>
                    Date Range Filter
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 2023-01-01 to 2023-12-31"
                    value={formData.documentFilters.dateRange}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('documentFilters', {
                      ...formData.documentFilters,
                      dateRange: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>
                    Custodian Filter
                  </label>
                  <Input
                    placeholder="Select custodians..."
                    value={formData.documentFilters.custodians.join(', ')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('documentFilters', {
                      ...formData.documentFilters,
                      custodians: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                    })}
                  />
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full">
              Advanced Document Search
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-2xl space-y-4 animate-fade-in">
            <h3 className={cn("font-bold text-lg mb-4", theme.text.primary)}>Production Format</h3>

            <div>
              <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                Production Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['native', 'pdf', 'tiff', 'mixed'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => updateFormData('format', format)}
                    className={cn(
                      "p-3 rounded border text-sm font-medium transition-colors",
                      formData.format === format
                        ? "bg-blue-600 text-white border-blue-600"
                        : cn(theme.surface.default, theme.border.default, theme.text.primary)
                    )}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>
                Load File Type
              </label>
              <select
                title="Select load file type"
                className={cn("w-full p-2 border rounded", theme.surface.default, theme.border.default)}
                value={formData.loadFileType}
                onChange={(e) => updateFormData('loadFileType', e.target.value)}
              >
                <option value="dat">DAT (Concordance)</option>
                <option value="opt">OPT (Opticon)</option>
                <option value="lfp">LFP (Summation)</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bates Prefix"
                value={formData.batesPrefix}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('batesPrefix', e.target.value)}
                placeholder="e.g., DEF"
              />
              <Input
                label="Starting Bates Number"
                value={formData.batesStart}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('batesStart', e.target.value)}
                placeholder="e.g., 000001"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includeMetadata}
                  onChange={(e) => updateFormData('includeMetadata', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className={cn("text-sm", theme.text.primary)}>Include Metadata</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.includeText}
                  onChange={(e) => updateFormData('includeText', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className={cn("text-sm", theme.text.primary)}>Include Extracted Text</span>
              </label>
            </div>

            <Input
              label="Confidentiality Designation"
              value={formData.confidentialityDesignation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('confidentialityDesignation', e.target.value)}
              placeholder="e.g., Confidential - Attorneys' Eyes Only"
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="max-w-2xl space-y-4 animate-fade-in">
            <h3 className={cn("font-bold text-lg mb-4", theme.text.primary)}>Review Production</h3>

            <div className={cn("p-6 rounded-lg border space-y-4", theme.surface.default, theme.border.default)}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Production Number</div>
                  <div className={cn("font-medium", theme.text.primary)}>{formData.productionNumber || '—'}</div>
                </div>
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Production Type</div>
                  <div className={cn("font-medium", theme.text.primary)}>{formData.productionType}</div>
                </div>
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Producing Party</div>
                  <div className={cn("font-medium", theme.text.primary)}>{formData.producingParty || '—'}</div>
                </div>
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Receiving Party</div>
                  <div className={cn("font-medium", theme.text.primary)}>{formData.receivingParty || '—'}</div>
                </div>
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Document Count</div>
                  <div className={cn("font-medium", theme.text.primary)}>{formData.selectedDocuments}</div>
                </div>
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Format</div>
                  <div className={cn("font-medium", theme.text.primary)}>{formData.format.toUpperCase()}</div>
                </div>
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Bates Range</div>
                  <div className={cn("font-medium", theme.text.primary)}>
                    {formData.batesPrefix}-{formData.batesStart} - {formData.batesPrefix}-{String(parseInt(formData.batesStart || '0') + formData.selectedDocuments - 1).padStart(6, '0')}
                  </div>
                </div>
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Due Date</div>
                  <div className={cn("font-medium", theme.text.primary)}>{formData.dueDate || '—'}</div>
                </div>
              </div>

              {formData.notes && (
                <div>
                  <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Notes</div>
                  <div className={cn("text-sm", theme.text.primary)}>{formData.notes}</div>
                </div>
              )}
            </div>

            <div className={cn("p-4 rounded-lg border border-blue-200 bg-blue-50")}>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-bold text-blue-900 text-sm">Ready to Create</div>
                  <div className="text-xs text-blue-700 mt-1">
                    Click "Create Production" to finalize this production set. Documents will be queued for processing.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className={cn("p-6 border-t flex justify-between", theme.border.default)}>
        <Button variant="secondary" onClick={currentStep === 1 ? onCancel : handleBack} icon={ChevronLeft}>
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button variant="primary" onClick={handleNext} icon={currentStep === 4 ? Check : ChevronRight}>
          {currentStep === 4 ? 'Create Production' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default ProductionWizard;
