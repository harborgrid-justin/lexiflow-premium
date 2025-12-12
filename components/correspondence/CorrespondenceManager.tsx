
import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Plus, Filter, Send, Inbox, ShieldCheck } from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { CommunicationLog } from './correspondence/CommunicationLog';
import { ServiceTracker } from './correspondence/ServiceTracker';
import { CorrespondenceDetail } from './correspondence/CorrespondenceDetail';
import { ComposeMessageModal } from './correspondence/ComposeMessageModal';
import { CreateServiceJobModal } from './correspondence/CreateServiceJobModal';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { CommunicationItem, ServiceJob } from '../types';
import { DataService } from '../services/dataService';
import { useQuery, useMutation } from '../services/queryClient';
import { STORES } from '../services/db';

interface CorrespondenceManagerProps {
    initialTab?: 'communications' | 'process';
}

export const CorrespondenceManager: React.FC<CorrespondenceManagerProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'communications' | 'process'>('communications');
  const [selectedItem, setSelectedItem] = useState<CommunicationItem | ServiceJob | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitialData, setComposeInitialData] = useState<Partial<CommunicationItem> | undefined>(undefined);
  const [isServiceJobOpen, setIsServiceJobOpen] = useState(false);

  // Enterprise Data Access
  const { data: communications = [] } = useQuery<CommunicationItem[]>(
      [STORES.COMMUNICATIONS, 'all'],
      DataService.correspondence.getCommunications
  );

  const { data: serviceJobs = [] } = useQuery<ServiceJob[]>(
      [STORES.SERVICE_JOBS, 'all'],
      DataService.correspondence.getServiceJobs
  );

  const { mutate: sendCommunication } = useMutation(
      DataService.correspondence.addCommunication,
      {
          invalidateKeys: [[STORES.COMMUNICATIONS, 'all']],
          onSuccess: () => {
              setIsComposeOpen(false);
              setComposeInitialData(undefined);
          }
      }
  );

  const { mutate: createServiceJob } = useMutation(
      DataService.correspondence.addServiceJob,
      {
          invalidateKeys: [[STORES.SERVICE_JOBS, 'all']],
          onSuccess: () => setIsServiceJobOpen(false)
      }
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleSelectItem = (item: CommunicationItem | ServiceJob) => {
    setSelectedItem(item);
    setIsInspectorOpen(true);
  };

  const handleReply = (originalItem: CommunicationItem) => {
      setComposeInitialData({
          recipient: originalItem.sender, // Reply to sender
          subject: originalItem.subject.startsWith('Re:') ? originalItem.subject : `Re: ${originalItem.subject}`,
          caseId: originalItem.caseId,
          type: originalItem.type,
          preview: originalItem.preview // Pass preview to quote it
      });
      setIsComposeOpen(true);
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Correspondence & Service" 
          subtitle="Manage legal communications, process servers, and proofs of service."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" icon={Filter}>Filter</Button>
              <Button variant="primary" icon={Plus} onClick={() => { setComposeInitialData(undefined); activeTab === 'communications' ? setIsComposeOpen(true) : setIsServiceJobOpen(true); }}>
                {activeTab === 'communications' ? 'Compose' : 'New Service Job'}
              </Button>
            </div>
          }
        />

        {/* Tab Navigation */}
        <div className={cn("flex space-x-2 border-b mb-4", theme.border.default)}>
            <button
                onClick={() => { setActiveTab('communications'); setIsInspectorOpen(false); }}
                className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                    activeTab === 'communications' 
                        ? cn("border-blue-600 text-blue-600") 
                        : cn("border-transparent text-slate-500 hover:text-slate-700")
                )}
            >
                <Mail className="h-4 w-4"/> Communications
            </button>
            <button
                onClick={() => { setActiveTab('process'); setIsInspectorOpen(false); }}
                className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                    activeTab === 'process' 
                        ? cn("border-blue-600 text-blue-600") 
                        : cn("border-transparent text-slate-500 hover:text-slate-700")
                )}
            >
                <MapPin className="h-4 w-4"/> Service of Process
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6">
        {/* Main List Area */}
        <div className={cn("flex-1 flex flex-col min-w-0 rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
            {activeTab === 'communications' ? (
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
            )}
        </div>

        {/* Inspector Panel */}
        {isInspectorOpen && selectedItem && (
            <div className="w-96 shrink-0">
                <CorrespondenceDetail 
                    item={selectedItem} 
                    type={activeTab === 'communications' ? 'communication' : 'service'}
                    onClose={() => setIsInspectorOpen(false)}
                    onReply={(item) => handleReply(item)}
                />
            </div>
        )}
      </div>

      <ComposeMessageModal 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={sendCommunication}
        initialData={composeInitialData}
      />

      <CreateServiceJobModal
        isOpen={isServiceJobOpen}
        onClose={() => setIsServiceJobOpen(false)}
        onSave={createServiceJob}
      />
    </div>
  );
};
