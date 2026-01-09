'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/services/data/dataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Badge } from '@/components/ui/shadcn/badge';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { Separator } from '@/components/ui/shadcn/separator';
import { AlertCircle, Gavel, Scale, FileText, CheckSquare, Users } from 'lucide-react';

interface CaseDetail {
  id: string;
  title: string;
  status: string;
  nextCourtDate?: string;
  description?: string;
  opposingCounsel?: string;
  judge?: string;
}

interface EvidenceItem {
  id: string;
  title: string;
  type: string;
  importance: 'High' | 'Medium' | 'Low';
}

export const WarRoom = () => {
  const [activeCase, setActiveCase] = useState<CaseDetail | null>(null);
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWarRoomData() {
      setLoading(true);
      try {
        // Load urgent/trial-ready cases
        const allCases = await DataService.cases.getAll();
        const trialCases = allCases.filter((c: unknown) =>
          c.status === 'Trial' || c.status === 'Active'
        ).map((c: unknown) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          nextCourtDate: c.nextCourtDate,
          description: c.description,
          opposingCounsel: c.opposingCounsel,
          judge: c.judge
        }));

        setCases(trialCases);
        if (trialCases.length > 0) {
          setActiveCase(trialCases[0]);
          // Load evidence for the first case if available
          if (DataService.evidence) {
            const ev = await DataService.evidence.getByCaseId(trialCases[0].id);
            setEvidence(ev.map((e: unknown) => ({
              id: e.id,
              title: e.title,
              type: e.type,
              importance: e.importance || 'Medium'
            })));
          }
        }
      } catch (error) {
        console.error("Failed to load war room data", error);
      } finally {
        setLoading(false);
      }
    }
    loadWarRoomData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-2">
          <Scale className="h-8 w-8 animate-pulse text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Preparing War Room...</p>
        </div>
      </div>
    );
  }

  if (!activeCase) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="h-96 flex flex-col items-center justify-center text-center p-8">
          <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Active Trials</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            There are no cases with &apos;Trial&apos; status currently in the docket. Focus on discovery and pre-trial motions in the standard dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-4">
      {/* Header / Case Selector */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="animate-pulse">TRIAL MODE</Badge>
          <h2 className="text-2xl font-bold tracking-tight">{activeCase.title}</h2>
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {activeCase.opposingCounsel || 'Opposing Counsel'}</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-1"><Gavel className="h-4 w-4" /> {activeCase.judge || 'Assigned Judge'}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Main Battleground */}
        <Card className="col-span-8 flex flex-col h-full border-2 border-primary/20">
          <Tabs defaultValue="strategy" className="flex-1 flex flex-col">
            <CardHeader className="py-2 px-4 border-b bg-muted/30">
              <TabsList className="w-full justify-start bg-transparent p-0">
                <TabsTrigger value="strategy" className="data-[state=active]:bg-background">Strategy & Themes</TabsTrigger>
                <TabsTrigger value="evidence" className="data-[state=active]:bg-background">Key Evidence</TabsTrigger>
                <TabsTrigger value="witnesses" className="data-[state=active]:bg-background">Witness Prep</TabsTrigger>
                <TabsTrigger value="motions" className="data-[state=active]:bg-background">Motions</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <TabsContent value="strategy" className="h-full p-4 m-0">
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Critical Case Theme
                    </h4>
                    <p className="mt-2 text-sm text-amber-800 dark:text-amber-100">
                      {activeCase.description || 'Define primary case narrative and themes here. Why should the jury rule in our favor?'}
                    </p>
                  </div>
                  {/* Placeholder for strategy content */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Strengths</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Documented timeline</li>
                          <li>Expert witness credibility</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Weaknesses</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          <li>Gap in correspondence (May-June)</li>
                          <li>Defendant testimony conflict</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="evidence" className="h-full p-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {evidence.length > 0 ? evidence.map(ev => (
                      <div key={ev.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{ev.title}</p>
                            <p className="text-xs text-muted-foreground">{ev.type}</p>
                          </div>
                        </div>
                        <Badge variant={ev.importance === 'High' ? 'destructive' : 'secondary'}>{ev.importance}</Badge>
                      </div>
                    )) : (
                      <p className="text-center text-muted-foreground py-10">No evidence items flagged for trial yet.</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Sidebar: Tasks & Notes */}
        <div className="col-span-4 flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="py-3"><CardTitle className="text-md flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Trial Tasks</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-50 lg:h-75">
                <div className="p-4 space-y-2">
                  <div className="flex items-start gap-2 p-2 rounded hover:bg-muted">
                    <input type="checkbox" className="mt-1" />
                    <div className="text-sm">
                      <span className="font-medium">File Motion in Limine</span>
                      <p className="text-xs text-muted-foreground">Due: 2 days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded hover:bg-muted">
                    <input type="checkbox" className="mt-1" />
                    <div className="text-sm">
                      <span className="font-medium">Prep Opening Statement</span>
                      <p className="text-xs text-muted-foreground">Due: Today</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader className="py-3"><CardTitle className="text-md">Quick Notes</CardTitle></CardHeader>
            <CardContent>
              <textarea className="w-full h-full min-h-25 bg-transparent resize-none focus:outline-none text-sm" placeholder="Type notes here during proceedings..." />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
