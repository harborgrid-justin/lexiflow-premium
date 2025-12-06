import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Plus, Download } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { OperatingLedger } from './finance/OperatingLedger';
import { TrustLedger } from './finance/TrustLedger';

export const FinancialCenter: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'operating' | 'trust'>('operating');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-4 p-1 rounded-lg border", theme.surface, theme.border.default)}>
          <div className="flex gap-1 p-1">
            <button 
                onClick={() => setActiveTab('operating')}
                className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === 'operating' 
                        ? cn(theme.primary.DEFAULT, theme.text.inverse, "shadow") 
                        : cn(theme.text.secondary, `hover:${theme.surfaceHighlight}`)
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
                        : cn(theme.text.secondary, `hover:${theme.surfaceHighlight}`)
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
        <OperatingLedger />
      ) : (
        <TrustLedger />
      )}
    </div>
  );
};