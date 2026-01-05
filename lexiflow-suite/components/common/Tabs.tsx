
import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: any) => void;
  className?: string;
  variant?: 'pills' | 'underline' | 'segmented';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '', variant = 'segmented' }) => {
  
  if (variant === 'underline') {
    return (
      <div className={`border-b border-slate-200 ${className}`}>
        <nav className="-mb-px flex space-x-8" aria-label="Tabs" role="tablist">
          {tabs.map((tab) => {
             const label = tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1').trim();
             const isActive = activeTab === tab;
             return (
              <button
                key={tab}
                onClick={() => onChange(tab)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }
                `}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab}`}
                id={`tab-${tab}`}
              >
                {label}
              </button>
             );
          })}
        </nav>
      </div>
    );
  }

  // Default Segmented Style
  return (
    <div className={`inline-flex rounded-lg bg-slate-100 p-1 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const label = tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1').trim();
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`
              flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-all sm:px-4 sm:text-sm
              ${isActive 
                ? 'bg-white text-slate-900 shadow-sm ring-black/5' 
                : 'bg-transparent text-slate-500 ring-transparent hover:bg-slate-200/50 hover:text-slate-700'
              }
            `}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab}`}
            id={`tab-${tab}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
