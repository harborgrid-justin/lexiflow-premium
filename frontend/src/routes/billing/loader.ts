import { DataService } from "@/services/data/data-service.service";
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
  const [invoices, transactions, rates, timeEntries] = await Promise.all([
    DataService.invoices.getAll(),
    DataService.transactions.getAll(),
    DataService.billing.getRates(),
    DataService.timeEntries.getAll(),
  ]);

  return {
    invoices,
    transactions,
    rates,
    timeEntries,
  });
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
      const invoice = await DataService.invoices.add(invoiceData);
      return { success: true, invoice };
    }

    case "update-invoice": {
      const id = formData.get("id") as string;
      const updates = JSON.parse(formData.get("data") as string);
      const invoice = await DataService.invoices.update(id, updates);
      return { success: true, invoice };
    }

    case "delete-invoice": {
      const id = formData.get("id") as string;
      await DataService.invoices.delete(id);
      return { success: true };
    }

    case "create-transaction": {
      const transactionData = JSON.parse(formData.get("data") as string);
      const transaction = await DataService.transactions.add(transactionData);
      return { success: true, transaction };
    }

    case "log-time": {
      const timeData = JSON.parse(formData.get("data") as string);
      const entry = await DataService.timeEntries.add(timeData);
      return { success: true, entry };
    }

    default:
      return { success: false, error: "Unknown intent" };
  }
}
