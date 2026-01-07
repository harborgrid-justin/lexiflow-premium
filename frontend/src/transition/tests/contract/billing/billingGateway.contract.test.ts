/**
 * Contract test for Billing Gateway
 */

import { describe, expect, it, vi } from "vitest";
import { billingGateway } from "../../../src/services/data/api/gateways/billingGateway";

describe("Billing Gateway Contract", () => {
  it("getInvoices returns array of invoices", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          number: "INV-001",
          clientId: "cust-1",
          amount: 100.0,
          status: "paid",
          dueDate: "2024-02-01T00:00:00Z",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          items: [],
        },
      ],
    });

    const invoices = await billingGateway.getAllInvoices();

    expect(Array.isArray(invoices)).toBe(true);
    expect(invoices.length).toBeGreaterThan(0);

    const invoice = invoices[0];
    expect(invoice).toHaveProperty("id");
    expect(invoice).toHaveProperty("number");
    expect(invoice).toHaveProperty("amount");
    // expect(invoice).toHaveProperty("currency"); // Not in service model
    expect(invoice).toHaveProperty("status");
  });

  it("getInvoice returns single invoice", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "1",
        number: "INV-001",
        clientId: "cust-1",
        amount: 100.0,
        status: "paid",
        dueDate: "2024-02-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        items: [],
      }),
    });

    const invoice = await billingGateway.getInvoiceById("1");

    expect(invoice.id).toBe("1");
    expect(invoice.number).toBe("INV-001");
  });
});
