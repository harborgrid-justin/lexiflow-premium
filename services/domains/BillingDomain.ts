
import { TimeEntry, Client, Invoice } from '../../types';
import { db, STORES } from '../db';
import { MOCK_TIME_ENTRIES } from '../../data/mockBilling';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const BillingService = {
    getTimeEntries: async (caseId?: string) => {
      const allEntries = await db.getAll<TimeEntry>(STORES.BILLING);
      return caseId ? allEntries.filter(e => e.caseId === caseId) : allEntries;
    },
    addTimeEntry: async (entry: TimeEntry) => {
        return db.put(STORES.BILLING, entry);
    },
    getWIPStats: async () => {
         const [clients, entries] = await Promise.all([
             db.getAll<Client>(STORES.CLIENTS),
             db.getAll<TimeEntry>(STORES.BILLING)
         ]);
         
         return clients.slice(0, 3).map(c => {
             const clientEntries = entries.filter(e => {
                return e.status === 'Unbilled'; 
             });
             
             return {
                name: c.name.split(' ')[0],
                wip: Math.floor(Math.random() * 50000), 
                billed: c.totalBilled
             };
         });
    },
    getRealizationStats: async () => {
        await delay(50);
        return [ { name: 'Billed', value: 85, color: '#10b981' }, { name: 'Write-off', value: 15, color: '#ef4444' } ];
    },
    getTopAccounts: async () => {
        const clients = await db.getAll<Client>(STORES.CLIENTS);
        return clients.sort((a, b) => b.totalBilled - a.totalBilled).slice(0, 4);
    },
    getTrustAccounts: async () => db.getAll<any>(STORES.TRUST),
    getOverviewStats: async () => { await delay(50); return { realization: 92.4, totalBilled: 482000, month: 'March 2024' }; },
    
    getInvoices: async () => {
        const invoices = await db.getAll<Invoice>(STORES.INVOICES);
        if (invoices.length === 0) {
             return [
                { id: 'INV-2024-001', client: 'TechCorp Industries', matter: 'Martinez v. TechCorp', date: '2024-03-01', dueDate: '2024-03-31', amount: 15450.00, status: 'Sent', items: [] },
                { id: 'INV-2024-002', client: 'OmniGlobal', matter: 'Merger Acquisition', date: '2024-02-15', dueDate: '2024-03-15', amount: 42000.50, status: 'Paid', items: [] },
                { id: 'INV-2024-003', client: 'StartUp Inc', matter: 'Series A Funding', date: '2024-01-10', dueDate: '2024-02-10', amount: 8500.00, status: 'Overdue', items: [] },
            ];
        }
        return invoices;
    },

    createInvoice: async (clientName: string, caseId: string, entries: TimeEntry[]): Promise<Invoice> => {
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
            await db.put(STORES.BILLING, updatedEntry);
        }

        return invoice;
    },

    updateInvoice: async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
        const invoice = await db.get<Invoice>(STORES.INVOICES, id);
        if (!invoice) throw new Error("Invoice not found");
        const updated = { ...invoice, ...updates };
        await db.put(STORES.INVOICES, updated);
        return updated;
    },

    sync: async () => { await delay(1000); console.log("[API] Financials Synced"); },
    export: async (format: string) => { await delay(1500); return `report.${format}`; },
    sendInvoice: async (id: string) => { await delay(500); console.log(`[API] Invoice ${id} sent`); return true; }
};
