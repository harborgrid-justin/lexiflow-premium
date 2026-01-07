/**
 * Billing Gateway - API client for billing operations
 */

import type { Invoice } from "../domain/invoice";
import type { Payment } from "../domain/payment";

class BillingGateway {
  private apiUrl = "/api/billing";

  async getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${this.apiUrl}/invoices`);
    if (!response.ok) throw new Error("Failed to fetch invoices");
    return await response.json();
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await fetch(`${this.apiUrl}/invoices/${id}`);
    if (!response.ok) throw new Error("Failed to fetch invoice");
    return await response.json();
  }

  async getPayments(): Promise<Payment[]> {
    const response = await fetch(`${this.apiUrl}/payments`);
    if (!response.ok) throw new Error("Failed to fetch payments");
    return await response.json();
  }
}

export const billingGateway = new BillingGateway();

// Query keys for React Query
export const billingQueryKeys = {
  all: ["billing"] as const,
  invoices: () => [...billingQueryKeys.all, "invoices"] as const,
  invoice: (id: string) => [...billingQueryKeys.invoices(), id] as const,
  payments: () => [...billingQueryKeys.all, "payments"] as const,
};
