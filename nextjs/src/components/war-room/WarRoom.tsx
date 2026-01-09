'use client';

import { DataService } from '@/services/data/dataService';
import {
  Briefcase,
  FileText,
  Layers,
  Mic2,
  Monitor,
  Swords,
  Target,
  Users,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { cn } from "@/lib/utils";

// Mock sub-components replaced with data-driven ones
const CommandCenter = ({ data }: { data: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Command Center</CardTitle>
      <CardDescription>Real-time trial readiness overview</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Days to Trial</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {data?.daysToTrial ?? '--'}
          </div>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Evidence Ready</div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {data?.evidenceStats?.readiness ?? 0}%
          </div>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900">
          <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending Motions</div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {data?.motions?.pending ?? 0}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EvidenceWall = ({ data }: { data: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Evidence Wall</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center text-muted-foreground border-2 border-dashed">
        {data?.evidenceCount ? (
          <div>{data.evidenceCount} Items on Wall</div>
        ) : (
          "No evidence loaded"
        )}
      </div>
    </CardContent>
  </Card>
);

const WitnessPrep = ({ data }: { data: unknown }) => (
  <Card>
    <CardHeader>
      <CardTitle>Witness Preparation</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-muted-foreground text-center py-8">
        {data?.witnesses?.length > 0 ? (
          <ul className="space-y-2">
            {data.witnesses.map((w: unknown) => (
              <li key={w.id} className="p-2 border rounded-md">{w.name}</li>
            ))}
          </ul>
        ) : "No witnesses scheduled"}
      </div>
    </CardContent>
  </Card>
);

const TrialBinder = ({ data }: { data: unknown }) => (
  <Card>
    <CardHeader>
      <CardTitle>Trial Binder</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-muted-foreground text-center py-8">
        {data?.notebook ? "Binder Ready" : "Digital Trial Binder Placeholder"}
      </div>
    </CardContent>
  </Card>
);

// Fallback plain components for sections where we might load data separately later
const AdvisoryBoard = ({ data }: { data: unknown }) => (
  <Card>
    <CardHeader>
      <CardTitle>Advisory Board</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">No advisors assigned.</div>
    </CardContent>
  </Card>
);

const OppositionManager = (_: { data: unknown }) => (
  <Card>
    <CardHeader>
      <CardTitle>Opposition Research</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">No data available.</div>
    </CardContent>
  </Card>
);

const VIEWS = [
  { id: 'command', label: 'Command Center', icon: Monitor },
  { id: 'evidence', label: 'Evidence Wall', icon: Layers },
  { id: 'witnesses', label: 'Witness Prep', icon: Mic2 },
  { id: 'binder', label: 'Trial Binder', icon: FileText },
  { id: 'advisory', label: 'Advisory', icon: Users },
  { id: 'opposition', label: 'Opposition', icon: Swords },
];

export function WarRoom({ initialData, caseId }: { initialData?: unknown, caseId?: string }) {
  const [activeView, setActiveView] = useState('command');
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(caseId || null);

  useEffect(() => {
    async function loadTrialData() {
      if (!selectedCaseId) return;
      setLoading(true);
      try {
        // Fetch trial prep data for the case
        // Assuming DataService.trial exists or using generic case data extraction
        let trialData;
        if (DataService.trial && typeof (DataService.trial as any).getOne === 'function') {
          // @ts-ignore
          trialData = await DataService.trial.getOne(selectedCaseId);
        } else {
          // Fallback: fetch case and construct mock "Trial Mode" object from it
          const caseData = await DataService.cases.getOne(selectedCaseId);
          // Dynamically build trial stats from case relations
          trialData = {
            caseId: caseData.id,
            daysToTrial: 'Unknown', // Calculate from schedule
            evidenceCount: 0,
            witnesses: []
          };
        }
        setData(trialData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadTrialData();
  }, [selectedCaseId]);

  const renderContent = () => {
    switch (activeView) {
      case 'command': return <CommandCenter data={data} />;
      case 'evidence': return <EvidenceWall data={data} />;
      case 'witnesses': return <WitnessPrep data={data} />;
      case 'binder': return <TrialBinder data={data} />;
      case 'advisory': return <AdvisoryBoard data={data} />;
      case 'opposition': return <OppositionManager data={data} />;
      default: return <CommandCenter data={data} />;
    }
  };

  if (!selectedCaseId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
        <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Matter Selected</h2>
        <p className="text-muted-foreground mb-4 text-center max-w-sm">
          Select a case to initiate the War Room environment for trial preparation.
        </p>
        <Button variant="outline" onClick={() => setSelectedCaseId('demo-1')}>
          Load Demo Matter
        </Button>
      </div>
    );
  }

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex h-full bg-muted/10">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Target className="w-5 h-5 text-primary" />
            <span>War Room</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-foreground bg-muted/40 p-2 rounded-md border">
            <Briefcase className="w-3 h-3 text-muted-foreground" />
            <span className="truncate">{selectedCaseId}</span>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {VIEWS.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <Button
                key={view.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300"
                )}
                onClick={() => setActiveView(view.id)}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {VIEWS.find(v => v.id === activeView)?.label}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
