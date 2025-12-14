
import { Invoice, UUID } from '../../types';

export const MOCK_INVOICES: Invoice[] = [
    { id: 'INV-2024-001' as UUID, client: 'TechCorp Industries', matter: 'Martinez v. TechCorp', caseId: 'C-2024-001' as any, date: '2024-03-01', dueDate: '2024-03-31', amount: 15450.00, status: 'Sent', items: [] },
    { id: 'INV-2024-002' as UUID, client: 'OmniGlobal', matter: 'Merger Acquisition', caseId: 'C-2024-112' as any, date: '2024-02-15', dueDate: '2024-03-15', amount: 42000.50, status: 'Paid', items: [] },
    { id: 'INV-2024-003' as UUID, client: 'StartUp Inc', matter: 'Series A Funding', caseId: 'C-2023-892' as any, date: '2024-01-10', dueDate: '2024-02-10', amount: 8500.00, status: 'Overdue', items: [] },
];
