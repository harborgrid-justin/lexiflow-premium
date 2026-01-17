import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { type Risk } from '@/types';

interface UseCaseRisksOptions {
    onUpdateSuccess?: (data: Risk) => void;
    onDeleteSuccess?: (data: unknown, id: string) => void;
}

export const useCaseRisks = (caseId: string, options?: UseCaseRisksOptions) => {
    const { data: risks = [], isLoading } = useQuery<Risk[]>(
        ['risks', caseId],
        () => DataService.risks.getByCaseId(caseId)
    );

    const { mutate: addRisk } = useMutation(
        DataService.risks.add,
        { invalidateKeys: [['risks', caseId]] }
    );

    const { mutate: updateRisk } = useMutation(
        (updated: Risk) => DataService.risks.update(updated.id, updated),
        {
            invalidateKeys: [['risks', caseId]],
            onSuccess: options?.onUpdateSuccess
        }
    );

    const { mutate: deleteRisk } = useMutation(
        DataService.risks.delete,
        {
            invalidateKeys: [['risks', caseId]],
            onSuccess: options?.onDeleteSuccess
        }
    );

    return {
        risks,
        isLoading,
        addRisk,
        updateRisk,
        deleteRisk
    };
};
