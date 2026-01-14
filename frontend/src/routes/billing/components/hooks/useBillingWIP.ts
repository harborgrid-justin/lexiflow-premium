import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/dataService";
import { billingQueryKeys } from "@/services/infrastructure/queryKeys";
import { TimeEntry, Invoice } from "@/types"; // Assuming Invoice is in types, if not I'll define local interface but Types usually has it
import {
  TimeEntryInput,
  validateTimeEntrySafe,
} from "@/services/validation/billingSchemas";
import { WIPStatusEnum } from "@/types/enums";
import { useNotify } from "@/hooks/useNotify";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// ============================================================================
// Types
// ============================================================================

export type BillingWIPStatus =
  | "idle"
  | "loading"
  | "submitting"
  | "success"
  | "error";

export interface BillingWIPState {
  entries: TimeEntry[];
  filteredEntries: TimeEntry[];
  selectedIds: Set<string>;
  totalUnbilled: number;
  selectedTotal: number;
  searchTerm: string;
  status: BillingWIPStatus;
}

export interface BillingWIPActions {
  setSearchTerm: (term: string) => void;
  toggleSelection: (id: string) => void;
  toggleAll: () => void;
  generateInvoice: () => void;
}

interface QueueItem {
  entries: TimeEntry[];
  resolve: (value: Invoice) => void;
  reject: (error: Error) => void;
}

// ============================================================================
// Invoice Generation Queue
// ============================================================================

class InvoiceGenerationQueue {
  private queue: QueueItem[] = [];
  private processing = 0;
  private readonly maxConcurrent = 2;

  async add(entries: TimeEntry[]): Promise<Invoice> {
    return new Promise((resolve, reject) => {
      this.queue.push({ entries, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0)
      return;

    this.processing++;
    const item = this.queue.shift();
    if (!item) {
      this.processing--;
      return;
    }

    try {
      if (item.entries.length === 0) {
        throw new Error("No entries to process");
      }
      const primaryCase = item.entries[0]!.caseId;
      const clientName = "Client Ref " + primaryCase;
      const invoice = await DataService.billing.createInvoice(
        clientName,
        primaryCase,
        item.entries
      );
      item.resolve(invoice);
    } catch (error) {
      item.reject(error as Error);
    } finally {
      this.processing--;
      await this.processQueue();
    }
  }
}

const invoiceQueue = new InvoiceGenerationQueue();

// ============================================================================
// Hook
// ============================================================================

export const useBillingWIP = (): [BillingWIPState, BillingWIPActions] => {
  const notify = useNotify();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draftEntry] = useState<Partial<TimeEntry> | null>(null);

  // Enterprise Data Access
  const {
    data: entries = [],
    isLoading,
    isError,
  } = useQuery<TimeEntry[]>(billingQueryKeys.billing.wip(), () =>
    DataService && DataService.billing
      ? DataService.billing.getTimeEntries()
      : Promise.resolve([])
  );

  // Auto-save draft
  useAutoSave({
    data: draftEntry,
    onSave: useCallback(async (entry: Partial<TimeEntry> | null) => {
      if (!entry || !entry.description) return;
      localStorage.setItem("billing-wip-draft", JSON.stringify(entry));
    }, []),
    delay: 2000,
  });

  const { mutate: mutateGenerateInvoice, isLoading: isGenerating } =
    useMutation(
      async (selectedEntries: TimeEntry[]) => {
        if (!DataService || !DataService.billing)
          throw new Error("Billing service unavailable");
        if (selectedEntries.length === 0)
          throw new Error("No entries selected");

        // Validate
        const validationErrors: string[] = [];
        selectedEntries.forEach((entry, index) => {
          const result = validateTimeEntrySafe(
            entry as unknown as TimeEntryInput
          );
          if (!result.valid) {
            validationErrors.push(
              `Entry ${index + 1}: ${result.errors.join(", ")}`
            );
          }
        });

        if (validationErrors.length > 0) {
          notify.error(`Validation failed: ${validationErrors[0]}`);
          throw new Error("Validation failed");
        }

        return invoiceQueue.add(selectedEntries);
      },
      {
        invalidateKeys: [
          billingQueryKeys.billing.wip(),
          billingQueryKeys.billing.invoices(),
        ],
        onSuccess: (invoice: Invoice) => {
          notify.success(
            `Invoice ${invoice.id} generated for $${invoice.amount.toFixed(2)}`
          );
          setSelectedIds(new Set());
          localStorage.removeItem("billing-wip-draft");
        },
        onError: () => notify.error("Failed to generate invoice."),
      }
    );

  // Memoized filtering
  const filteredEntries = useMemo(() => {
    return entries.filter(
      (e) =>
        e.status === WIPStatusEnum.UNBILLED &&
        (e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.caseId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [entries, searchTerm]);

  const handleGenerateClick = useCallback(() => {
    const selected = filteredEntries.filter((e) => selectedIds.has(e.id));
    if (selected.length === 0) {
      notify.warning("Please select at least one time entry.");
      return;
    }
    mutateGenerateInvoice(selected);
  }, [filteredEntries, selectedIds, mutateGenerateInvoice, notify]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "mod+n": () => {
      notify.info("New time entry form (to be implemented)");
    },
    "mod+g": () => {
      if (selectedIds.size > 0) {
        handleGenerateClick();
      }
    },
  });

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredEntries.length) {
        return new Set();
      } else {
        return new Set(filteredEntries.map((e) => e.id));
      }
    });
  }, [filteredEntries]);

  const totalUnbilled = filteredEntries.reduce(
    (acc, curr) => acc + curr.total,
    0
  );
  const selectedTotal = filteredEntries
    .filter((e) => selectedIds.has(e.id))
    .reduce((acc, curr) => acc + curr.total, 0);

  const status: BillingWIPStatus = isGenerating
    ? "submitting"
    : isLoading
      ? "loading"
      : isError
        ? "error"
        : "success";

  return [
    {
      entries,
      filteredEntries,
      selectedIds,
      totalUnbilled,
      selectedTotal,
      searchTerm,
      status,
    },
    {
      setSearchTerm,
      toggleSelection,
      toggleAll,
      generateInvoice: handleGenerateClick,
    },
  ];
};
