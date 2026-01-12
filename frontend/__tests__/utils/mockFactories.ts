/**
 * Mock Data Factories
 * Centralized factory functions for generating consistent test data
 */

import type {
  Case,
  DocketEntry,
  Document,
  Evidence,
  User,
} from "../../src/types";

// Base factory helpers
export const createId = (prefix: string = "test") =>
  `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// User factories
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: createId("user"),
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  role: "associate",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Case factories
export const createMockCase = (overrides?: Partial<Case>): Case => ({
  id: createId("case"),
  caseNumber: "CASE-2025-001",
  title: "Test Case v. Defendant",
  status: "Active",
  type: "Civil",
  priority: "Medium",
  jurisdiction: "Federal",
  court: "District Court",
  plaintiffs: ["Test Plaintiff"],
  defendants: ["Test Defendant"],
  assignedTo: ["user-1"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
  ...overrides,
});

// Docket entry factories
export const createMockDocketEntry = (
  overrides?: Partial<DocketEntry>
): DocketEntry => ({
  id: createId("docket"),
  caseId: createId("case"),
  entryNumber: 1,
  filedDate: new Date().toISOString(),
  description: "Test Docket Entry",
  documentTitle: "Test Document",
  party: "Plaintiff",
  type: "Motion",
  status: "Filed",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
  ...overrides,
});

// Evidence factories
export const createMockEvidence = (
  overrides?: Partial<Evidence>
): Evidence => ({
  id: createId("evidence"),
  caseId: createId("case"),
  evidenceNumber: "EV-2025-001",
  title: "Test Evidence",
  type: "Document",
  status: "Collected",
  description: "Test evidence description",
  collectedDate: new Date().toISOString(),
  collectedBy: "user-1",
  location: "Evidence Room A",
  chainOfCustody: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
  ...overrides,
});

// Document factories
export const createMockDocument = (
  overrides?: Partial<Document>
): Document => ({
  id: createId("doc"),
  title: "Test Document",
  type: "PDF",
  size: 1024,
  url: "/test/document.pdf",
  caseId: createId("case"),
  uploadedBy: "user-1",
  uploadedAt: new Date().toISOString(),
  status: "Processed",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
  ...overrides,
});

// Collection factories for lists
export const createMockCases = (count: number = 5): Case[] =>
  Array.from({ length: count }, (_, i) =>
    createMockCase({
      id: `case-${i + 1}`,
      caseNumber: `CASE-2025-${String(i + 1).padStart(3, "0")}`,
      title: `Test Case ${i + 1} v. Defendant`,
    })
  );

export const createMockDocketEntries = (
  caseId: string,
  count: number = 5
): DocketEntry[] =>
  Array.from({ length: count }, (_, i) =>
    createMockDocketEntry({
      id: `docket-${i + 1}`,
      caseId,
      entryNumber: i + 1,
      description: `Docket Entry ${i + 1}`,
    })
  );

export const createMockEvidenceList = (
  caseId: string,
  count: number = 5
): Evidence[] =>
  Array.from({ length: count }, (_, i) =>
    createMockEvidence({
      id: `evidence-${i + 1}`,
      caseId,
      evidenceNumber: `EV-2025-${String(i + 1).padStart(3, "0")}`,
      title: `Evidence Item ${i + 1}`,
    })
  );

export const createMockUsers = (count: number = 5): User[] =>
  Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
    })
  );

// Special case factories
export const createMockCaseWithRelations = () => {
  const mockCase = createMockCase();
  const docketEntries = createMockDocketEntries(mockCase.id, 3);
  const evidence = createMockEvidenceList(mockCase.id, 3);

  return {
    case: mockCase,
    docketEntries,
    evidence,
  };
};

// API response factories
export const createSuccessResponse = <T>(data: T) => ({
  success: true,
  data,
  message: "Success",
});

export const createErrorResponse = (message: string = "Error occurred") => ({
  success: false,
  error: message,
  message,
});

export const createPaginatedResponse = <T>(
  items: T[],
  page: number = 1,
  perPage: number = 10
) => ({
  data: items,
  pagination: {
    page,
    perPage,
    total: items.length,
    totalPages: Math.ceil(items.length / perPage),
  },
});
