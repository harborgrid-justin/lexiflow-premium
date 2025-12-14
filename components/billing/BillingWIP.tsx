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
import { DataService } from '../../services/dataService';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useNotify } from '../../hooks/useNotify';

// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import { TimeEntry } from '../../types';

// ============================================================================
// COMPONENT
// ============================================================================
export const BillingWIP: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Enterprise Data Access
  const { data: entries = [] } = useQuery<TimeEntry[]>(
      [STORES.BILLING, 'all'],
      () => (DataService && DataService.billing) ? DataService.billing.getTimeEntries() : Promise.resolve([])
  );

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
        e.status === 'Unbilled' &&
        (e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.caseId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [entries, searchTerm]);

  const { mutate: generateInvoice, isLoading: isGenerating } = useMutation(
      async (selectedEntries: TimeEntry[]) => {
          if (!DataService || !DataService.billing) throw new Error("Billing service unavailable");
          // Group by Case ID first (simplified: take first case found)
          if (selectedEntries.length === 0) throw new Error("No entries selected");
          const primaryCase = selectedEntries[0].caseId;
          // Mock client resolution
          const clientName = "Client Ref " + primaryCase; 
          
          return DataService.billing.createInvoice(clientName, primaryCase, selectedEntries);
      },
      {
          invalidateKeys: [[STORES.BILLING, 'all'], [STORES.INVOICES, 'all']],
          onSuccess: (invoice) => {
              notify.success(`Invoice ${invoice.id} generated for $${invoice.amount.toFixed(2)}`);
              setSelectedIds(new Set());
          },
          onError: () => notify.error("Failed to generate invoice.")
      }
  );

  const handleGenerateClick = () => {
      const selected = filteredEntries.filter(e => selectedIds.has(e.id));
      if (selected.length === 0) {
          notify.warning("Please select at least one time entry.");
          return;
      }
      generateInvoice(selected);
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleAll = () => {
      if (selectedIds.size === filteredEntries.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredEntries.map(e => e.id)));
      }
  };

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
