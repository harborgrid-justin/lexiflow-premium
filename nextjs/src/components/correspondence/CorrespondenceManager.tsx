import { cn } from '@/lib/utils';
import { CommunicationItem, ServiceJob } from '@/types';
import { Calendar, Filter, Mail, MapPin, Paperclip, Plus, Search, User } from 'lucide-react';
import React, { useState } from 'react';

// Extended types for UI
type ExtendedServiceJob = ServiceJob & { caseName?: string };

// Sub-components
const CommunicationLog = ({ items, onSelect, selectedId }: { items: CommunicationItem[], onSelect: (item: CommunicationItem) => void, selectedId: string }) => (
  <div className="flex flex-col h-full bg-white">
    <div className="p-4 border-b flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search communications..."
          className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto">
      {items.length === 0 ? (
        <div className="p-4 text-center text-slate-500 text-sm">No communications found.</div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
              "p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors",
              selectedId === item.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-slate-900">{item.sender}</span>
              <span className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
            </div>
            <h4 className="text-sm font-medium text-slate-800 mb-1">{item.subject}</h4>
            <p className="text-sm text-slate-500 line-clamp-2">{item.preview}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

const ServiceTracker = ({ jobs, onSelect, selectedId }: { jobs: ExtendedServiceJob[], onSelect: (job: ExtendedServiceJob) => void, selectedId: string }) => (
  <div className="flex flex-col h-full bg-white">
    <div className="p-4 border-b">
      <h3 className="font-medium text-slate-900">Active Service Jobs</h3>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {jobs.length === 0 ? (
        <div className="text-center text-slate-500 text-sm">No active service jobs.</div>
      ) : (
        jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onSelect(job)}
            className={cn(
              "p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all bg-white",
              selectedId === job.id ? "ring-2 ring-blue-500" : ""
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-slate-900">{job.caseName || job.caseId}</span>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                job.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                {job.status}
              </span>
            </div>
            <div className="text-sm text-slate-600 mb-1">To: {job.targetPerson}</div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
              <span>Due: {job.dueDate}</span>
              <span>{job.serverName}</span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const CorrespondenceDetail = ({ item, onClose }: any) => {
  if (!item || !item.item) return null;
  const data = item.item;

  return (
    <div className="h-full flex flex-col bg-white border-l">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-medium text-slate-900">Details</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        {item.type === 'communication' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{data.subject}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
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
            <div className="prose prose-sm max-w-none text-slate-700">
              <p>{data.preview}</p>
              <p>{data.body || 'No content.'}</p>
            </div>
            {data.hasAttachment && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Attachments
                </h4>
                <div className="p-3 border rounded bg-slate-50 text-sm text-slate-600">
                  Attachment (1.2 MB)
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">{data.caseName || data.caseId}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded">
                <span className="text-xs text-slate-500 block">Recipient</span>
                <span className="font-medium">{data.targetPerson}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <span className="text-xs text-slate-500 block">Status</span>
                <span className="font-medium">{data.status}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <span className="text-xs text-slate-500 block">Server</span>
                <span className="font-medium">{data.serverName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <span className="text-xs text-slate-500 block">Due Date</span>
                <span className="font-medium">{data.dueDate}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded mt-4">
              <span className="text-xs text-slate-500 block">Address</span>
              <span className="font-medium">{data.targetAddress}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded mt-4">
              <span className="text-xs text-slate-500 block">Notes</span>
              <span className="font-medium">{data.notes || 'None'}</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t bg-slate-50">
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 border bg-white rounded text-sm font-medium hover:bg-slate-50">Archive</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Reply</button>
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
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
        // Safe cast or extension logic if needed, treating retrieved jobs as ExtendedServiceJob
        // Since our mock currently provides caseName (runtime), we can assume it's there or handle it.
        // If real API doesn't return caseName, we'd need to fetch it.
        setServiceJobs(jobs as ExtendedServiceJob[]);
      } catch (error) {
        console.error("Failed to load correspondence data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setIsInspectorOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      <div className="px-6 pt-6 shrink-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Correspondence & Service</h1>
            <p className="text-slate-500 mt-1">Manage legal communications, process servers, and proofs of service.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              {activeTab === 'communications' ? 'Compose' : 'New Service Job'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-slate-200 mb-4">
          <button
            onClick={() => { setActiveTab('communications'); setIsInspectorOpen(false); }}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === 'communications'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <Mail className="h-4 w-4" /> Communications
          </button>
          <button
            onClick={() => { setActiveTab('process'); setIsInspectorOpen(false); }}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === 'process'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <MapPin className="h-4 w-4" /> Service of Process
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6">
        {/* Main List Area */}
        <div className="flex-1 flex flex-col min-w-0 rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-white">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
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

        {/* Inspector Panel */}
        {isInspectorOpen && selectedItem && (
          <div className="w-96 shrink-0 rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-white">
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
