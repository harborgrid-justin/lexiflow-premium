/**
 * CaseMotions.tsx
 * 
 * Motion practice management interface with filing deadlines, conferral tracking,
 * and hearing scheduling.
 * 
 * @module components/case-detail/motions/CaseMotions
 * @category Case Management - Motions
 */

// External Dependencies
import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '../../common/Button';
import { TaskCreationModal } from '../../common/TaskCreationModal';
import { MotionList } from './MotionList';
import { MotionModal } from './MotionModal';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../context/ThemeContext';
import { useQuery, useMutation, queryClient } from '../../../services/queryClient';
import { useNotify } from '../../../hooks/useNotify';
import { useWindow } from '../../../context/WindowContext';

// Internal Dependencies - Services & Utils
import { DataService } from '../../../services/dataService';
import { STORES } from '../../../services/db';
import { cn } from '../../../utils/cn';

// Types & Interfaces
import { Motion, MotionStatus, MotionType, LegalDocument, MotionId, CaseId } from '../../../types';

interface CaseMotionsProps {
  caseId: string;
  caseTitle: string;
  documents?: LegalDocument[];
}

export const CaseMotions: React.FC<CaseMotionsProps> = ({ caseId, caseTitle, documents = [] }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const { openWindow, closeWindow } = useWindow();
  const [taskModalMotion, setTaskModalMotion] = useState<Motion | null>(null);
  
  // Query Motions specific to this case
  const { data: motions = [], isLoading } = useQuery<Motion[]>(
    [STORES.MOTIONS, caseId],
    () => DataService.motions.getByCaseId(caseId)
  );

  // Mutation to add motion and invalidate cache
  const { mutate: addMotion } = useMutation(
    DataService.motions.add,
    { 
        invalidateKeys: [[STORES.MOTIONS, caseId]],
        onSuccess: () => closeWindow('new-motion-modal')
    }
  );
  
  const { mutate: syncCalendar, isLoading: isSyncing } = useMutation(
      DataService.calendar.sync,
      {
          onSuccess: () => notify.success("Synced deadlines to Master Calendar and Outlook.")
      }
  );

  const defaultMotion: Partial<Motion> = { type: 'Dismiss', status: 'Draft', documents: [], linkedRules: [], conferralStatus: 'Required' };

  const handleSave = (motionData: Partial<Motion>) => {
    if (!motionData.title) return;
    const motion: Motion = {
      id: `mot-${Date.now()}` as MotionId,
      caseId: caseId as CaseId,
      title: motionData.title,
      type: motionData.type as MotionType,
      status: motionData.status as MotionStatus,
      assignedAttorney: 'Current User',
      filingDate: new Date().toISOString().split('T')[0],
      hearingDate: motionData.hearingDate,
      oppositionDueDate: motionData.oppositionDueDate,
      replyDueDate: motionData.replyDueDate,
      documents: motionData.documents,
      linkedRules: motionData.linkedRules,
      conferralStatus: motionData.conferralStatus || 'Required'
    };
    addMotion(motion);
  };

  const openMotionModal = () => {
      openWindow(
          'new-motion-modal',
          'Draft New Motion',
          <MotionModal 
            isOpen={true} 
            onClose={() => closeWindow('new-motion-modal')} 
            onSave={handleSave}
            documents={documents}
            initialMotion={defaultMotion}
            isOrbital={true}
          />
      );
  };

  return (
    <div className="space-y-6">
      {taskModalMotion && (
        <TaskCreationModal 
            isOpen={true} 
            onClose={() => setTaskModalMotion(null)} 
            initialTitle={`Prepare: ${taskModalMotion.title}`}
            relatedModule="Motions"
            relatedItemId={taskModalMotion.id}
            relatedItemTitle={taskModalMotion.title}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className={cn("text-lg font-bold", theme.text.primary)}>Motion Practice</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Track filings, opposition deadlines, and hearings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => syncCalendar(undefined)} isLoading={isSyncing}>Sync Calendar</Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={openMotionModal}>New Motion</Button>
        </div>
      </div>

      <MotionList motions={motions} onTaskClick={setTaskModalMotion} />
    </div>
  );
};
