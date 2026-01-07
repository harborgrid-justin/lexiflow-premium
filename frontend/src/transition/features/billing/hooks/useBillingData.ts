/**
 * useBillingData - Hook for billing data operations
 */

import { useEffect, useState } from "react";
import { billingGateway } from "../data/billingGateway";
import type { Invoice } from "../domain/invoice";

export function useBillingData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await billingGateway.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    loading,
    refresh: loadInvoices,
  };
}
