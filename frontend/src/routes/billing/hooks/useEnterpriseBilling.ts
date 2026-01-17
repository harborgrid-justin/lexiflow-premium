/**
 * Custom hook for Enterprise Billing data
 * Extracts data fetching logic from component per enterprise architecture
 *
 * @module routes/billing/hooks/useEnterpriseBilling
 */

import { useMemo } from "react";

import { useQuery } from "@/hooks/useQueryHooks";
import { billingApi } from "@/lib/frontend-api";

export interface BillingSummaryMetrics {
  totalOutstanding: number;
  totalReceivables: number;
  collectedThisMonth: number;
  collectionRate: number;
  writeOffsThisMonth: number;
  averageDaysToPayment: number;
  overdueAmount: number;
  overdueCount: number;
}

export interface CollectionItem {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  daysOverdue: number;
  lastContactDate?: string;
  assignedTo?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "contacted" | "payment_plan";
}

export interface EnterpriseBillingData {
  metrics: BillingSummaryMetrics;
  collectionItems: CollectionItem[];
  isLoading: boolean;
}

export function useEnterpriseBilling(firmId?: string): EnterpriseBillingData {
  const { data: billingData, isLoading: loadingBilling } = useQuery(
    ["billing", "analytics", firmId],
    async () => {
      const result = await billingApi.getOverviewStats();
      return result.ok ? result.data : null;
    },
  );

  const { data: collectionItems = [], isLoading: loadingCollections } =
    useQuery<CollectionItem[]>(["billing", "collections", firmId], async () => {
      const result = await billingApi.getCollections();
      return result.ok ? result.data : [];
    });

  const metrics: BillingSummaryMetrics = useMemo(() => {
    if (!billingData) {
      return {
        totalOutstanding: 0,
        totalReceivables: 0,
        collectedThisMonth: 0,
        collectionRate: 0,
        writeOffsThisMonth: 0,
        averageDaysToPayment: 0,
        overdueAmount: 0,
        overdueCount: 0,
      };
    }

    const data = billingData as unknown as {
      outstandingAR?: number;
      collectedRevenue?: number;
      writeOffs?: number;
      realization?: { rate?: number };
    };

    return {
      totalOutstanding: data.outstandingAR || 0,
      totalReceivables: data.outstandingAR || 0,
      collectedThisMonth: data.collectedRevenue || 0,
      collectionRate: data.realization?.rate || 0,
      writeOffsThisMonth: data.writeOffs || 0,
      averageDaysToPayment: 0,
      overdueAmount: 0,
      overdueCount: 0,
    };
  }, [billingData]);

  return {
    metrics,
    collectionItems,
    isLoading: loadingBilling || loadingCollections,
  };
}
