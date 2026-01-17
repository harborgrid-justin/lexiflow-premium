/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { billingApi } from "@/lib/frontend-api";

import type { BillingRate, Invoice, TimeEntry, Transaction } from "@/types";
import type { ActionFunctionArgs } from "react-router";

export interface BillingLoaderData {
  invoices: Invoice[];
  transactions: Transaction[];
  rates: BillingRate[];
  timeEntries: TimeEntry[];
}

/**
 * Loader for Billing Dashboard
 * Fetches all billing-related data in parallel for optimal performance
 */
export async function clientLoader() {
  // Parallel data fetching for optimal performance
  const [invoicesResult, transactionsResult, ratesResult, timeEntriesResult] =
    await Promise.all([
      billingApi.getAllInvoices(),
      billingApi.getAllTransactions(),
      billingApi.getBillingRates(),
      billingApi.getAllTimeEntries(),
    ]);

  return {
    invoices: invoicesResult.ok ? (invoicesResult.data as Invoice[]) : [],
    transactions: transactionsResult.ok
      ? (transactionsResult.data as Transaction[])
      : [],
    rates: ratesResult.ok ? ratesResult.data : [],
    timeEntries: timeEntriesResult.ok
      ? (timeEntriesResult.data as TimeEntry[])
      : [],
  };
}

/**
 * Action handler for billing mutations
 * Handles: create-invoice, update-invoice, delete-invoice, create-transaction, log-time
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "create-invoice": {
      const invoiceData = JSON.parse(formData.get("data") as string);
      const result = await billingApi.createInvoice(invoiceData);
      if (!result.ok) {
        return { success: false, error: result.error.message };
      }
      return { success: true, invoice: result.data };
    }

    case "update-invoice": {
      const id = formData.get("id") as string;
      const updates = JSON.parse(formData.get("data") as string);
      const result = await billingApi.updateInvoice(id, updates);
      if (!result.ok) {
        return { success: false, error: result.error.message };
      }
      return { success: true, invoice: result.data };
    }

    case "delete-invoice": {
      const id = formData.get("id") as string;
      const result = await billingApi.deleteInvoice(id);
      if (!result.ok) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    }

    case "create-transaction": {
      const transactionData = JSON.parse(formData.get("data") as string);
      const result = await billingApi.createTransaction(transactionData);
      if (!result.ok) {
        return { success: false, error: result.error.message };
      }
      return { success: true, transaction: result.data };
    }

    case "log-time": {
      const timeData = JSON.parse(formData.get("data") as string);
      const result = await billingApi.createTimeEntry(timeData);
      if (!result.ok) {
        return { success: false, error: result.error.message };
      }
      return { success: true, entry: result.data };
    }

    default:
      return { success: false, error: "Unknown intent" };
  }
}
