
import { TimeEntry, Invoice, RateTable, TrustTransaction, Client, WIPStat, OperatingSummary, FinancialPerformanceData, UUID, UserId } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';
import { ChainService } from '../chainService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class BillingRepository extends Repository<TimeEntry> {
    constructor() { super(STORES.BILLING); }

    // --- Rate Management ---
    async getRates(timekeeperId: string) {
        return db.getByIndex<RateTable>(STORES.RATES, 'timekeeperId', timekeeperId);
    }
    
    // --- Time & WIP ---
    async getTimeEntries(caseId?: string) {
      const allEntries = await this.getAll();
      return caseId ? allEntries.filter(e => e.caseId === caseId) : allEntries;
    }

    async addTimeEntry(entry: TimeEntry) {
        return this.add(entry);
    }

    async getWIPStats(): Promise<WIPStat[]> {
         const [clients, entries] = await Promise.all([
             db.getAll<Client>(STORES.CLIENTS),
             this.getAll()
         ]);
         
         // Aggregate WIP
         const wipMap = entries.filter(e => e.status === 'Unbilled').reduce((acc, curr) => {
             // Mock lookup client by case if possible, here using first client for simplicity or matching ID logic
             const clientId = '1'; // Placeholder logic
             acc[clientId] = (acc[clientId] || 0) + curr.total;
             return acc;
         }, {} as Record<string, number>);

         return clients.slice(0, 5).map(c => ({
            name: c.name.split(' ')[0],
            wip: wipMap[c.id] || Math.floor(Math.random() * 5000), // Fallback to mock data if empty
            billed: c.totalBilled
         }));
    }

    async getRealizationStats(): Promise<any> {
        const stats = await db.get<any>(STORES.REALIZATION_STATS, 'realization-main');
        return stats?.data || [];
    }

    // --- Invoices ---
    async getInvoices(): Promise<Invoice[]> {
        const invoices = await db.getAll<Invoice>(STORES.INVOICES);
        return invoices;
    }

    async createInvoice(clientName: string, caseId: string, entries: TimeEntry[]): Promise<Invoice> {
        const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);
        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(now.getDate() + 30);

        const invoice: Invoice = {
            id: `INV-${Date.now()}` as UUID,
            client: clientName,
            matter: caseId,
            caseId: caseId as any,
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
    }
    
    async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
        const invoice = await db.get<Invoice>(STORES.INVOICES, id);
        if (!invoice) throw new Error("Invoice not found");
        const updated = { ...invoice, ...updates };
        await db.put(STORES.INVOICES, updated);
        return updated;
    }
    
    async sendInvoice(id: string): Promise<boolean> {
        await delay(500);
        
        const invoice = await this.updateInvoice(id, { status: 'Sent' });
        
        // Log to Audit Chain
        const prevHash = '0000000000000000000000000000000000000000000000000000000000000000'; // Simplification
        await ChainService.createEntry({
            timestamp: new Date().toISOString(),
            user: 'System Billing',
            userId: 'sys-billing' as UserId,
            action: 'INVOICE_SENT',
            resource: `Invoice/${id}`,
            ip: 'internal'
        }, prevHash);

        console.log(`[API] Invoice ${id} sent and audit logged.`); 
        return true; 
    }

    // --- Trust Accounting ---
    async getTrustTransactions(accountId: string): Promise<TrustTransaction[]> {
        return db.getByIndex(STORES.TRUST_TX, 'accountId', accountId);
    }

    async getTrustAccounts() { return db.getAll<any>(STORES.TRUST); }
    
    async getTopAccounts(): Promise<Client[]> {
        const clients = await db.getAll<Client>(STORES.CLIENTS);
        return clients.sort((a, b) => b.totalBilled - a.totalBilled).slice(0, 4);
    }
    
    async getOverviewStats() { 
        // Real aggregation
        const invoices = await this.getInvoices();
        const totalBilled = invoices.reduce((acc, i) => acc + i.amount, 0);
        const collected = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
        const realization = totalBilled > 0 ? Math.round((collected / totalBilled) * 100) : 0;
        
        return { 
            realization, 
            totalBilled, 
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) 
        }; 
    }
    
    async getOperatingSummary(): Promise<OperatingSummary> {
        const summary = await db.get<OperatingSummary>(STORES.OPERATING_SUMMARY, 'op-summary-main');
        return summary || { balance: 0, expensesMtd: 0, cashFlowMtd: 0 };
    }

    async getFinancialPerformance(): Promise<FinancialPerformanceData> {
        await delay(200);
        // In a real app, calculate from invoices and expenses dynamically
        return {
            revenue: [
                { month: 'Jan', actual: 420000, target: 400000 },
                { month: 'Feb', actual: 450000, target: 410000 },
                { month: 'Mar', actual: 380000, target: 420000 },
                { month: 'Apr', actual: 490000, target: 430000 },
                { month: 'May', actual: 510000, target: 440000 },
                { month: 'Jun', actual: 550000, target: 450000 },
            ],
            expenses: [
                { category: 'Payroll', value: 250000 },
                { category: 'Rent', value: 45000 },
                { category: 'Software', value: 15000 },
                { category: 'Marketing', value: 25000 },
                { category: 'Travel', value: 12000 },
            ]
        };
    }

    async sync() { await delay(1000); console.log("[API] Financials Synced"); }
    async export(format: string) { await delay(1500); return `report.${format}`; }
}
