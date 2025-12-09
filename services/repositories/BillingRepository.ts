import { TimeEntry, Invoice, RateTable, TrustTransaction, Client, WIPStat, RealizationStat, UUID, CaseId, OperatingSummary, FinancialPerformanceData, UserId, FirmExpense } from '../../types';
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
         
         // Aggregate WIP by Client
         const caseToClientMap: Record<string, string> = {};
         
         clients.forEach(c => {
             c.matters.forEach(m => {
                 caseToClientMap[m] = c.id;
             });
         });

         const wipMap: Record<string, number> = {};

         entries.forEach(e => {
             if (e.status === 'Unbilled') {
                 const clientId = caseToClientMap[e.caseId];
                 if (clientId) {
                     wipMap[clientId] = (wipMap[clientId] || 0) + e.total;
                 }
             }
         });

         const stats = Object.keys(wipMap).map(clientId => {
             const client = clients.find(c => c.id === clientId);
             return {
                 name: client ? client.name.split(' ')[0] : 'Unknown',
                 wip: wipMap[clientId],
                 billed: client ? client.totalBilled : 0
             };
         });

         if (stats.length === 0) {
              return clients.slice(0, 3).map(c => ({
                name: c.name.split(' ')[0],
                wip: 0, 
                billed: c.totalBilled
             }));
         }
         
         return stats.sort((a,b) => b.wip - a.wip).slice(0, 5);
    }

    async getRealizationStats(): Promise<any> {
        const invoices = await this.getInvoices();
        const totalBilled = invoices.reduce((acc, i) => acc + i.amount, 0);
        const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
        
        const rate = totalBilled === 0 ? 100 : Math.round((totalCollected / totalBilled) * 100);
        
        return [
            { name: 'Billed', value: rate, color: '#10b981' },
            { name: 'Write-off', value: 100 - rate, color: '#ef4444' },
        ];
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
        await this.updateInvoice(id, { status: 'Sent' });
        
        const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
        await ChainService.createEntry({
            timestamp: new Date().toISOString(),
            user: 'System Billing',
            userId: 'sys-billing' as UserId,
            action: 'INVOICE_SENT',
            resource: `Invoice/${id}`,
            ip: 'internal'
        }, prevHash);

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
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        const [expenses, invoices] = await Promise.all([
            db.getAll<FirmExpense>(STORES.EXPENSES),
            db.getAll<Invoice>(STORES.INVOICES)
        ]);

        const expensesMtd = expenses
            .filter(e => e.date >= startOfMonth)
            .reduce((sum, e) => sum + e.amount, 0);

        const revenueMtd = invoices
            .filter(i => i.status === 'Paid' && i.date >= startOfMonth)
            .reduce((sum, i) => sum + i.amount, 0);
        
        const balance = revenueMtd - expensesMtd + 500000;

        return { balance, expensesMtd, cashFlowMtd: revenueMtd };
    }

    async getFinancialPerformance(): Promise<FinancialPerformanceData> {
        const [invoices, expenses] = await Promise.all([
            db.getAll<Invoice>(STORES.INVOICES),
            db.getAll<FirmExpense>(STORES.EXPENSES)
        ]);

        const revenueByMonth: Record<string, number> = {};
        const expensesByCategory: Record<string, number> = {};

        invoices.forEach(inv => {
            const month = new Date(inv.date).toLocaleString('default', { month: 'short' });
            revenueByMonth[month] = (revenueByMonth[month] || 0) + inv.amount;
        });

        expenses.forEach(exp => {
            expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenueData = months.map(m => ({
            month: m,
            actual: revenueByMonth[m] || 0,
            target: 400000 
        }));

        const expenseData = Object.keys(expensesByCategory).map(cat => ({
            category: cat,
            value: expensesByCategory[cat]
        }));
        
        if (revenueData.every(d => d.actual === 0)) {
             return {
                revenue: [
                    { month: 'Jan', actual: 420000, target: 400000 },
                    { month: 'Feb', actual: 450000, target: 410000 },
                    { month: 'Mar', actual: 380000, target: 420000 },
                ],
                expenses: [
                    { category: 'Payroll', value: 250000 },
                    { category: 'Rent', value: 45000 },
                ]
            };
        }

        return {
            revenue: revenueData,
            expenses: expenseData
        };
    }

    async sync() { await delay(1000); console.log("[API] Financials Synced"); }
    async export(format: string) { await delay(1500); return `report.${format}`; }
}