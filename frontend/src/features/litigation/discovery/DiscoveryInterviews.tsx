import React, { useState } from 'react';
import { CustodianInterview, CaseId } from '@/types';
import { DataService } from '@/services/data/dataService';
import { Button } from '@/components/atoms/Button';
import { MessageSquare, Plus } from 'lucide-react';
import { InterviewList } from './interviews/InterviewList';
import { InterviewModal } from './interviews/InterviewModal';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useQuery, useMutation } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';
import { useModalState } from '@/hooks';

export const DiscoveryInterviews: React.FC = () => {
  const { theme } = useTheme();
  const interviewModal = useModalState();

  // Enterprise Data Access
  const { data: interviews = [] } = useQuery<CustodianInterview[]>(
      ['discovery-interviews', 'all'],
      () => DataService.discovery.getInterviews()
  );

  const { mutate: createInterview } = useMutation(
      DataService.discovery.createInterview,
      {
          invalidateKeys: [['discovery-interviews', 'all']],
          onSuccess: () => interviewModal.close()
      }
  );

  const handleCreate = (newInterview: Partial<CustodianInterview>) => {
      if (!newInterview.custodianName) return;
      createInterview({
          id: `INT-${Date.now()}`,
          caseId: 'C-2024-001' as CaseId, // Mock default
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
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600"/> Custodian Interviews
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>Track interviews to identify data sources and preservation scope.</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={interviewModal.open}>Log Interview</Button>
        </div>

        <InterviewList
          interviews={interviews}
          onManage={(interview) => console.log('Manage', interview)}
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

