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

// Mock sub-components
const CommandCenter = ({ data }: { data: any }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Command Center</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="text-sm text-blue-600 font-medium">Days to Trial</div>
        <div className="text-2xl font-bold text-blue-900">
          {data?.commandCenter?.daysToTrial ?? 45}
        </div>
      </div>
      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
        <div className="text-sm text-emerald-600 font-medium">Evidence Ready</div>
        <div className="text-2xl font-bold text-emerald-900">
          {data?.commandCenter?.evidenceReady ?? 87}%
        </div>
      </div>
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
        <div className="text-sm text-amber-600 font-medium">Pending Motions</div>
        <div className="text-2xl font-bold text-amber-900">
          {data?.commandCenter?.pendingMotions ?? 3}
        </div>
      </div>
    </div>
  </div>
);

const EvidenceWall = ({ data }: { data: any }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Evidence Wall</h3>
    <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
      {data?.evidenceWall?.length ? (
        <div>{data.evidenceWall.length} Items on Wall</div>
      ) : (
        "Interactive Evidence Map Placeholder"
      )}
    </div>
  </div>
);

const WitnessPrep = ({ data }: { data: any }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Witness Preparation</h3>
    <div className="text-slate-500 text-center py-8">
      {data?.witnessPrep?.length ? (
        <ul>{data.witnessPrep.map((w: any) => <li key={w.id}>{w.name}</li>)}</ul>
      ) : "No witnesses scheduled"}
    </div>
  </div>
);

const TrialBinder = ({ data }: { data: any }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Trial Binder</h3>
    <div className="text-slate-500 text-center py-8">
      {data?.trialBinder?.length
        ? `${data.trialBinder.length} Sections Created`
        : "Digital Trial Binder Placeholder"}
    </div>
  </div>
);

const AdvisoryBoard = ({ data }: { data: any }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Advisory Board</h3>
    <div className="space-y-4">
      {data?.advisors?.length > 0 ? (
        data.advisors.map((advisor: any) => (
          <div key={advisor.id} className="p-4 border rounded-lg">
            <div className="font-semibold">{advisor.name}</div>
            <div className="text-sm text-slate-500">{advisor.specialty}</div>
          </div>
        ))
      ) : (
        <div className="text-slate-500 text-center py-8">Expert Witness & Consultant Management</div>
      )}
    </div>
  </div>
);

const OppositionManager = ({ data }: { data: any }) => (
  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-medium text-slate-900 mb-4">Opposition Research</h3>
    <div className="space-y-4">
      {data?.opposition?.length > 0 ? (
        data.opposition.map((opp: any) => (
          <div key={opp.id} className="p-4 border rounded-lg">
            <div className="font-semibold">{opp.name}</div>
            <div className="text-sm text-slate-500">{opp.role}</div>
            {opp.notes && <div className="text-sm text-slate-400 mt-1">{opp.notes}</div>}
          </div>
        ))
      ) : (
        <div className="text-slate-500 text-center py-8">
          <p>No opposition research data available.</p>
          <p className="text-sm mt-2">Track opposing counsel strategies and history here.</p>
        </div>
      )}
    </div>
  </div>
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
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="text-center">
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900">Select a Case</h2>
          <p className="text-slate-500 mt-2">Choose a case to enter the War Room</p>
          <button
            onClick={() => setSelectedCase('case-1')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Select Demo Case
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Target className="w-5 h-5 text-blue-600" />
            <span>War Room</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
            <Briefcase className="w-3 h-3" />
            <span className="truncate">{initialData?.caseId || 'Smith v. Jones'}</span>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {VIEWS.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`
                  w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                `}
              >
                <Icon className="w-4 h-4 mr-3" />
                {view.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">
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
