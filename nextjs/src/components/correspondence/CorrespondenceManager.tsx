'use client';

import { cn } from '@/lib/utils';
import { CommunicationItem, ServiceJob } from '@/types';
import { Calendar, Filter, Mail, MapPin, Paperclip, Plus, Search, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';

// Mock Services
const CorrespondenceService = {
  getCommunications: async () => [] as CommunicationItem[],
  getServiceJobs: async () => [] as ServiceJob[]
};

type ExtendedServiceJob = ServiceJob & { caseName?: string };

const CommunicationLog = ({ items, onSelect, selectedId }: { items: CommunicationItem[], onSelect: (item: CommunicationItem) => void, selectedId: string }) => (
  <div className="flex flex-col h-full bg-background">
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communications..."
          className="pl-9"
        />
      </div>
    </div>
    <ScrollArea className="flex-1">
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
  <div className="flex flex-col h-full bg-background">
    <div className="p-4 border-b">
      <h3 className="font-medium">Active Service Jobs</h3>
    </div>
    <ScrollArea className="flex-1 p-4">
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

interface InspectorItem {
  type: 'communication' | 'service';
  item: CommunicationItem | ExtendedServiceJob;
}

const CorrespondenceDetail = ({ item, onClose }: { item: InspectorItem | null; onClose: () => void }) => {
  if (!item || !item.item) return null;
  const data = item.item as CommunicationItem & ExtendedServiceJob;

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="p-4 border-b flex justify-between items-center bg-muted/30">
        <h3 className="font-medium">Details</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-muted-foreground">×</Button>
      </div>
      <ScrollArea className="flex-1 p-6">
        {item.type === 'communication' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">{data.subject}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {data.sender}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {data.date}
                </div>
              </div>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p>{data.preview}</p>
              <p>{data.body || 'No content.'}</p>
            </div>
            {data.hasAttachment && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Attachments
                </h4>
                <div className="p-3 border rounded bg-muted/20 text-sm">
                  Attachment (1.2 MB)
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{data.caseName || data.caseId}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/20 rounded">
                <span className="text-xs text-muted-foreground block">Recipient</span>
                <span className="font-medium">{data.targetPerson}</span>
              </div>
              <div className="p-3 bg-muted/20 rounded">
                <span className="text-xs text-muted-foreground block">Status</span>
                <span className="font-medium">{data.status}</span>
              </div>
              <div className="p-3 bg-muted/20 rounded">
                <span className="text-xs text-muted-foreground block">Server</span>
                <span className="font-medium">{data.serverName}</span>
              </div>
              <div className="p-3 bg-muted/20 rounded">
                <span className="text-xs text-muted-foreground block">Due Date</span>
                <span className="font-medium">{data.dueDate}</span>
              </div>
            </div>
            <div className="p-3 bg-muted/20 rounded mt-4">
              <span className="text-xs text-muted-foreground block">Address</span>
              <span className="font-medium">{data.targetAddress}</span>
            </div>
            <div className="p-3 bg-muted/20 rounded mt-4">
              <span className="text-xs text-muted-foreground block">Notes</span>
              <span className="font-medium">{data.notes || 'None'}</span>
            </div>
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t bg-muted/10">
        <div className="flex gap-2 justify-end">
          <Button variant="outline">Archive</Button>
          <Button>Reply</Button>
        </div>
      </div>
    </div>
  );
};

interface CorrespondenceManagerProps {
  initialTab?: 'communications' | 'process';
}

export default function CorrespondenceManager({ initialTab }: CorrespondenceManagerProps) {
  const [activeTab, setActiveTab] = useState<'communications' | 'process'>('communications');
  const [selectedItem, setSelectedItem] = useState<CommunicationItem | ExtendedServiceJob | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [communications, setCommunications] = useState<CommunicationItem[]>([]);
  const [serviceJobs, setServiceJobs] = useState<ExtendedServiceJob[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const comms = await CorrespondenceService.getCommunications();
        setCommunications(comms);

        const jobs = await CorrespondenceService.getServiceJobs();
        setServiceJobs(jobs as ExtendedServiceJob[]);
      } catch (error) {
        console.error("Failed to load correspondence data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectItem = (item: CommunicationItem | ExtendedServiceJob) => {
    setSelectedItem(item);
    setIsInspectorOpen(true);
  };

  const currentTabValue = activeTab === 'communications' ? 'communications' : 'process';

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 pt-6 shrink-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Correspondence & Service</h1>
            <p className="text-muted-foreground mt-1">Manage legal communications, process servers, and proofs of service.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {activeTab === 'communications' ? 'Compose' : 'New Service Job'}
            </Button>
          </div>
        </div>

        <Tabs value={currentTabValue} onValueChange={(v) => {
          const tab = v as 'communications' | 'process';
          setActiveTab(tab);
          setIsInspectorOpen(false);
        }} className="mb-4">
          <TabsList>
            <TabsTrigger value="communications" className="gap-2"><Mail className="h-4 w-4" /> Communications</TabsTrigger>
            <TabsTrigger value="process" className="gap-2"><MapPin className="h-4 w-4" /> Service of Process</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6">
        <div className="flex-1 flex flex-col min-w-0 rounded-lg border shadow-sm overflow-hidden bg-background">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            activeTab === 'communications' ? (
              <CommunicationLog
                items={communications}
                onSelect={handleSelectItem}
                selectedId={selectedItem?.id}
              />
            ) : (
              <ServiceTracker
                jobs={serviceJobs}
                onSelect={handleSelectItem}
                selectedId={selectedItem?.id}
              />
            )
          )}
        </div>

        {isInspectorOpen && selectedItem && (
          <div className="w-96 shrink-0 rounded-lg border shadow-sm overflow-hidden bg-background">
            <CorrespondenceDetail
              item={{
                type: activeTab === 'communications' ? 'communication' : 'service',
                item: selectedItem
              }}
              onClose={() => setIsInspectorOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
