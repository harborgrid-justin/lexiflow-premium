/**
 * Invoice API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.billing.getInvoices() with queryKeys.billing.invoices() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/billing/entities/invoice.entity.ts
 */

import { Invoice, UUID } from '@/types';

/**
 * @deprecated MOCK DATA - Use DataService.billing instead
 */
export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'INV-2024-001' as UUID,
        invoiceNumber: 'INV-2024-001',
        caseId: 'C-2024-001' as Record<string, unknown>,
        clientId: '1',
        clientName: 'TechCorp Industries',
        matterDescription: 'Martinez v. TechCorp',
        invoiceDate: '2024-03-01',
        dueDate: '2024-03-31',
        billingModel: 'Hourly',
        status: 'Sent',
        subtotal: 15450.00,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 15450.00,
        paidAmount: 0,
        balanceDue: 15450.00,
        timeCharges: 15450.00,
        expenseCharges: 0,
        currency: 'USD'
    },
    {
        id: 'INV-2024-002' as UUID,
        invoiceNumber: 'INV-2024-002',
        caseId: 'C-2024-112' as Record<string, unknown>,
        clientId: '2',
        clientName: 'OmniGlobal',
        matterDescription: 'Merger Acquisition',
        invoiceDate: '2024-02-15',
        dueDate: '2024-03-15',
        billingModel: 'Fixed Fee',
        status: 'Paid',
        subtotal: 42000.50,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 42000.50,
        paidAmount: 42000.50,
        balanceDue: 0,
        timeCharges: 42000.50,
        expenseCharges: 0,
        currency: 'USD'
    },
    {
        id: 'INV-2024-003' as UUID,
        invoiceNumber: 'INV-2024-003',
        caseId: 'C-2023-892' as Record<string, unknown>,
        clientId: '3',
        clientName: 'StartUp Inc',
        matterDescription: 'Series A Funding',
        invoiceDate: '2024-01-10',
        dueDate: '2024-02-10',
        billingModel: 'Hourly',
        status: 'Overdue',
        subtotal: 8500.00,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 8500.00,
        paidAmount: 0,
        balanceDue: 8500.00,
        timeCharges: 8500.00,
        expenseCharges: 0,
        currency: 'USD'
    },
];
