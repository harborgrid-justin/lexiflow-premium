/**
 * Enterprise API Mocking Infrastructure
 *
 * Provides comprehensive mock implementations for all API endpoints
 * used by the (main) route pages.
 *
 * @module api-mocks
 */

import {
  mockCaseFactory,
  mockClientFactory,
  mockDocumentFactory,
  mockMatterFactory,
  mockUserFactory,
  mockTaskFactory,
  mockInvoiceFactory,
  MockCase,
  MockClient,
  MockDocument,
  MockMatter,
  MockUser,
  MockTask,
  MockInvoice,
} from '../test-utils';

// ============================================================================
// Mock Data Collections
// ============================================================================

/**
 * Pre-generated mock cases for list pages
 */
export const mockCases: MockCase[] = Array.from({ length: 10 }, (_, i) =>
  mockCaseFactory({
    id: `case-${i + 1}`,
    caseNumber: `2024-CV-${(i + 1).toString().padStart(5, '0')}`,
    title: `Test Case ${i + 1}`,
    status: ['active', 'pending', 'closed'][i % 3],
    priority: ['high', 'medium', 'low'][i % 3],
  })
);

/**
 * Pre-generated mock clients for list pages
 */
export const mockClients: MockClient[] = Array.from({ length: 10 }, (_, i) =>
  mockClientFactory({
    id: `client-${i + 1}`,
    name: `Test Client ${i + 1}`,
    email: `client${i + 1}@example.com`,
    status: ['active', 'inactive'][i % 2],
  })
);

/**
 * Pre-generated mock documents for list pages
 */
export const mockDocuments: MockDocument[] = Array.from({ length: 10 }, (_, i) =>
  mockDocumentFactory({
    id: `doc-${i + 1}`,
    name: `Document ${i + 1}.pdf`,
    caseId: `case-${(i % 5) + 1}`,
  })
);

/**
 * Pre-generated mock matters for list pages
 */
export const mockMatters: MockMatter[] = Array.from({ length: 10 }, (_, i) =>
  mockMatterFactory({
    id: `matter-${i + 1}`,
    name: `Test Matter ${i + 1}`,
    status: ['active', 'pending', 'closed'][i % 3],
  })
);

/**
 * Pre-generated mock users for list pages
 */
export const mockUsers: MockUser[] = Array.from({ length: 10 }, (_, i) =>
  mockUserFactory({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    firstName: `User`,
    lastName: `${i + 1}`,
    role: ['attorney', 'paralegal', 'admin'][i % 3],
  })
);

/**
 * Pre-generated mock tasks for list pages
 */
export const mockTasks: MockTask[] = Array.from({ length: 10 }, (_, i) =>
  mockTaskFactory({
    id: `task-${i + 1}`,
    title: `Test Task ${i + 1}`,
    status: ['pending', 'in_progress', 'completed'][i % 3],
    priority: ['high', 'medium', 'low'][i % 3],
  })
);

/**
 * Pre-generated mock invoices for list pages
 */
export const mockInvoices: MockInvoice[] = Array.from({ length: 10 }, (_, i) =>
  mockInvoiceFactory({
    id: `inv-${i + 1}`,
    invoiceNumber: `INV-${(i + 1).toString().padStart(5, '0')}`,
    amount: (i + 1) * 1000,
    status: ['pending', 'paid', 'overdue'][i % 3],
  })
);

// ============================================================================
// Entity-Specific Mock Data
// ============================================================================

export const mockDepositions = Array.from({ length: 5 }, (_, i) => ({
  id: `dep-${i + 1}`,
  title: `Deposition ${i + 1}`,
  witness: `Witness ${i + 1}`,
  date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
  status: ['scheduled', 'completed', 'transcribed'][i % 3],
  caseId: `case-${i + 1}`,
  location: `Conference Room ${i + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockMotions = Array.from({ length: 5 }, (_, i) => ({
  id: `motion-${i + 1}`,
  title: `Motion to ${['Dismiss', 'Compel', 'Suppress', 'Continue', 'Amend'][i]}`,
  type: ['dismiss', 'compel', 'suppress', 'continue', 'amend'][i],
  status: ['draft', 'filed', 'pending', 'granted', 'denied'][i],
  caseId: `case-${i + 1}`,
  filingDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockEvidence = Array.from({ length: 5 }, (_, i) => ({
  id: `ev-${i + 1}`,
  name: `Evidence Item ${i + 1}`,
  type: ['document', 'physical', 'digital', 'testimony', 'expert'][i],
  status: ['collected', 'catalogued', 'admitted', 'excluded', 'pending'][i],
  caseId: `case-${i + 1}`,
  description: `Description for evidence item ${i + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockDiscovery = Array.from({ length: 5 }, (_, i) => ({
  id: `disc-${i + 1}`,
  title: `Discovery Request ${i + 1}`,
  type: ['interrogatory', 'document_request', 'admission', 'deposition_notice'][i % 4],
  status: ['draft', 'served', 'responded', 'overdue'][i % 4],
  caseId: `case-${i + 1}`,
  dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockExpenses = Array.from({ length: 5 }, (_, i) => ({
  id: `exp-${i + 1}`,
  description: `Expense ${i + 1}`,
  amount: (i + 1) * 100,
  category: ['travel', 'filing', 'expert', 'copying', 'service'][i],
  status: ['pending', 'approved', 'reimbursed'][i % 3],
  caseId: `case-${i + 1}`,
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockTimeEntries = Array.from({ length: 5 }, (_, i) => ({
  id: `time-${i + 1}`,
  description: `Time Entry ${i + 1}`,
  hours: (i + 1) * 0.5,
  rate: 350,
  userId: `user-${i + 1}`,
  caseId: `case-${i + 1}`,
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  billable: i % 2 === 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockWitnesses = Array.from({ length: 5 }, (_, i) => ({
  id: `wit-${i + 1}`,
  name: `Witness ${i + 1}`,
  type: ['fact', 'expert', 'character'][i % 3],
  status: ['identified', 'interviewed', 'subpoenaed', 'deposed'][i % 4],
  caseId: `case-${i + 1}`,
  contactInfo: `witness${i + 1}@example.com`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockDocketEntries = Array.from({ length: 5 }, (_, i) => ({
  id: `docket-${i + 1}`,
  title: `Docket Entry ${i + 1}`,
  type: ['filing', 'hearing', 'order', 'notice', 'motion'][i],
  date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
  caseId: `case-${i + 1}`,
  description: `Description for docket entry ${i + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockOrganizations = Array.from({ length: 5 }, (_, i) => ({
  id: `org-${i + 1}`,
  name: `Organization ${i + 1}`,
  type: ['corporation', 'llc', 'partnership', 'nonprofit', 'government'][i],
  status: 'active',
  jurisdiction: ['California', 'New York', 'Texas', 'Florida', 'Illinois'][i],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockParties = Array.from({ length: 5 }, (_, i) => ({
  id: `party-${i + 1}`,
  name: `Party ${i + 1}`,
  type: ['plaintiff', 'defendant', 'third_party', 'intervenor', 'respondent'][i],
  caseId: `case-${i + 1}`,
  represented: i % 2 === 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const mockSettings = {
  firm: {
    name: 'LexiFlow Legal',
    address: '123 Legal Way',
    phone: '+1 (555) 123-4567',
  },
  billing: {
    defaultRate: 350,
    currency: 'USD',
    invoiceDueDays: 30,
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
};

export const mockCompliance = {
  status: 'compliant',
  lastAudit: new Date().toISOString(),
  issues: [],
  upcomingDeadlines: [],
};

export const mockAnalytics = {
  totalCases: 150,
  activeCases: 75,
  closedCases: 65,
  pendingCases: 10,
  revenue: 1250000,
  outstandingInvoices: 125000,
  billableHours: 2500,
};

export const mockIntegrations = Array.from({ length: 5 }, (_, i) => ({
  id: `int-${i + 1}`,
  name: ['PACER', 'Clio', 'DocuSign', 'QuickBooks', 'Dropbox'][i],
  status: ['connected', 'disconnected', 'error'][i % 3],
  lastSync: new Date().toISOString(),
}));

// ============================================================================
// API Response Mocks by Endpoint Pattern
// ============================================================================

/**
 * Comprehensive mock data map for API endpoints
 */
export const apiMockDataMap: Record<string, unknown> = {
  // Cases
  '/cases': mockCases,
  '/cases/': mockCases[0],

  // Clients
  '/clients': mockClients,
  '/clients/': mockClients[0],

  // Documents
  '/documents': mockDocuments,
  '/documents/': mockDocuments[0],

  // Matters
  '/matters': mockMatters,
  '/matters/': mockMatters[0],

  // Users
  '/users': mockUsers,
  '/users/': mockUsers[0],

  // Tasks
  '/tasks': mockTasks,
  '/tasks/': mockTasks[0],

  // Invoices
  '/billing/invoices': mockInvoices,
  '/billing/invoices/': mockInvoices[0],

  // Depositions
  '/depositions': mockDepositions,
  '/depositions/': mockDepositions[0],

  // Motions
  '/motions': mockMotions,
  '/motions/': mockMotions[0],

  // Evidence
  '/evidence': mockEvidence,
  '/evidence/': mockEvidence[0],

  // Discovery
  '/discovery': mockDiscovery,
  '/discovery/': mockDiscovery[0],

  // Expenses
  '/billing/expenses': mockExpenses,
  '/billing/expenses/': mockExpenses[0],

  // Time Entries
  '/billing/time-entries': mockTimeEntries,
  '/billing/time-entries/': mockTimeEntries[0],

  // Witnesses
  '/witnesses': mockWitnesses,
  '/witnesses/': mockWitnesses[0],

  // Docket
  '/docket': mockDocketEntries,
  '/docket/': mockDocketEntries[0],

  // Organizations
  '/organizations': mockOrganizations,
  '/organizations/': mockOrganizations[0],

  // Parties
  '/parties': mockParties,
  '/parties/': mockParties[0],

  // Settings
  '/settings': mockSettings,
  '/system-settings': mockSettings,

  // Compliance
  '/compliance': mockCompliance,

  // Analytics
  '/analytics': mockAnalytics,
  '/dashboard': mockAnalytics,

  // Integrations
  '/integrations': mockIntegrations,
  '/integrations/': mockIntegrations[0],
};

/**
 * Mock implementation for apiFetch that uses the data map
 */
export const mockApiFetch = jest.fn().mockImplementation(async <T>(endpoint: string): Promise<T> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 5));

  // Check for ID-based endpoints (e.g., /cases/123)
  const idMatch = endpoint.match(/\/([^/]+)\/([^/?]+)$/);
  if (idMatch) {
    const [, resource, id] = idMatch;
    const listKey = `/${resource}`;
    const list = apiMockDataMap[listKey];
    if (Array.isArray(list)) {
      const item = list.find((item: { id: string }) => item.id === id || item.id.endsWith(id));
      if (item) return item as T;
    }
    // Return first item from detail endpoint mock
    const detailKey = `/${resource}/`;
    if (apiMockDataMap[detailKey]) {
      return apiMockDataMap[detailKey] as T;
    }
  }

  // Check for exact match
  if (apiMockDataMap[endpoint]) {
    return apiMockDataMap[endpoint] as T;
  }

  // Check for prefix match
  for (const [pattern, data] of Object.entries(apiMockDataMap)) {
    if (endpoint.startsWith(pattern)) {
      return data as T;
    }
  }

  // Return empty array/object as fallback
  return (endpoint.includes('?') || !endpoint.endsWith('/') ? [] : {}) as T;
});

/**
 * Mock fetch implementation for global fetch calls
 */
export const mockGlobalFetch = jest.fn().mockImplementation(async (url: string, options?: RequestInit) => {
  await new Promise((resolve) => setTimeout(resolve, 5));

  // Extract endpoint from URL
  const endpoint = url.replace(/^https?:\/\/[^/]+\/api/, '');

  // Handle HEAD requests (used for API health checks)
  if (options?.method === 'HEAD') {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
    };
  }

  // Get mock data
  let data: unknown = [];
  for (const [pattern, mockData] of Object.entries(apiMockDataMap)) {
    if (endpoint.includes(pattern)) {
      data = mockData;
      break;
    }
  }

  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
});

// ============================================================================
// Error Response Mocks
// ============================================================================

export const createErrorResponse = (status: number, message: string) => ({
  ok: false,
  status,
  statusText: message,
  json: async () => ({ error: message, status }),
  text: async () => message,
});

export const mock404Response = createErrorResponse(404, 'Not Found');
export const mock500Response = createErrorResponse(500, 'Internal Server Error');
export const mock401Response = createErrorResponse(401, 'Unauthorized');
export const mock403Response = createErrorResponse(403, 'Forbidden');

/**
 * Creates a mock fetch that returns an error for specific endpoints
 */
export const createErrorMockFetch = (errorEndpoints: Record<string, number>) => {
  return jest.fn().mockImplementation(async (url: string) => {
    for (const [endpoint, status] of Object.entries(errorEndpoints)) {
      if (url.includes(endpoint)) {
        return createErrorResponse(status, `Error ${status}`);
      }
    }
    return mockGlobalFetch(url);
  });
};
