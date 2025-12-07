
import { TimeEntry, Invoice, RateTable, TrustTransaction, Client, WIPStat, RealizationStat } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class BillingRepository extends Repository<TimeEntry> {
    constructor() { super(STORES.BILLING); }

    // --- Rate Management ---
    getRates = async (timekeeperId: string) => {
        return db.getByIndex<RateTable>(STORES.RATES, 'timekeeperId', timekeeperId);
    }
    
    // --- Time & WIP ---
    getTimeEntries = async (caseId?: string) => {
      const allEntries = await this.getAll();
      return caseId ? allEntries.filter(e => e.caseId === caseId) : allEntries;
    }

    addTimeEntry = async (entry: TimeEntry) => {
        return this.add(entry);
    }

    getWIPStats = async (): Promise<WIPStat[]> => {
         const [clients, entries] = await Promise.all([
             db.getAll<Client>(STORES.CLIENTS),
             this.getAll()
         ]);
         
         return clients.slice(0, 3).map(c => {
             return {
                name: c.name.split(' ')[0],
                wip: Math.floor(Math.random() * 50000), 
                billed: c.totalBilled
             };
         });
    }

    getRealizationStats = async (): Promise<RealizationStat[]> => {
        await delay(50);
        return [ { name: 'Billed', value: 85, color: '#10b981' }, { name: 'Write-off', value: 15, color: '#ef4444' } ];
    }

    // --- Invoices ---
    getInvoices = async (): Promise<Invoice[]> => {
        const invoices = await db.getAll<Invoice>(STORES.INVOICES);
        return invoices;
    }

    createInvoice = async (clientName: string, caseId: string, entries: TimeEntry[]): Promise<Invoice> => {
        const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);
        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(now.getDate() + 30);

        const invoice: Invoice = {
            id: `INV-${Date.now()}`,
            client: clientName,
            matter: caseId,
            caseId: caseId,
            date: now.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            amount: totalAmount,
            status: 'Draft',
            items: entries.map(e => e.id)
        };

        await db.put(STORES.INVOICES, invoice);

        for (const entry of entries) {
            const updatedEntry = { ...entry, status: 'Billed' as const, invoiceId: invoice.id };
            await this.update(entry.id, updatedEntry);
        }

        return invoice;
    }
    
    updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
        const invoice = await db.get<Invoice>(STORES.INVOICES, id);
        if (!invoice) throw new Error("Invoice not found");
        const updated = { ...invoice, ...updates };
        await db.put(STORES.INVOICES, updated);
        return updated;
    }
    
    sendInvoice = async (id: string) => { await delay(500); console.log(`[API] Invoice ${id} sent`); return true; }

    // --- Trust Accounting ---
    getTrustTransactions = async (accountId: string): Promise<TrustTransaction[]> => {
        return db.getByIndex(STORES.TRUST_TX, 'accountId', accountId);
    }

    getTrustAccounts = async () => db.getAll<any>(STORES.TRUST);
    getTopAccounts = async (): Promise<Client[]> => {
        const clients = await db.getAll<Client>(STORES.CLIENTS);
        return clients.sort((a, b) => b.totalBilled - a.totalBilled).slice(0, 4);
    }
    getOverviewStats = async () => { await delay(50); return { realization: 92.4, totalBilled: 482000, month: 'March 2024' }; }
    sync = async () => { await delay(1000); console.log("[API] Financials Synced"); }
    export = async (format: string) => { await delay(1500); return `report.${format}`; }
}
