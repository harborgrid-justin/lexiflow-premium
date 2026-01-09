'use client';

import { DataService } from '@/services/data/dataService';
import { cn } from '@/lib/utils';
import { CommunicationItem, ServiceJob } from '@/types';
import { Search, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';

type ExtendedServiceJob = ServiceJob & { caseName?: string };

const CommunicationLog = ({ items, onSelect, selectedId }: { items: CommunicationItem[], onSelect: (item: CommunicationItem) => void, selectedId: string }) => (
  <div className="flex flex-col h-full bg-background rounded-lg border">
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communications..."
          className="pl-9"
        />
      </div>
    </div>
    <ScrollArea className="flex-1 h-150">
      {items.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">No communications found.</div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
              "p-4 border-b cursor-pointer hover:bg-accent transition-colors",
              selectedId === item.id ? "bg-accent border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">{item.sender}</span>
              <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
            </div>
            <h4 className="text-sm font-medium mb-1">{item.subject}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.preview}</p>
          </div>
        ))
      )}
    </ScrollArea>
  </div>
);

const ServiceTracker = ({ jobs, onSelect, selectedId }: { jobs: ExtendedServiceJob[], onSelect: (job: ExtendedServiceJob) => void, selectedId: string }) => (
  <div className="flex flex-col h-full bg-background rounded-lg border ml-4">
    <div className="p-4 border-b">
      <h3 className="font-medium">Active Service Jobs</h3>
    </div>
    <ScrollArea className="flex-1 p-4 h-150">
      {jobs.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm">No active service jobs.</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card
              key={job.id}
              onClick={() => onSelect(job)}
              className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                selectedId === job.id ? "ring-2 ring-primary" : ""
              )}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{job.caseName || job.caseId}</span>
                  <Badge variant={job.status === 'Completed' ? 'default' : 'outline'}>
                    {job.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">To: {job.targetPerson}</div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                  <span>Due: {job.dueDate}</span>
                  <span>{job.serverName}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ScrollArea>
  </div>
);

export default function CorrespondenceManager() {
  const [communications, setCommunications] = useState<CommunicationItem[]>([]);
  const [jobs, setJobs] = useState<ExtendedServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommId, setSelectedCommId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        // Use DataService.correspondence unique repository
        // Assuming getAll returns generic items that we filter
        const allItems: any[] = await DataService.correspondence.getAll();

        const comms = allItems.filter(i => i.type === 'Communication' || !i.type).map(i => ({
          id: i.id,
          sender: i.sender || 'Unknown',
          date: i.date || i.createdAt,
          subject: i.subject || '(No Subject)',
          preview: i.content || i.preview || ''
        }));

        const svcJobs = allItems.filter(i => i.type === 'ServiceJob').map(i => ({
          id: i.id,
          caseId: i.caseId,
          caseName: i.metadata?.caseName || `Case ${i.caseId}`,
          status: i.status || 'Pending',
          targetPerson: i.recipient || 'Unknown',
          dueDate: i.dueDate || new Date().toLocaleDateString(),
          serverName: i.processServer || 'Unassigned'
        }));

        setCommunications(comms);
        setJobs(svcJobs);
      } catch (e) {
        console.error("Failed to load correspondence", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
      <div>
        <h2 className="text-xl font-bold mb-4">Communications Log</h2>
        <CommunicationLog
          items={communications}
          selectedId={selectedCommId}
          onSelect={(i) => setSelectedCommId(i.id)}
        />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">Process Service Tracker</h2>
        <ServiceTracker
          jobs={jobs}
          selectedId={selectedJobId}
          onSelect={(j) => setSelectedJobId(j.id)}
        />
      </div>
    </div>
  );
}
