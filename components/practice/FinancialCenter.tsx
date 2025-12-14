/**
 * @module components/practice/FinancialCenter
 * @category Practice Management
 * @description Financial management with operating and trust accounts.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Button } from '../common/Button';
import { OperatingLedger } from './finance/OperatingLedger';
import { TrustLedger } from './finance/TrustLedger';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export const FinancialCenter: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');

  // Enterprise Data Hooks
  const { data: expenses } = useQuery([STORES.EXPENSES, 'all'], DataService.expenses.getAll);
  const { data: trustAccounts } = useQuery([STORES.TRUST, 'all'], DataService.billing.getTrustAccounts);

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
        <OperatingLedger expenses={expenses || []} />
      ) : (
        <TrustLedger trustAccounts={trustAccounts || []} />
      )}
    </div>
  );
};
