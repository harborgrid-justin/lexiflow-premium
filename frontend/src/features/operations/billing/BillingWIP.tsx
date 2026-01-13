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
import { CheckSquare, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useTheme } from '@/features/theme';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotify } from '@/hooks/useNotify';

// Components
import { SearchToolbar } from '@/shared/ui/organisms/SearchToolbar';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';
import { Button } from '@/shared/ui/atoms/Button/Button';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// Types
import { useBillingWIP } from './hooks/useBillingWIP';

// ============================================================================
// COMPONENT
// ============================================================================
const BillingWIPComponent: React.FC = () => {
    const { theme } = useTheme();

    // Explicit State State (Rule 43: Tuples)
    const [state, actions] = useBillingWIP();

    const {
        filteredEntries,
        selectedIds,
        totalUnbilled,
        selectedTotal,
        searchTerm,
        status
    } = state;

    const {
        setSearchTerm,
        toggleSelection,
        toggleAll,
        generateInvoice
    } = actions;

    const isGenerating = status === 'submitting';
    const isLoading = status === 'loading';

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("p-4 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4", theme.surface.default, theme.border.default)}>
                <div>
                    <h3 className={cn("font-bold text-lg", theme.text.primary)}>Work In Progress</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Review and approve time entries before invoicing.</p>
                </div>
                <div className={cn("text-right")}>
                    <p className={cn("text-xs uppercase font-bold", theme.text.tertiary)}>Total WIP Value</p>
                    <p className={cn("text-2xl font-mono font-bold text-blue-600")}>${totalUnbilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
                            aria-label="Select all time entries"
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
                                    aria-label={`Select time entry for ${entry.caseId}`}
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
