import { useNotify } from "@/hooks/useNotify";
import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/dataService";
import { billingQueryKeys } from "@/services/infrastructure/queryKeys";
import { Invoice } from "@/types";
import { InvoiceStatusEnum } from "@/types/enums";
import { useCallback, useMemo, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export type BillingInvoicesStatus = "idle" | "loading" | "success" | "error";

export interface BillingInvoicesState {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  searchTerm: string;
  filterStatus: string;
  status: BillingInvoicesStatus;
}

export interface BillingInvoicesActions {
  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: string) => void;
  sendInvoice: (id: string) => void;
  markPaid: (id: string) => void;
}

interface MutationContext {
  previousInvoices?: Invoice[];
}

// ============================================================================
// Hook
// ============================================================================

export function useBillingInvoices(): [
  BillingInvoicesState,
  BillingInvoicesActions,
] {
  const notify = useNotify();
  const [searchTerm, setSearchTermState] = useState("");
  const [filterStatus, setFilterStatusState] = useState("All");

  // Data Fetching
  const {
    data: invoices = [],
    isLoading,
    isError,
  } = useQuery<Invoice[]>(billingQueryKeys.billing.invoices(), () =>
    DataService && DataService.billing
      ? DataService.billing.getInvoices()
      : Promise.resolve([])
  );

  // Mutations
  const { mutate: sendInvoiceMutation } = useMutation(
    (id: string) =>
      DataService && DataService.billing
        ? DataService.billing.sendInvoice(id)
        : Promise.resolve(false),
    {
      onMutate: async (id: string) => {
        const previousInvoices = queryClient.getQueryState<Invoice[]>(
          billingQueryKeys.billing.invoices()
        )?.data;
        queryClient.setQueryData<Invoice[]>(
          billingQueryKeys.billing.invoices(),
          (old = []) =>
            old.map((inv) =>
              inv.id === id ? { ...inv, status: InvoiceStatusEnum.SENT } : inv
            )
        );
        return { previousInvoices };
      },
      onSuccess: (_, id) => {
        notify.success(`Invoice ${id} sent successfully.`);
      },
      onError: (_, __, context?: MutationContext) => {
        if (context?.previousInvoices) {
          queryClient.setQueryData(
            billingQueryKeys.billing.invoices(),
            context.previousInvoices
          );
        }
        notify.error("Failed to send invoice");
      },
      onSettled: () => {
        queryClient.invalidate(billingQueryKeys.billing.invoices());
      },
    }
  );

  const { mutate: markPaidMutation } = useMutation(
    (id: string) =>
      DataService.billing.updateInvoice(id, { status: InvoiceStatusEnum.PAID }),
    {
      onMutate: async (id: string) => {
        const previousInvoices = queryClient.getQueryState<Invoice[]>(
          billingQueryKeys.billing.invoices()
        )?.data;
        queryClient.setQueryData<Invoice[]>(
          billingQueryKeys.billing.invoices(),
          (old = []) =>
            old.map((inv) =>
              inv.id === id ? { ...inv, status: InvoiceStatusEnum.PAID } : inv
            )
        );
        return { previousInvoices };
      },
      onSuccess: () => {
        notify.success(
          "Invoice marked as PAID. Transaction recorded in immutable ledger."
        );
      },
      onError: (_, __, context?: MutationContext) => {
        if (context?.previousInvoices) {
          queryClient.setQueryData(
            billingQueryKeys.billing.invoices(),
            context.previousInvoices
          );
        }
        notify.error("Failed to update invoice.");
      },
      onSettled: () => {
        queryClient.invalidate(billingQueryKeys.billing.invoices());
      },
    }
  );

  // Derived State (Pure Computation)
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        (inv.client || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, filterStatus]);

  // Derived Status
  const status: BillingInvoicesStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : "success";

  // Stable Actions
  const setSearchTerm = useCallback(
    (term: string) => setSearchTermState(term),
    []
  );
  const setFilterStatus = useCallback(
    (status: string) => setFilterStatusState(status),
    []
  );
  const sendInvoice = useCallback(
    (id: string) => sendInvoiceMutation(id),
    [sendInvoiceMutation]
  );
  const markPaid = useCallback(
    (id: string) => markPaidMutation(id),
    [markPaidMutation]
  );

  return [
    {
      invoices,
      filteredInvoices,
      searchTerm,
      filterStatus,
      status,
    },
    {
      setSearchTerm,
      setFilterStatus,
      sendInvoice,
      markPaid,
    },
  ];
}
