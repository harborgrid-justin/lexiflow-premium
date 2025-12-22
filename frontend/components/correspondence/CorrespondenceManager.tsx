/**
 * @module components/correspondence/CorrespondenceManager
 * @category Correspondence
 * @description Email and letter correspondence management.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Plus, Filter, Send, Inbox, ShieldCheck } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery, useMutation } from '../../hooks/useQueryHooks';
import { correspondenceQueryKeys } from '../../services/infrastructure/queryKeys';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useToggle } from '../../hooks/useToggle';
import { useModalState } from '../../hooks/useModalState';
import { useSelection } from '../../hooks/useSelectionState';

// Components
import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { CommunicationLog } from './CommunicationLog';
import { ServiceTracker } from './ServiceTracker';
import { CorrespondenceDetail } from './CorrespondenceDetail';
import { ComposeMessageModal } from './ComposeMessageModal';
import { CreateServiceJobModal } from './CreateServiceJobModal';
import { CorrespondenceErrorBoundary } from './CorrespondenceErrorBoundary';
import { CommunicationLogSkeleton, ServiceTrackerSkeleton, CorrespondenceDetailSkeleton } from './CorrespondenceSkeleton';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import { CommunicationItem, ServiceJob } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CorrespondenceManagerProps {
    /** Optional initial tab to display. */
    initialTab?: 'communications' | 'process';
}

// ============================================================================
// COMPONENT
// ============================================================================

const CorrespondenceManagerInternal: React.FC<CorrespondenceManagerProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'communications' | 'process'>('communications');
  const itemSelection = useSelection<CommunicationItem | ServiceJob>();
  const inspectorToggle = useToggle();
  
  const composeModal = useModalState();
  const [composeInitialData, setComposeInitialData] = useState<Partial<CommunicationItem> | undefined>(undefined);
  const serviceJobModal = useModalState();

  // Enterprise Data Access with query key factory
  const { data: communications = [], isLoading: isLoadingComms } = useQuery<CommunicationItem[]>(
      correspondenceQueryKeys.correspondence.lists(),
      () => DataService.correspondence.getCommunications()
  );

  const { data: serviceJobs = [], isLoading: isLoadingJobs } = useQuery<ServiceJob[]>(
      correspondenceQueryKeys.serviceJobs.lists(),
      () => DataService.correspondence.getServiceJobs()
  );

  const { mutate: sendCommunication } = useMutation(
      DataService.correspondence.addCommunication,
      {
          invalidateKeys: [correspondenceQueryKeys.correspondence.lists()],
          onSuccess: () => {
              composeModal.close();
              setComposeInitialData(undefined);
          }
      }
  );

  const { mutate: createServiceJob } = useMutation(
      DataService.correspondence.addServiceJob,
      {
          invalidateKeys: [correspondenceQueryKeys.serviceJobs.lists()],
          onSuccess: () => serviceJobModal.close()
      }
  );

  // Keyboard shortcuts
  useKeyboardShortcuts([
      {
          key: 'c',
          cmd: true,
          callback: () => {
              if (activeTab === 'communications') {
                  setComposeInitialData(undefined);
                  composeModal.open();
              } else {
                  serviceJobModal.open();
              }
          },
          description: 'Compose new'
      },
      {
          key: 'r',
          cmd: true,
          callback: () => {
              if (itemSelection.selected && activeTab === 'communications') {
                  handleReply(itemSelection.selected as CommunicationItem);
              }
          },
          description: 'Reply to selected'
      },
      {
          key: 'Escape',
          callback: () => {
              inspectorToggle.close();
              itemSelection.deselect();
          },
          description: 'Close inspector'
      }
  ]);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleSelectItem = (item: CommunicationItem | ServiceJob) => {
    itemSelection.select(item);
    inspectorToggle.open();
  };

  const handleReply = (originalItem: CommunicationItem) => {
      setComposeInitialData({
          recipient: originalItem.sender, // Reply to sender
          subject: originalItem.subject.startsWith('Re:') ? originalItem.subject : `Re: ${originalItem.subject}`,
          caseId: originalItem.caseId,
          type: originalItem.type,
          preview: originalItem.preview // Pass preview to quote it
      });
      composeModal.open();
  };

  return (
    <CorrespondenceErrorBoundary onReset={() => window.location.reload()}>
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Correspondence & Service" 
          subtitle="Manage legal communications, process servers, and proofs of service."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" icon={Filter}>Filter</Button>
              <Button variant="primary" icon={Plus} onClick={() => { setComposeInitialData(undefined); activeTab === 'communications' ? composeModal.open() : serviceJobModal.open(); }}>
                {activeTab === 'communications' ? 'Compose' : 'New Service Job'}
              </Button>
            </div>
          }
        />

        {/* Tab Navigation */}
        <div className={cn("flex space-x-2 border-b mb-4", theme.border.default)}>
            <button
                onClick={() => { setActiveTab('communications'); inspectorToggle.close(); }}
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
                onClick={() => { setActiveTab('process'); inspectorToggle.close(); }}
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
                isLoadingComms ? (
                    <CommunicationLogSkeleton />
                ) : (
                    <CommunicationLog 
                        items={communications} 
                        onSelect={handleSelectItem}
                        selectedId={itemSelection.selected?.id}
                    />
                )
            ) : (
                isLoadingJobs ? (
                    <ServiceTrackerSkeleton />
                ) : (
                    <ServiceTracker 
                        jobs={serviceJobs}
                        onSelect={handleSelectItem}
                        selectedId={itemSelection.selected?.id}
                    />
                )
            )}
        </div>

        {/* Inspector Panel */}
        {inspectorToggle.isOpen && itemSelection.selected && (
            <div className="w-96 shrink-0">
                {(isLoadingComms || isLoadingJobs) && !itemSelection.selected ? (
                    <CorrespondenceDetailSkeleton />
                ) : (
                    <CorrespondenceDetail 
                        correspondenceItem={{
                            type: activeTab === 'communications' ? 'communication' : 'service',
                            item: itemSelection.selected as any
                        }}
                        onClose={() => inspectorToggle.close()}
                        onReply={(item) => handleReply(item)}
                    />
                )}
            </div>
        )}
      </div>

      <ComposeMessageModal 
        isOpen={composeModal.isOpen}
        onClose={composeModal.close}
        onSend={sendCommunication}
        initialData={composeInitialData}
      />

      <CreateServiceJobModal
        isOpen={serviceJobModal.isOpen}
        onClose={serviceJobModal.close}
        onSave={createServiceJob}
      />
    </div>
    </CorrespondenceErrorBoundary>
  );
};

// Export with error boundary wrapper
const CorrespondenceManager: React.FC<CorrespondenceManagerProps> = (props) => (
  <CorrespondenceManagerInternal {...props} />
);

export default CorrespondenceManager;
export { CorrespondenceManager };

