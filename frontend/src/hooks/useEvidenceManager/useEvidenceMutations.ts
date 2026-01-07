/**
 * Evidence mutation operations sub-hook
 * @module hooks/useEvidenceManager/useEvidenceMutations
 */

import { DataService } from "@/services/data/dataService";
import type { EvidenceItem } from "@/types";
import { queryKeys } from "@/utils/queryKeys";
import { useMutation } from "../useQueryHooks";

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
