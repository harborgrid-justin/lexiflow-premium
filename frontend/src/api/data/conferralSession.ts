
import { ConferralSession, UUID, CaseId, MotionId } from '@/types';

export const MOCK_CONFERRALS: ConferralSession[] = [
  {
    id: 'conf-1' as UUID,
    caseId: 'C-2024-001' as CaseId,
    topic: 'Scope of ESI Production',
    date: '2024-01-10',
    method: 'Video Conference',
    participants: ['James Doe (Us)', 'Robert Opposing (Them)'],
    notes: 'Discussed search terms for email archives. Opposing counsel agreed to limit date range to 2022-2023 but refused to exclude "internal draft" keyword.',
    result: 'Partial Agreement',
    nextSteps: 'Send revised search term list by Friday.'
  },
  {
    id: 'conf-2' as UUID,
    caseId: 'C-2024-001' as CaseId,
    topic: 'Motion to Dismiss - Meet & Confer',
    date: '2024-02-12',
    method: 'Phone',
    participants: ['Alexandra H. (Us)', 'Lead Counsel (Them)'],
    notes: 'Attempted to resolve issues regarding Count II. Opposing counsel stands firm on standing argument. No agreement reached.',
    result: 'Impasse',
    linkedMotionId: 'mot-1' as MotionId
  }
];
