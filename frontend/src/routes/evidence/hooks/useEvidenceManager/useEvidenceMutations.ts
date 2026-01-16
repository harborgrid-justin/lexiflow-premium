/**
 * Evidence mutation operations sub-hook
 * @module hooks/useEvidenceManager/useEvidenceMutations
 */

import { useMutation } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import type { EvidenceItem } from "@/types";
import { queryKeys } from "@/utils/query-keys.service";

/**
 * Hook for evidence mutation operations
 */
export function useEvidenceMutations() {
  const { mutate: addEvidence } = useMutation(DataService.evidence.add, {
    invalidateKeys: [queryKeys.evidence.all()],
  });

  const { mutate: updateEvidence } = useMutation(
    (item: EvidenceItem) => DataService.evidence.update(item.id, item),
    { invalidateKeys: [queryKeys.evidence.all()] }
  );

  return {
    addEvidence,
    updateEvidence,
  };
}
