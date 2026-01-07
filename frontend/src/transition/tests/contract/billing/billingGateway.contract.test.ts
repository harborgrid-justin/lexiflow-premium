/**
 * Contract test for Billing Gateway
 */

import { describe, expect, it } from "vitest";
import { billingGateway } from "../../../features/billing/data/billingGateway";

describe("Billing Gateway Contract", () => {
  it("getInvoices returns array of invoices", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          number: "INV-001",
          customerId: "cust-1",
          amount: 100.0,
          currency: "USD",
          status: "paid",
          dueDate: "2024-02-01T00:00:00Z",
          createdAt: "2024-01-01T00:00:00Z",
          items: [],
        },
      ],
    });

    const invoices = await billingGateway.getInvoices();

    expect(Array.isArray(invoices)).toBe(true);
    expect(invoices.length).toBeGreaterThan(0);

    const invoice = invoices[0];
    expect(invoice).toHaveProperty("id");
    expect(invoice).toHaveProperty("number");
    expect(invoice).toHaveProperty("amount");
    expect(invoice).toHaveProperty("currency");
    expect(invoice).toHaveProperty("status");
  });

  it("getInvoice returns single invoice", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "1",
        number: "INV-001",
        customerId: "cust-1",
        amount: 100.0,
        currency: "USD",
        status: "paid",
        dueDate: "2024-02-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        items: [],
      }),
    });

    const invoice = await billingGateway.getInvoice("1");

    expect(invoice.id).toBe("1");
    expect(invoice.number).toBe("INV-001");
  });
});
