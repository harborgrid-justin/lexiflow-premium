import { useState, useEffect } from 'react';

import { useSingleSelection } from '@/hooks/useMultiSelection';
import { useQuery } from '@/hooks/useQueryHooks';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { DataService } from '@/services/data/data-service.service';
import { type Clause, type JudgeProfile } from '@/types';
import { queryKeys } from '@/utils/queryKeys';

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
