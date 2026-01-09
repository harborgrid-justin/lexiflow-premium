'use client';

import { BarChart2, Filter, PenTool, Users } from 'lucide-react';
import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/shadcn/table";
import { Badge } from "@/components/ui/shadcn/badge";

interface TrialExhibit {
  id: string;
  number: string;
  description: string;
  party: 'Plaintiff' | 'Defense';
  witness?: string;
  status: 'Admitted' | 'Marked' | 'Excluded';
  date: string;
}

interface ExhibitManagerProps {
  initialTab?: 'list' | 'sticker' | 'stats';
  caseId?: string;
}

export default function ExhibitManager({ initialTab = 'list', caseId }: ExhibitManagerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // URGENT STATE: UI filter selection (immediate feedback)
  const [filterParty, setFilterParty] = useState<string>('All');

  // DEFERRED STATE: Expensive filtering (non-blocking)
  const [isPending, startTransition] = useTransition();
  const deferredFilterParty = useDeferredValue(filterParty);

  // Existing state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [exhibits] = useState<TrialExhibit[]>([
    {
      id: '1',
      number: 'P-001',
      description: 'Contract Agreement dated March 2024',
      party: 'Plaintiff',
      witness: 'John Smith',
      status: 'Admitted',
      date: '2024-03-15'
    },
    {
      id: '2',
      number: 'D-001',
      description: 'Email correspondence',
      party: 'Defense',
      status: 'Marked',
      date: '2024-03-18'
    },
    {
      id: '3',
      number: 'P-002',
      description: 'Financial Records Q1 2024',
      party: 'Plaintiff',
      witness: 'Jane Doe',
      status: 'Admitted',
      date: '2024-04-01'
    },
  ]);

  // EXPENSIVE COMPUTATION: Uses deferred value
  const filteredExhibits = useMemo(() => {
    // This runs with the deferred value, not blocking urgent updates
    return exhibits.filter(ex => {
      const matchParty = deferredFilterParty === 'All' || ex.party === deferredFilterParty;
      return matchParty;
    });
  }, [exhibits, deferredFilterParty]);

  // URGENT HANDLER: Update UI immediately, defer computation
  const handleFilterChange = (party: string) => {
    // Update UI state immediately (urgent)
    setFilterParty(party);

    // Expensive filtering will use deferred value (non-urgent)
    // No need to call startTransition here - useDeferredValue handles it
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Exhibit Manager</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b mb-6">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="sticker">Sticker Designer</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="list" className="h-full mt-0">
            <div className="flex gap-6 h-full">
              <Card className="w-64 flex-shrink-0 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters {isPending && '⏳'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    {['All', 'Plaintiff', 'Defense'].map(p => (
                      <Button
                        key={p}
                        variant={filterParty === p ? "secondary" : "ghost"}
                        className="w-full justify-between h-auto py-2 px-3 font-normal"
                        onClick={() => handleFilterChange(p)}
                      >
                        <span>{p}</span>
                        <Badge variant="outline" className="ml-2 font-normal">
                          {p === 'All' ? exhibits.length : exhibits.filter(e => e.party === p).length}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-2">By Witness</h4>
                    {Array.from(new Set(exhibits.map(e => e.witness).filter(Boolean))).map(w => (
                      <div key={String(w)} className="py-1 text-sm text-muted-foreground">
                        {String(w)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'list' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      Grid
                    </Button>
                  </div>
                </div>

                {isPending && (
                  <div className="text-sm text-muted-foreground">
                    Filtering... ({filteredExhibits.length} matches)
                  </div>
                )}

                <ExhibitTable exhibits={filteredExhibits} viewMode={viewMode} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sticker">
            <StickerDesigner />
          </TabsContent>

          <TabsContent value="stats">
            <ExhibitStats exhibits={filteredExhibits} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

const ExhibitTable = ({ exhibits, viewMode }: { exhibits: TrialExhibit[]; viewMode: 'list' | 'grid' }) => (
  <div className="rounded-md border bg-background">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Exhibit #</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exhibits.map(ex => (
          <TableRow key={ex.id}>
            <TableCell className="font-mono text-xs">{ex.number}</TableCell>
            <TableCell>{ex.description}</TableCell>
            <TableCell>
              <Badge variant="outline" className={ex.party === 'Plaintiff' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-purple-200 bg-purple-50 text-purple-700'}>
                {ex.party}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={
                ex.status === 'Admitted' ? 'default' :
                  ex.status === 'Marked' ? 'secondary' : 'destructive'
              } className={
                ex.status === 'Admitted' ? "bg-emerald-600 hover:bg-emerald-700" :
                  ex.status === 'Marked' ? "bg-amber-100 text-amber-800 hover:bg-amber-200" :
                    undefined
              }>
                {ex.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{ex.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const StickerDesigner = () => (
  <Card className="border-dashed h-96">
    <CardContent className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
      <PenTool className="h-12 w-12 mb-4 opacity-20" />
      <h3 className="text-xl font-semibold text-foreground">Sticker Designer</h3>
      <p className="mt-2">Drag and drop interface for exhibit stickers coming soon.</p>
    </CardContent>
  </Card>
);

const ExhibitStats = ({ exhibits }: { exhibits: TrialExhibit[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart2 className="h-5 w-5 text-blue-600" />
          Admissibility Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span>Admitted</span>
            <span className="font-bold text-emerald-600">50%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-purple-600" />
          Exhibits by Party
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between p-2 bg-muted rounded text-sm">
            <span>Plaintiff</span>
            <span className="font-bold">12</span>
          </div>
          <div className="flex justify-between p-2 bg-muted rounded text-sm">
            <span>Defense</span>
            <span className="font-bold">8</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
