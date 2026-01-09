'use client';

import {
  Briefcase,
  FileText,
  Layers,
  Mic2,
  Monitor,
  Swords,
  Target,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/shadcn/card";
import { Separator } from "@/components/ui/shadcn/separator";
import { cn } from "@/lib/utils";

// Mock sub-components
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
            {data?.commandCenter?.daysToTrial ?? 45}
          </div>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Evidence Ready</div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {data?.commandCenter?.evidenceReady ?? 87}%
          </div>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900">
          <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending Motions</div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {data?.commandCenter?.pendingMotions ?? 3}
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
        {data?.evidenceWall?.length ? (
          <div>{data.evidenceWall.length} Items on Wall</div>
        ) : (
          "Interactive Evidence Map Placeholder"
        )}
      </div>
    </CardContent>
  </Card>
);

const WitnessPrep = ({ data }: { data: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Witness Preparation</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-muted-foreground text-center py-8">
        {data?.witnessPrep?.length ? (
          <ul>{data.witnessPrep.map((w: any) => <li key={w.id}>{w.name}</li>)}</ul>
        ) : "No witnesses scheduled"}
      </div>
    </CardContent>
  </Card>
);

const TrialBinder = ({ data }: { data: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Trial Binder</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-muted-foreground text-center py-8">
        {data?.trialBinder?.length
          ? `${data.trialBinder.length} Sections Created`
          : "Digital Trial Binder Placeholder"}
      </div>
    </CardContent>
  </Card>
);

const AdvisoryBoard = ({ data }: { data: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Advisory Board</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {data?.advisors?.length > 0 ? (
          data.advisors.map((advisor: any) => (
            <div key={advisor.id} className="p-4 border rounded-lg">
              <div className="font-semibold">{advisor.name}</div>
              <div className="text-sm text-muted-foreground">{advisor.specialty}</div>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-center py-8">Expert Witness & Consultant Management</div>
        )}
      </div>
    </CardContent>
  </Card>
);

const OppositionManager = ({ data }: { data: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Opposition Research</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {data?.opposition?.length > 0 ? (
          data.opposition.map((opp: any) => (
            <div key={opp.id} className="p-4 border rounded-lg">
              <div className="font-semibold">{opp.name}</div>
              <div className="text-sm text-muted-foreground">{opp.role}</div>
              {opp.notes && <div className="text-sm text-muted-foreground mt-1">{opp.notes}</div>}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-center py-8">
            <p>No opposition research data available.</p>
            <p className="text-sm mt-2">Track opposing counsel strategies and history here.</p>
          </div>
        )}
      </div>
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

export function WarRoom({ initialData }: { initialData?: any }) {
  const [activeView, setActiveView] = useState('command');
  const [selectedCase, setSelectedCase] = useState<string | null>('case-1'); // Mock selected case

  const renderContent = () => {
    switch (activeView) {
      case 'command': return <CommandCenter data={initialData} />;
      case 'evidence': return <EvidenceWall data={initialData} />;
      case 'witnesses': return <WitnessPrep data={initialData} />;
      case 'binder': return <TrialBinder data={initialData} />;
      case 'advisory': return <AdvisoryBoard data={initialData} />;
      case 'opposition': return <OppositionManager data={initialData} />;
      default: return <CommandCenter data={initialData} />;
    }
  };

  if (!selectedCase) {
    return (
      <div className="flex items-center justify-center h-full bg-background p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Select a Case</h2>
          <p className="text-muted-foreground mb-6">Choose a case to enter the War Room environment for trial preparation.</p>
          <Button onClick={() => setSelectedCase('case-1')}>
            Select Demo Case
          </Button>
        </div>
      </div>
    );
  }

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
            <span className="truncate">{initialData?.caseId || 'Smith v. Jones'}</span>
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
