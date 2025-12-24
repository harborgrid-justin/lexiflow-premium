// data/mockApiSpec.ts
import { API_PREFIX } from '../../config/network/api.config';
import { ApiServiceSpec } from '@/types';

export const MOCK_API_SPEC: ApiServiceSpec[] = [
  {
    name: 'cases',
    description: 'Manages all case and matter records.',
    methods: [
      {
        name: 'getAll',
        http: 'GET',
        path: `${API_PREFIX}/cases`,
        description: 'Retrieves a list of all case records.',
        params: [],
        response: JSON.stringify([
          { id: "C-2024-001", title: "Martinez v. TechCorp", client: "TechCorp Industries", status: "Discovery" }
        ], null, 2)
      },
      {
        name: 'getById',
        http: 'GET',
        path: `${API_PREFIX}/cases/{id}`,
        description: 'Retrieves a single case by its unique ID.',
        params: [{ name: 'id', type: 'string', desc: 'The unique case identifier (CaseId).' }],
        response: JSON.stringify({ id: "C-2024-001", title: "Martinez v. TechCorp", client: "TechCorp Industries", status: "Discovery" }, null, 2)
      },
      {
        name: 'add',
        http: 'POST',
        path: `${API_PREFIX}/cases`,
        description: 'Creates a new case record.',
        params: [{ name: 'caseData', type: 'Case', desc: 'The full case object.' }],
        response: JSON.stringify({ id: "C-2024-002", title: "New Case", client: "New Client", status: "Pre-Filing" }, null, 2)
      }
    ]
  },
  {
    name: 'documents',
    description: 'Handles document metadata and blob storage.',
    methods: [
      {
        name: 'getAll',
        http: 'GET',
        path: `${API_PREFIX}/documents`,
        description: 'Retrieves metadata for all documents.',
        params: [],
        response: JSON.stringify([
          { id: "doc-1", caseId: "C-2024-001", title: "Complaint.pdf", type: "Pleading", fileSize: "1.2 MB" }
        ], null, 2)
      },
      {
        name: 'getFile',
        http: 'GET',
        path: `${API_PREFIX}/documents/{id}/file`,
        description: 'Retrieves the binary file content for a document.',
        params: [{ name: 'id', type: 'string', desc: 'The unique document identifier.' }],
        response: `(binary data)`
      },
    ]
  },
  {
    name: 'billing',
    description: 'Manages time entries, invoices, and financial data.',
    methods: [
      {
        name: 'getTimeEntries',
        http: 'GET',
        path: `${API_PREFIX}/billing/time`,
        description: 'Retrieves all time entries, optionally filtered by case.',
        params: [{ name: 'caseId', type: 'string (optional)', desc: 'Filter entries by a specific case.' }],
        response: JSON.stringify([
          { id: "t-1", caseId: "C-2024-001", duration: 60, description: "Drafting motion.", total: 450.00 }
        ], null, 2)
      },
      {
        name: 'createInvoice',
        http: 'POST',
        path: `${API_PREFIX}/billing/invoices`,
        description: 'Generates a new invoice from a set of unbilled time entries.',
        params: [{ name: 'timeEntryIds', type: 'string[]', desc: 'Array of time entry IDs to include.' }],
        response: JSON.stringify({ id: "INV-2024-001", client: "TechCorp", amount: 15450.00, status: "Draft" }, null, 2)
      },
    ]
  },
  {
    name: 'discovery',
    description: 'Manages all aspects of the e-discovery lifecycle.',
    methods: [
      {
        name: 'getRequests',
        http: 'GET',
        path: `${API_PREFIX}/discovery/requests`,
        description: 'Retrieves all discovery requests (RFPs, ROGs, RFAs).',
        params: [{ name: 'caseId', type: 'string (optional)', desc: 'Filter by case.' }],
        response: JSON.stringify([
          { id: "DR-001", type: "Production", title: "RFP Set One", status: "Served" }
        ], null, 2)
      },
      {
        name: 'getPrivilegeLog',
        http: 'GET',
        path: `${API_PREFIX}/discovery/privilege-log`,
        description: 'Retrieves the privilege log for a given case.',
        params: [{ name: 'caseId', type: 'string', desc: 'The case identifier.' }],
        response: JSON.stringify([
          { id: "PL-001", basis: "Attorney-Client", desc: "Legal advice re: termination." }
        ], null, 2)
      },
    ]
  }
];
