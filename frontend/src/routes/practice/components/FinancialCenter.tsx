/**
 * @module components/practice/FinancialCenter
 * @category Practice Management
 * @description Financial management with operating and trust accounts.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic, interruptible
 * - Guideline 28: Theme usage is pure function of context
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for smooth transitions
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Download, Plus } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { queryKeys } from '@/utils/queryKeys';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Components
import { Button } from '@/components/atoms/Button/Button';
import { OperatingLedger } from './finance/OperatingLedger';
import { TrustLedger } from './finance/TrustLedger';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export function FinancialCenter() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');

  // Enterprise Data Hooks
  const { data: expenses } = useQuery(queryKeys.expenses.all(), () => DataService.expenses.getAll());
  const { data: trustAccounts } = useQuery(queryKeys.trust.all(), () => DataService.billing.getTrustAccounts());

  // Ensure expenses is always an array
  const expensesList = Array.isArray(expenses) ? expenses : [];
  const trustAccountsList = Array.isArray(trustAccounts) ? trustAccounts : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-4 p-1 rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="flex gap-1 p-1">
          <button
            onClick={() => setActiveTab('operating')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'operating'
                ? cn(theme.primary.DEFAULT, theme.text.inverse, "shadow")
                : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
            )}
          >
            Operating Account
          </button>
          <button
            onClick={() => setActiveTab('trust')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'trust'
                ? "bg-green-600 text-white shadow"
                : cn(theme.text.secondary, `hover:${theme.surface.highlight}`)
            )}
          >
            IOLTA / Trust
          </button>
        </div>
        <div className="flex gap-2 pr-2">
          <Button variant="outline" size="sm" icon={Download}>Export CSV</Button>
          <Button variant="primary" size="sm" icon={Plus}>Record Transaction</Button>
        </div>
      </div>

      {activeTab === 'operating' ? (
        <OperatingLedger expenses={expensesList} />
      ) : (
        <TrustLedger trustAccounts={trustAccountsList} />
      )}
    </div>
  );
};
