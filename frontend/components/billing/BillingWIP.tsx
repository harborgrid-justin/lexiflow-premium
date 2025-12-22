/**
 * @module components/billing/BillingWIP
 * @category Billing
 * @description Work-in-progress time entries ready for invoicing.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo } from 'react';
import { CheckSquare, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery, useMutation, queryClient } from '../../hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useNotify } from '../../hooks/useNotify';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useMultiSelection } from '../../hooks/useSelectionState';
import { useCallback } from 'react';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';

// Utils & Constants
import { cn } from '../../utils/cn';
import { billingQueryKeys } from '../../services/infrastructure/queryKeys';
import { validateTimeEntrySafe } from '../../services/validation/billingSchemas';
import { WIPStatusEnum } from '../../types/enums';

// Types
import { TimeEntry } from '../../types';

// ============================================================================
// INVOICE GENERATION QUEUE
// ============================================================================
class InvoiceGenerationQueue {
  private queue: Array<{ entries: TimeEntry[]; resolve: (value: any) => void; reject: (error: any) => void }> = [];
  private processing = 0;
  private readonly maxConcurrent = 2; // PDF generation is CPU-intensive

  async add(entries: TimeEntry[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ entries, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) return;

    this.processing++;
    const item = this.queue.shift();
    if (!item) {
      this.processing--;
      return;
    }

    try {
      const primaryCase = item.entries[0].caseId;
      const clientName = "Client Ref " + primaryCase;
      const invoice = await DataService.billing.createInvoice(clientName, primaryCase, item.entries);
      item.resolve(invoice);
    } catch (error) {
      item.reject(error);
    } finally {
      this.processing--;
      this.processQueue();
    }
  }
}

const invoiceQueue = new InvoiceGenerationQueue();

// ============================================================================
// COMPONENT
// ============================================================================
const BillingWIPComponent: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draftEntry, setDraftEntry] = useState<Partial<TimeEntry> | null>(null);

  // Enterprise Data Access with query keys
  const { data: entries = [] } = useQuery<TimeEntry[]>(
      billingQueryKeys.billing.wip(),
      () => (DataService && DataService.billing) ? DataService.billing.getTimeEntries() : Promise.resolve([])
  );

  // Auto-save draft time entry
  useAutoSave({
    data: draftEntry ?? {},
    onSave: useCallback(async (entry: Partial<TimeEntry>) => {
      if (!entry || !entry.description) return;
      localStorage.setItem('billing-wip-draft', JSON.stringify(entry));
    }, []),
    delay: 2000
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      if (selectedIds.size > 0) {
        handleGenerateClick();
      } else {
        notify.info('Select entries to generate invoice');
      }
    }
  });

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
        e.status === WIPStatusEnum.UNBILLED &&
        (e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.caseId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [entries, searchTerm]);

  const { mutate: generateInvoice, isLoading: isGenerating } = useMutation(
      async (selectedEntries: TimeEntry[]) => {
          if (!DataService || !DataService.billing) throw new Error("Billing service unavailable");
          if (selectedEntries.length === 0) throw new Error("No entries selected");
          
          // Validate all entries before invoicing
          const validationErrors: string[] = [];
          selectedEntries.forEach((entry, index) => {
            const result = validateTimeEntrySafe(entry as any);
            if (!result.valid) {
              validationErrors.push(`Entry ${index + 1}: ${result.errors.join(', ')}`);
            }
          });
          
          if (validationErrors.length > 0) {
            notify.error(`Validation failed: ${validationErrors[0]}`);
            throw new Error('Validation failed');
          }
          
          // Use queue for PDF generation
          return invoiceQueue.add(selectedEntries);
      },
      {
          invalidateKeys: [billingQueryKeys.billing.wip(), billingQueryKeys.billing.invoices()],
          onSuccess: (invoice) => {
              notify.success(`Invoice ${invoice.id} generated for $${invoice.amount.toFixed(2)}`);
              setSelectedIds(new Set());
              localStorage.removeItem('billing-wip-draft');
          },
          onError: () => notify.error("Failed to generate invoice.")
      }
  );

  const handleGenerateClick = useCallback(() => {
      const selected = filteredEntries.filter(e => selectedIds.has(e.id));
      if (selected.length === 0) {
          notify.warning("Please select at least one time entry.");
          return;
      }
      generateInvoice(selected);
  }, [filteredEntries, selectedIds, generateInvoice, notify]);

  const toggleSelection = useCallback((id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  }, [selectedIds]);

  const toggleAll = useCallback(() => {
      if (selectedIds.size === filteredEntries.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredEntries.map(e => e.id)));
      }
  }, [selectedIds, filteredEntries]);

  const totalUnbilled = filteredEntries.reduce((acc, curr) => acc + curr.total, 0);
  const selectedTotal = filteredEntries.filter(e => selectedIds.has(e.id)).reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("p-4 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4", theme.surface.default, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>Work In Progress</h3>
                <p className={cn("text-sm", theme.text.secondary)}>Review and approve time entries before invoicing.</p>
            </div>
            <div className={cn("text-right")}>
                <p className={cn("text-xs uppercase font-bold", theme.text.tertiary)}>Total WIP Value</p>
                <p className={cn("text-2xl font-mono font-bold text-blue-600")}>${totalUnbilled.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
        </div>

        <SearchToolbar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search unbilled time..."
            actions={
                <Button 
                    variant="primary" 
                    icon={isGenerating ? undefined : CheckSquare} 
                    onClick={handleGenerateClick}
                    disabled={isGenerating || selectedIds.size === 0}
                >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                    Generate Invoice ({selectedIds.size}) - ${selectedTotal.toFixed(2)}
                </Button>
            }
        />

        <TableContainer responsive="card">
            <TableHeader>
                <TableHead className="w-10">
                    <input 
                        type="checkbox" 
                        title="Select all entries"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={filteredEntries.length > 0 && selectedIds.size === filteredEntries.length}
                        onChange={toggleAll}
                    />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
            </TableHeader>
            <TableBody>
                {filteredEntries.map(entry => (
                    <TableRow key={entry.id} className={selectedIds.has(entry.id) ? "bg-blue-50/50" : ""}>
                        <TableCell>
                            <input 
                                type="checkbox" 
                                title="Select entry"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedIds.has(entry.id)}
                                onChange={() => toggleSelection(entry.id)}
                            />
                        </TableCell>
                        <TableCell className={cn("font-mono text-xs", theme.text.secondary)}>{entry.date}</TableCell>
                        <TableCell className={cn("font-medium", theme.text.primary)}>{entry.caseId}</TableCell>
                        <TableCell className="max-w-md truncate">{entry.description}</TableCell>
                        <TableCell className="text-right font-bold">{(entry.duration / 60).toFixed(1)}</TableCell>
                        <TableCell className="text-right text-xs text-slate-500">${entry.rate}/hr</TableCell>
                        <TableCell className={cn("text-right font-mono font-bold", theme.text.primary)}>${entry.total.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="text-blue-600">Edit</Button>
                                <Button size="sm" variant="ghost" className="text-red-600">Write-off</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                {filteredEntries.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={8} className={cn("text-center py-8 italic", theme.text.tertiary)}>No unbilled time entries found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </TableContainer>
    </div>
  );
};

// Export memoized component
export const BillingWIP = React.memo(BillingWIPComponent);


