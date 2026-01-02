'use client';

import { Button } from '@/components/ui/atoms/Button/Button';
import { Tabs } from '@/components/ui/molecules/Tabs/Tabs';
import { Rocket, Save } from 'lucide-react';
import { useState } from 'react';
import { LitigationScheduleView } from './LitigationScheduleView';
import { OutcomeSimulator } from './OutcomeSimulator';
import { PlaybookLibrary } from './PlaybookLibrary';
import { StrategyCanvas } from './StrategyCanvas';

export const LitigationStrategyView = () => {
  const [activeTab, setActiveTab] = useState('canvas');

  const tabs = [
    { id: 'canvas', label: 'Strategy Canvas' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'templates', label: 'Playbooks' },
    { id: 'simulate', label: 'Simulation' },
  ];

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Litigation Strategy</h1>
          <p className="text-slate-500 dark:text-slate-400">Design case lifecycles and visualize timelines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button>
            <Rocket className="h-4 w-4 mr-2" />
            Deploy Strategy
          </Button>
        </div>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />

      <div className="flex-1">
        {activeTab === 'canvas' && <StrategyCanvas />}
        {activeTab === 'timeline' && <LitigationScheduleView />}
        {activeTab === 'templates' && <PlaybookLibrary />}
        {activeTab === 'simulate' && <OutcomeSimulator />}
      </div>
    </div>
  );
};
