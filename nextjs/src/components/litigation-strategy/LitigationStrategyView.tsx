import React from 'react';
import { PlaybookLibrary } from './PlaybookLibrary';
import { OutcomeSimulator } from './OutcomeSimulator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';

export const LitigationStrategyView: React.FC<{ caseId?: string }> = ({ caseId }) => {
  return (
    <div className="h-full p-6 space-y-6 bg-background">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Litigation Strategy</h1>
        <p className="text-muted-foreground">
          AI-driven insights and strategic planning tools for your active matters.
        </p>
      </div>

      <Tabs defaultValue="simulator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulator">Outcome Simulator</TabsTrigger>
          <TabsTrigger value="playbooks">Playbook Library</TabsTrigger>
        </TabsList>
        <TabsContent value="simulator" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-1 lg:col-span-2">
              <OutcomeSimulator caseId={caseId} />
            </div>
            <div className="bg-muted/10 border rounded-lg p-4 flex flex-col justify-center items-center text-center space-y-4">
              <h3 className="font-medium text-lg">Strategy Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Based on your simulation inputs, consider reviewing the Settlement Negotiation playbook.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="playbooks">
          <PlaybookLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
};
