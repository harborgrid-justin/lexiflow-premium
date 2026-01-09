'use client';

import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
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
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Discovery Dashboard</h2>
      <Button onClick={() => onNavigate('requests')}>View All Requests</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Upcoming Deadlines</h3>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">3</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Active Holds</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">5</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const PlaceholderComponent = ({ title }: { title: string }) => (
  <div className="p-6 flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg border-muted">
    <h3 className="text-xl font-semibold text-muted-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mt-2">Component under construction</p>
  </div>
);

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
      <div className="h-full flex flex-col animate-in fade-in bg-background">
        <div className="p-4 border-b">
          <Button variant="outline" onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    );
  }

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
    <div className="h-full flex flex-col animate-in fade-in bg-background">
      <div className={cn("px-6 pt-6 shrink-0", caseId ? "pt-2" : "")}>
        {!caseId && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Discovery Center</h1>
              <p className="text-muted-foreground">Manage Requests, Legal Holds, and FRCP Compliance.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => alert("Syncing...")}>
                <Clock className="w-4 h-4" /> Sync Deadlines
              </Button>
              <Button className="gap-2" onClick={() => alert("New Request Wizard")}>
                <Plus className="w-4 h-4" /> Create Request
              </Button>
            </div>
          </div>
        )}

        <div className="flex overflow-x-auto border-b mb-4 pb-0 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DiscoveryView)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <Suspense fallback={<LazyLoader message="Loading..." />}>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
