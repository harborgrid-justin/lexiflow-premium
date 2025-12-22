
import { TimeEntry, Invoice, RateTable, TrustTransaction, Client, WIPStat, RealizationStat, UUID, CaseId, OperatingSummary, FinancialPerformanceData, UserId, FirmExpense } from '../../../types';
import { delay } from '../../../utils/async';
import { Repository } from '../../core/Repository';
import { STORES, db } from '../db';
import { ChainService } from '../../infrastructure/chainService';
import { IntegrationOrchestrator } from '../../integration/integrationOrchestrator';
import { SystemEventType } from "../../../types/integration-types";
export class BillingRepository extends Repository<TimeEntry> {
    constructor() { 
        super(STORES.BILLING);
        // Bind methods to ensure 'this' context is preserved
        this.getTimeEntries = this.getTimeEntries.bind(this);
        this.getRates = this.getRates.bind(this);
        this.addTimeEntry = this.addTimeEntry.bind(this);
        this.getWIPStats = this.getWIPStats.bind(this);
        this.getRealizationStats = this.getRealizationStats.bind(this);
        this.getInvoices = this.getInvoices.bind(this);
        this.createInvoice = this.createInvoice.bind(this);
        this.updateInvoice = this.updateInvoice.bind(this);
        this.sendInvoice = this.sendInvoice.bind(this);
    }
    // --- Rate Management ---
    async getRates(timekeeperId: string) {
        return db.getByIndex<RateTable>(STORES.RATES, 'timekeeperId', timekeeperId);
    }
    
    // --- Time & WIP ---
    async getTimeEntries(filters?: { caseId?: string; userId?: string; page?: number; limit?: number } | string) {
      const allEntries = await this.getAll();
      // Support both old string signature and new filters object for backward compatibility
      if (typeof filters === 'string') {
        return allEntries.filter(e => e.caseId === filters);
      }
      if (filters?.caseId) {
        return allEntries.filter(e => e.caseId === filters.caseId);
      }
      if (filters?.userId) {
        return allEntries.filter(e => e.userId === filters.userId || e.createdBy === filters.userId);
      }
      return allEntries;
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
             (c.matters || []).forEach(m => {
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
                 name: client ? (client.name || '').split(' ')[0] : 'Unknown',
                 wip: wipMap[clientId],
                 billed: client ? client.totalBilled : 0
             };
         });
         if (stats.length === 0) {
              return clients.slice(0, 3).map(c => ({
                name: (c.name || '').split(' ')[0],
                wip: 0,
                billed: c.totalBilled
             }));
         }
         return stats.sort((a,b) => b.wip - a.wip).slice(0, 5);
    }
    
    async getRealizationStats(): Promise<unknown> {
        const invoices = await this.getInvoices();
        const totalBilled = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
        const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + (i.amount || 0), 0);
        
        const rate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
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
            await this.update(entry.id, updatedEntry);
        }
        return invoice;
    }
    
    async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
        const invoice = await db.get<Invoice>(STORES.INVOICES, id);
        if (!invoice) throw new Error("Invoice not found");
        const updated = { ...invoice, ...updates };
        await db.put(STORES.INVOICES, updated);
        if (updates.status && updates.status !== invoice.status) {
            IntegrationOrchestrator.publish(SystemEventType.INVOICE_STATUS_CHANGED, { invoice: updated });
        }
        return updated;
    }
    
    async sendInvoice(id: string) { await delay(500); console.log(`[API] Invoice ${id} sent`); return true; }
    // --- Trust Accounting ---
    async getTrustTransactions(accountId: string): Promise<TrustTransaction[]> {
        return db.getByIndex(STORES.TRUST_TX, 'accountId', accountId);
    }
    
    async getTrustAccounts() { return db.getAll<unknown>(STORES.TRUST); }
    async getTopAccounts(): Promise<Client[]> {
        const clients = await db.getAll<Client>(STORES.CLIENTS);
        return clients.sort((a, b) => b.totalBilled - a.totalBilled).slice(0, 4);
    }
    async getOverviewStats() { await delay(50); return { realization: 92.4, totalBilled: 482000, month: 'March 2024' }; }
    async getOperatingSummary(): Promise<OperatingSummary> {
        const summary = await db.get<OperatingSummary>(STORES.OPERATING_SUMMARY, 'op-summary-main');
        return summary || { balance: 0, expensesMtd: 0, cashFlowMtd: 0 };
    }
    async getFinancialPerformance(): Promise<FinancialPerformanceData> {
        await delay(200);
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

