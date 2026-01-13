import { Button } from '@/shared/ui/atoms/Button';
import { useTheme } from '@/features/theme';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { CaseId, CustodianInterview } from '@/types';
import { cn } from '@/shared/lib/cn';
import { MessageSquare, Plus } from 'lucide-react';

import { InterviewList } from './interviews/InterviewList';
import { InterviewModal } from './interviews/InterviewModal';
// ✅ Migrated to backend API (2025-12-21)
import { useModalState } from '@/hooks/core';

interface DiscoveryInterviewsProps {
  caseId?: string;
}

export function DiscoveryInterviews({ caseId }: DiscoveryInterviewsProps) {
  const { theme } = useTheme();
  const interviewModal = useModalState();

  // Enterprise Data Access
  const { data: rawInterviews = [] } = useQuery<CustodianInterview[]>(
    ['discovery-interviews', 'all'],
    async () => {
      const result = await DataService.discovery.getInterviews(caseId);
      return Array.isArray(result) ? result : [];
    }
  );

  // Runtime array validation
  const interviews = Array.isArray(rawInterviews) ? rawInterviews : [];

  const { mutate: createInterview } = useMutation(
    DataService.discovery.createInterview,
    {
      invalidateKeys: [['discovery-interviews', 'all']],
      onSuccess: () => interviewModal.close()
    }
  );

  const handleCreate = (newInterview: Partial<CustodianInterview>) => {
    if (!newInterview.custodianName) return;
    // Generate ID in event handler (not during render) for deterministic rendering
    const newId = `INT-${Date.now()}`;
    createInterview({
      id: newId,
      caseId: (caseId || 'C-2024-001') as CaseId,
      custodianName: newInterview.custodianName,
      department: newInterview.department || 'General',
      status: 'Scheduled',
      interviewDate: newInterview.interviewDate,
      notes: newInterview.notes
    });
  };

  // Remove this entire block - not needed with useModalState

  // Remove this - using interviewModal from useModalState instead

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" /> Custodian Interviews
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>Track interviews to identify data sources and preservation scope.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={interviewModal.open}>Log Interview</Button>
      </div>

      <InterviewList
        interviews={interviews}
        onManage={(interview) => {
          notify.info(`Managing interview: ${interview.name || interview.id}`);
          // TODO: Implement interview management modal
        }}
      />

      <InterviewModal
        isOpen={interviewModal.isOpen}
        onClose={interviewModal.close}
        onSave={handleCreate}
      />
    </div>
  );
};

export default DiscoveryInterviews;
