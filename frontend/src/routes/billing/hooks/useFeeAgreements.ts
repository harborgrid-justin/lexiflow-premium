import { useCallback } from "react";

import { useNotify } from "@/hooks/useNotify";
import { useMutation, useQuery, queryClient } from "@/hooks/useQueryHooks";
import { billingApi } from "@/lib/frontend-api";
import { queryKeys } from "@/utils/query-keys.service";

// ============================================================================
// Types
// ============================================================================

export interface FeeAgreement {
  id: string;
  caseId?: string;
  clientId: string;
  clientName: string;
  type: "Hourly" | "Contingency" | "Flat Fee" | "Retainer" | "Hybrid";
  status: "Draft" | "Pending Signature" | "Active" | "Suspended" | "Terminated";
  effectiveDate: string;
  terminationDate?: string;
  terms: string;
  hourlyRate?: number;
  contingencyPercent?: number;
  flatFeeAmount?: number;
  retainerAmount?: number;
  createdAt: string;
}

export type FeeAgreementStatus =
  | "idle"
  | "loading"
  | "submitting"
  | "success"
  | "error";

export interface FeeAgreementState {
  agreements: FeeAgreement[];
  status: FeeAgreementStatus;
  error: Error | null;
}

export interface FeeAgreementActions {
  createAgreement: (data: Partial<FeeAgreement>) => Promise<unknown>;
  updateAgreement: (
    id: string,
    data: Partial<FeeAgreement>
  ) => Promise<unknown>;
  deleteAgreement: (id: string) => Promise<unknown>;
  refresh: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useFeeAgreements = (): [
  FeeAgreementState,
  FeeAgreementActions,
] => {
  const notify = useNotify();
  const queryKey = queryKeys.billing.feeAgreements?.() || [
    "billing",
    "feeAgreements",
  ];

  const {
    data: agreements = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FeeAgreement[]>(queryKey, () =>
    billingApi
      .getFeeAgreements()
      .then((result) => (result.ok ? result.data : []))
  );

  const { mutateAsync: createAgreement, isLoading: isCreating } = useMutation(
    async (data: Partial<FeeAgreement>) => {
      const result = await billingApi.createFeeAgreement(data);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    {
      onSuccess: () => {
        notify.success("Fee agreement created");
        queryClient.invalidate(queryKey);
      },
      onError: (err: Error) =>
        notify.error(err.message || "Failed to create fee agreement"),
    }
  );

  const { mutateAsync: updateAgreement, isLoading: isUpdating } = useMutation(
    async ({ id, data }: { id: string; data: Partial<FeeAgreement> }) => {
      const result = await billingApi.updateFeeAgreement(id, data);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    {
      onSuccess: () => {
        notify.success("Fee agreement updated");
        queryClient.invalidate(queryKey);
      },
      onError: (err: Error) =>
        notify.error(err.message || "Failed to update fee agreement"),
    }
  );

  const { mutateAsync: deleteAgreement, isLoading: isDeleting } = useMutation(
    async (id: string) => {
      const result = await billingApi.deleteFeeAgreement(id);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    {
      onSuccess: () => {
        notify.success("Fee agreement deleted");
        queryClient.invalidate(queryKey);
      },
      onError: (err: Error) =>
        notify.error(err.message || "Failed to delete fee agreement"),
    }
  );

  const updateAgreementAction = useCallback(
    (id: string, data: Partial<FeeAgreement>) => updateAgreement({ id, data }),
    [updateAgreement]
  );

  const status: FeeAgreementStatus =
    isCreating || isUpdating || isDeleting
      ? "submitting"
      : isLoading
        ? "loading"
        : isError
          ? "error"
          : "success";

  return [
    {
      agreements,
      status,
      error: error as Error,
    },
    {
      createAgreement,
      updateAgreement: updateAgreementAction,
      deleteAgreement,
      refresh: refetch,
    },
  ];
};
