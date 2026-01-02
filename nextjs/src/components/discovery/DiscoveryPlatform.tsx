'use client';

import { Button } from '@/components/ui/atoms/Button/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { cn } from '@/lib/utils';
import { Archive, Briefcase, Clock, Database, FileText, History, LayoutDashboard, MessageSquare, Plus, Shield } from 'lucide-react';
import { Suspense, useState } from 'react';

// Mock Types
type DiscoveryView =
  | 'dashboard' | 'requests' | 'depositions' | 'examinations'
  | 'custodians' | 'esi' | 'productions' | 'interviews'
  | 'privilege' | 'holds' | 'collections' | 'processing'
  | 'review' | 'timeline' | 'plan' | 'doc_viewer' | 'response' | 'production_wizard';

interface DiscoveryPlatformProps {
  initialTab?: DiscoveryView;
  caseId?: string;
}

// Mock Sub-components
const DiscoveryDashboard = ({ onNavigate }: { onNavigate: (view: DiscoveryView) => void }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Discovery Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
        <h3 className="font-semibold mb-2">Pending Requests</h3>
        <p className="text-3xl font-bold text-blue-600">12</p>
      </div>
      <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
        <h3 className="font-semibold mb-2">Upcoming Deadlines</h3>
        <p className="text-3xl font-bold text-amber-600">3</p>
      </div>
      <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
        <h3 className="font-semibold mb-2">Active Holds</h3>
        <p className="text-3xl font-bold text-emerald-600">5</p>
      </div>
    </div>
    <div className="mt-6">
      <Button onClick={() => onNavigate('requests')}>View All Requests</Button>
    </div>
  </div>
);

const PlaceholderComponent = ({ title }: { title: string }) => (
  <div className="p-6 flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
    <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Component under construction</p>
  </div>
);

// Mock Navigation
const DiscoveryNavigation = ({ activeTab, setActiveTab }: { activeTab: DiscoveryView, setActiveTab: (tab: DiscoveryView) => void }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: FileText },
    { id: 'privilege', label: 'Privilege Log', icon: Shield },
    { id: 'holds', label: 'Legal Holds', icon: Archive },
    { id: 'esi', label: 'ESI', icon: Database },
    { id: 'productions', label: 'Productions', icon: Briefcase },
    { id: 'depositions', label: 'Depositions', icon: MessageSquare },
    { id: 'timeline', label: 'Timeline', icon: History },
  ];

  return (
    <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-4 pb-1 gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DiscoveryView)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default function DiscoveryPlatform({ initialTab = 'dashboard', caseId }: DiscoveryPlatformProps) {
  const [activeTab, setActiveTab] = useState<DiscoveryView>(initialTab);
  const [contextId, setContextId] = useState<string | null>(null);

  const handleNavigate = (targetView: DiscoveryView, id?: string) => {
    if (id) setContextId(id);
    setActiveTab(targetView);
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setContextId(null);
  };

  const isWizardView = ['doc_viewer', 'response', 'production_wizard'].includes(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DiscoveryDashboard onNavigate={handleNavigate} />;
      case 'requests': return <PlaceholderComponent title="Discovery Requests" />;
      case 'depositions': return <PlaceholderComponent title="Depositions" />;
      case 'examinations': return <PlaceholderComponent title="Examinations" />;
      case 'custodians': return <PlaceholderComponent title="Custodians" />;
      case 'esi': return <PlaceholderComponent title="ESI Sources" />;
      case 'productions': return <PlaceholderComponent title="Productions" />;
      case 'interviews': return <PlaceholderComponent title="Interviews" />;
      case 'privilege': return <PlaceholderComponent title="Privilege Log" />;
      case 'holds': return <PlaceholderComponent title="Legal Holds" />;
      case 'collections': return <PlaceholderComponent title="Collections" />;
      case 'processing': return <PlaceholderComponent title="Processing" />;
      case 'review': return <PlaceholderComponent title="Review" />;
      case 'timeline': return <PlaceholderComponent title="Timeline" />;
      case 'plan': return <PlaceholderComponent title="Discovery Plan" />;
      case 'doc_viewer': return <PlaceholderComponent title={`Document Viewer: ${contextId}`} />;
      case 'response': return <PlaceholderComponent title={`Response Builder: ${contextId}`} />;
      case 'production_wizard': return <PlaceholderComponent title="Production Wizard" />;
      default: return <DiscoveryDashboard onNavigate={handleNavigate} />;
    }
  };

  if (isWizardView) {
    return (
      <div className="h-full flex flex-col animate-fade-in bg-gray-50 dark:bg-gray-900">
        <div className="p-4">
          <Button variant="outline" onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in bg-gray-50 dark:bg-gray-900">
      <div className={cn("px-6 pt-6 shrink-0", caseId ? "pt-2" : "")}>
        {!caseId && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discovery Center</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage Requests, Legal Holds, and FRCP Compliance.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={Clock} onClick={() => alert("Syncing...")}>Sync Deadlines</Button>
              <Button variant="primary" icon={Plus} onClick={() => alert("New Request Wizard")}>Create Request</Button>
            </div>
          </div>
        )}

        <DiscoveryNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Suspense fallback={<LazyLoader message="Loading..." />}>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
