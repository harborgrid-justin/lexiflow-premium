'use client';

import { Button } from '@/components/ui/atoms/Button/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { cn } from '@/lib/utils';
import { Box, FileSearch, History, LayoutDashboard, Lock, Plus, Search } from 'lucide-react';
import { Suspense, useCallback, useMemo, useState } from 'react';

// Mock Types
type ViewMode = 'dashboard' | 'inventory' | 'intake' | 'chain_of_custody' | 'forensics' | 'detail';

interface EvidenceVaultProps {
  onNavigateToCase?: (caseId: string) => void;
  initialTab?: ViewMode;
  caseId?: string;
}

// Mock Data
const MOCK_EVIDENCE_ITEMS = [
  { id: '1', title: 'Hard Drive - Seagate 2TB', type: 'Physical', status: 'In Custody', custodian: 'John Doe' },
  { id: '2', title: 'Email Archive - PST', type: 'Digital', status: 'Processing', custodian: 'Jane Smith' },
  { id: '3', title: 'iPhone 13 Pro', type: 'Physical', status: 'In Custody', custodian: 'Robert Johnson' },
];

// Mock Sub-components
const EvidenceDetail = ({ selectedItem, handleBack }: { selectedItem: any, handleBack: () => void }) => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
      <Button variant="outline" onClick={handleBack}>Back to Inventory</Button>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500">Type</p>
        <p className="font-medium">{selectedItem.type}</p>
      </div>
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500">Status</p>
        <p className="font-medium">{selectedItem.status}</p>
      </div>
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500">Custodian</p>
        <p className="font-medium">{selectedItem.custodian}</p>
      </div>
    </div>
  </div>
);

const EvidenceVaultContent = ({ view, onIntakeClick, onItemClick }: { view: ViewMode, onIntakeClick: () => void, onItemClick: (item: any) => void }) => {
  if (view === 'dashboard') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">Total Items</h3>
          <p className="text-3xl font-bold text-blue-600">142</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">In Custody</h3>
          <p className="text-3xl font-bold text-emerald-600">89</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">Pending Intake</h3>
          <p className="text-3xl font-bold text-amber-600">12</p>
        </div>
      </div>
    );
  }

  if (view === 'inventory') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold">Evidence Inventory</h3>
          <Button size="sm" onClick={onIntakeClick} icon={Plus}>Log New Item</Button>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {MOCK_EVIDENCE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex justify-between items-center"
              onClick={() => onItemClick(item)}
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.type} • {item.custodian}</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 capitalize">{view.replace(/_/g, ' ')}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Module under construction</p>
    </div>
  );
};

// Mock Tabs Configuration
const EVIDENCE_PARENT_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    subTabs: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Inventory', icon: Box },
    ]
  },
  {
    id: 'custody',
    label: 'Chain of Custody',
    icon: Lock,
    subTabs: [
      { id: 'chain_of_custody', label: 'Custody Log', icon: History },
      { id: 'intake', label: 'Intake Wizard', icon: Plus },
    ]
  },
  {
    id: 'forensics',
    label: 'Forensics',
    icon: FileSearch,
    subTabs: [
      { id: 'forensics', label: 'Analysis', icon: Search },
    ]
  }
];

export default function EvidenceVault({ onNavigateToCase, initialTab = 'dashboard', caseId }: EvidenceVaultProps) {
  const [view, setView] = useState<ViewMode>(initialTab);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedItem(null);
    setView('inventory');
  };

  const activeParentTab = useMemo(() =>
    EVIDENCE_PARENT_TABS.find(p => p.subTabs.some(s => s.id === view)) || EVIDENCE_PARENT_TABS[0],
    [view]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = EVIDENCE_PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setView(parent.subTabs[0].id as ViewMode);
    }
  }, []);

  if (view === 'detail' && selectedItem) {
    return (
      <div className="h-full flex flex-col animate-fade-in p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <EvidenceDetail
          selectedItem={selectedItem}
          handleBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in bg-gray-50 dark:bg-gray-900">
      <div className={cn("px-6 pt-6 shrink-0", caseId ? "pt-2" : "")}>
        {!caseId && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Evidence Vault</h1>
              <p className="text-gray-500 dark:text-gray-400">Secure Chain of Custody & Forensic Asset Management.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={Search} onClick={() => setView('inventory')}>Search Vault</Button>
              <Button variant="primary" icon={Plus} onClick={() => setView('intake')}>Log New Item</Button>
            </div>
          </div>
        )}

        <div className="hidden md:flex space-x-6 border-b border-gray-200 dark:border-gray-700 mb-4">
          {EVIDENCE_PARENT_TABS.map(parent => {
            const Icon = parent.icon;
            const isActive = activeParentTab.id === parent.id;
            return (
              <button
                key={parent.id}
                onClick={() => handleParentTabChange(parent.id)}
                className={cn(
                  "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                  isActive
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                <Icon className={cn("h-4 w-4 mr-2", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400")} />
                {parent.label}
              </button>
            );
          })}
        </div>

        {activeParentTab.subTabs.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            {activeParentTab.subTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as ViewMode)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                      : "bg-transparent text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-400")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <Suspense fallback={<LazyLoader message="Loading Evidence Module..." />}>
            <EvidenceVaultContent
              view={view}
              onIntakeClick={() => setView('intake')}
              onItemClick={handleItemClick}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
