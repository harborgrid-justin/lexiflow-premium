import { useState, useEffect } from 'react';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { queryKeys } from '@/utils/queryKeys';
import { useSingleSelection } from '@/hooks/useMultiSelection';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { Clause, JudgeProfile } from '@/types';

export function useResearchTool(initialTab?: string, caseId?: string) {
    const storageKey = caseId ? `research_active_view_${caseId}` : 'research_active_view';
    const [activeView, setActiveView] = useSessionStorage<string>(storageKey, initialTab || 'search_home');

    const clauseSelection = useSingleSelection<Clause>(null, (a, b) => a.id === b.id);
    const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

    const { data: judges = [] } = useQuery<JudgeProfile[]>(
        queryKeys.adminExtended.judgeProfiles(),
        () => DataService.analysis.getJudgeProfiles(),
        { enabled: activeView.startsWith('analytics_') }
    );

    useEffect(() => {
        if (judges.length > 0 && !selectedJudgeId) {
            setSelectedJudgeId(judges[0]?.id || '');
        }
    }, [judges, selectedJudgeId]);

    return {
        activeView,
        setActiveView,
        clauseSelection,
        selectedJudgeId,
        setSelectedJudgeId,
        judges
    };
}
