/**
 * Data Dictionary Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.admin.getDataDictionary() instead.
 * This constant is only for seeding and testing purposes.
 */

import { DataDictionaryItem } from '@/types/data-infrastructure';

/**
 * @deprecated MOCK DATA - Use DataService.admin instead
 */
export const MOCK_DATA_DICTIONARY: DataDictionaryItem[] = [
    {
        id: 'dd-001',
        table: 'public.cases',
        column: 'title',
        dataType: 'VARCHAR(500)',
        description: 'The official legal title of the case/matter.',
        classification: 'Internal',
        isPII: false,
        domain: 'Legal',
        owner: 'Legal Ops',
        sourceSystem: 'Case Management System',
        dataQualityScore: 98
    },
    {
        id: 'dd-002',
        table: 'public.cases',
        column: 'estimated_value',
        dataType: 'NUMERIC(15,2)',
        description: 'The projected financial value or exposure of the matter.',
        classification: 'Confidential',
        isPII: false,
        domain: 'Finance',
        owner: 'Billing Dept',
        sourceSystem: 'Case Management System',
        dataQualityScore: 85
    },
    {
        id: 'dd-003',
        table: 'public.clients',
        column: 'tax_id',
        dataType: 'VARCHAR(20)',
        description: 'Tax Identification Number (EIN/SSN) for the client entity.',
        classification: 'Restricted',
        isPII: true,
        domain: 'Finance',
        owner: 'Compliance',
        sourceSystem: 'CRM',
        dataQualityScore: 100
    },
    {
        id: 'dd-004',
        table: 'public.documents',
        column: 'content',
        dataType: 'TEXT',
        description: 'Full text content extracted via OCR for search indexing.',
        classification: 'Confidential',
        isPII: true,
        domain: 'IT',
        owner: 'IT Ops',
        sourceSystem: 'DMS',
        dataQualityScore: 92
    },
    {
        id: 'dd-005',
        table: 'hr.staff',
        column: 'salary',
        dataType: 'INTEGER',
        description: 'Annual base salary of the employee.',
        classification: 'Restricted',
        isPII: true,
        domain: 'HR',
        owner: 'HR Director',
        sourceSystem: 'HRIS',
        dataQualityScore: 100
    },
    {
        id: 'dd-006',
        table: 'public.docket_entries',
        column: 'pacer_sequence_number',
        dataType: 'INTEGER',
        description: 'The official sequence number from the PACER/ECF system.',
        classification: 'Public',
        isPII: false,
        domain: 'Legal',
        owner: 'Docket Clerk',
        sourceSystem: 'PACER',
        dataQualityScore: 99
    },
    {
        id: 'dd-007',
        table: 'public.parties',
        column: 'email',
        dataType: 'VARCHAR(255)',
        description: 'Contact email address for the party.',
        classification: 'Confidential',
        isPII: true,
        domain: 'Legal',
        owner: 'Intake Team',
        sourceSystem: 'CRM',
        dataQualityScore: 88
    },
    {
        id: 'dd-008',
        table: 'finance.invoices',
        column: 'status',
        dataType: 'VARCHAR(50)',
        description: 'Current payment status of the invoice (Draft, Sent, Paid).',
        classification: 'Internal',
        isPII: false,
        domain: 'Finance',
        owner: 'Billing Manager',
        sourceSystem: 'ERP',
        dataQualityScore: 95
    }
];
