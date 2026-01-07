/**
 * useBillingData - Hook for billing data operations
 *
 * Connects to backend billing gateway for invoice management.
 */

import { useEffect, useState } from "react";
import type { Invoice } from "../../../services/data/api/gateways/billingGateway";
import { billingGateway } from "../../../services/data/api/gateways/billingGateway";

export function useBillingData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingGateway.getAllInvoices();
      setInvoices(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load invoices";
      console.error("Failed to load invoices:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (
    invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const created = await billingGateway.createInvoice(invoice);
      if (created) {
        await loadInvoices(); // Refresh list
      }
      return created;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create invoice";
      console.error("Failed to create invoice:", err);
      setError(message);
      return null;
    }
  };

  return {
    invoices,
    loading,
    error,
    refresh: loadInvoices,
    createInvoice,
  };
}
