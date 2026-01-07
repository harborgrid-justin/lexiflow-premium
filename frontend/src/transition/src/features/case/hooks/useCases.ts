/**
 * useCases Hook
 *
 * Data hook for fetching case lists with React Query.
 *
 * @module features/case/hooks/useCases
 */

import { useQuery } from "@tanstack/react-query";
import {
  caseGateway,
  type CaseFilter,
} from "../../../services/data/api/gateways/caseGateway";

export function useCases(filter: CaseFilter = {}) {
  return useQuery({
    queryKey: ["cases", filter],
    queryFn: () => caseGateway.findAll(filter),
    staleTime: 30000, // 30 seconds
  });
}
