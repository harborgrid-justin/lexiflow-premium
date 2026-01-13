import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { Citation, Defense, LegalArgument } from '@/types';

export const useCaseStrategy = (caseId: string) => {
    const { data: strategyData, isLoading } = useQuery(
        ['case-strategy', caseId],
        () => DataService.strategy.getCaseStrategy(caseId),
        { enabled: !!caseId }
    );

    const { mutate: saveStrategyItem, isLoading: isSaving } = useMutation(
        async ({ type, item, isEditing }: { type: string; item: Citation | LegalArgument | Defense; isEditing: boolean }) => {
            // Build payload that matches CreateStrategyItemDto
            const payload: Record<string, unknown> = {
                type, // Must be "Argument", "Defense", or "Citation"
                caseId,
            };

            // Add type-specific fields
            if (type === 'Citation') {
                const citation = item as Citation;
                payload.citation = citation.citation || citation.title;
                payload.title = citation.title;
                payload.court = citation.court;
                payload.year = citation.year;
            } else if (type === 'Defense') {
                const defense = item as Defense;
                payload.title = defense.title;
                payload.description = defense.description;
                payload.defenseType = defense.type; // Maps Defense.type to defenseType field
                payload.status = defense.status;
            } else if (type === 'Argument') {
                const argument = item as LegalArgument;
                payload.title = argument.title;
                payload.description = argument.description;
                payload.status = argument.status;
            }

            if (isEditing) {
                return await DataService.strategy.update(item.id, payload);
            } else {
                return await DataService.strategy.add(payload);
            }
        },
        {
            onSuccess: (_data, variables) => {
                queryClient.invalidate(['case-strategy', caseId]);
            }
        }
    );

    const { mutate: deleteStrategyItem } = useMutation(
        async ({ type, id }: { type: string; id: string }) => {
            await DataService.strategy.delete(id, type as 'Argument' | 'Defense' | 'Citation');
            return { type, id };
        },
        {
            onSuccess: (data) => {
                queryClient.invalidate(['case-strategy', caseId]);
            }
        }
    );

    return {
        strategyData: strategyData as any, // Cast to any to handle the loose structure returned by service
        isLoading,
        saveStrategyItem,
        isSaving,
        deleteStrategyItem
    };
};
