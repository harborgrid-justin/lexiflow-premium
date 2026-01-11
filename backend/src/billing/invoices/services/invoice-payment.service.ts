import {
  Invoice,
  InvoiceStatus,
} from "@billing/invoices/entities/invoice.entity";
import { TransactionManagerService } from "@common/services/transaction-manager.service";
import { Injectable } from "@nestjs/common";

/**
 * ╔=================================================================================================================╗
 * ║INVOICEPAYMENT                                                                                                   ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class InvoicePaymentService {
  constructor(private transactionManager: TransactionManagerService) {}

  /**
   * Process payment with pessimistic locking to prevent race conditions
   */
  async processPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: string
  ) {
    return this.transactionManager.executeInTransaction(
      async (manager) => {
        // Pessimistic write lock (SELECT ... FOR UPDATE)
        const invoice = await manager
          .createQueryBuilder(Invoice, "invoice")
          .where("invoice.id = :id", { id: invoiceId })
          .setLock("pessimistic_write")
          .getOne();

        if (!invoice) {
          throw new Error(`Invoice ${invoiceId} not found`);
        }

        if (amount <= 0) {
          throw new Error("Payment amount must be positive");
        }

        if (amount > invoice.balanceDue) {
          throw new Error(
            `Payment amount ${amount} exceeds balance due ${invoice.balanceDue}`
          );
        }

        // Update invoice
        invoice.paidAmount = Number(invoice.paidAmount) + amount;
        invoice.balanceDue = Number(invoice.balanceDue) - amount;
        invoice.paymentMethod = paymentMethod;

        if (invoice.balanceDue === 0) {
          invoice.status = InvoiceStatus.PAID;
          invoice.paidAt = new Date();
        } else if (invoice.paidAmount > 0) {
          invoice.status = InvoiceStatus.PARTIAL;
        }

        // Save with optimistic locking check
        return manager.save(Invoice, invoice);
      },
      { isolationLevel: "SERIALIZABLE" }
    );
  }

  /**
   * Transfer funds between trust accounts with locking
   */
  async transferBetweenInvoices(
    fromInvoiceId: string,
    toInvoiceId: string,
    amount: number
  ) {
    return this.transactionManager.executeInTransaction(
      async (manager) => {
        // Lock in deterministic order to prevent deadlocks
        const [firstId, secondId] = [fromInvoiceId, toInvoiceId].sort();

        const firstInvoice = await manager
          .createQueryBuilder(Invoice, "invoice")
          .where("invoice.id = :id", { id: firstId })
          .setLock("pessimistic_write")
          .getOne();

        const secondInvoice = await manager
          .createQueryBuilder(Invoice, "invoice")
          .where("invoice.id = :id", { id: secondId })
          .setLock("pessimistic_write")
          .getOne();

        if (!firstInvoice || !secondInvoice) {
          throw new Error("One or both invoices not found");
        }

        // Determine which is source and which is destination
        const fromInvoice =
          firstId === fromInvoiceId ? firstInvoice : secondInvoice;
        const toInvoice =
          firstId === toInvoiceId ? firstInvoice : secondInvoice;

        if (fromInvoice.paidAmount < amount) {
          throw new Error("Insufficient paid amount for transfer");
        }

        // Perform transfer
        fromInvoice.paidAmount = Number(fromInvoice.paidAmount) - amount;
        fromInvoice.balanceDue = Number(fromInvoice.balanceDue) + amount;

        toInvoice.paidAmount = Number(toInvoice.paidAmount) + amount;
        toInvoice.balanceDue = Number(toInvoice.balanceDue) - amount;

        await manager.save(Invoice, [fromInvoice, toInvoice]);

        return { fromInvoice, toInvoice };
      },
      { isolationLevel: "SERIALIZABLE" }
    );
  }
}
