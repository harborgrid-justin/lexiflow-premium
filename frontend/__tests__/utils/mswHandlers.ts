/**
 * MSW (Mock Service Worker) Handlers
 * HTTP request mocking for integration tests
 */

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  createErrorResponse,
  createMockCase,
  createMockCases,
  createMockDocketEntries,
  createMockEvidenceList,
  createMockUsers,
  createSuccessResponse,
} from "./mockFactories";

const API_BASE = process.env.VITE_API_URL || "http://localhost:3001";

// Cases handlers
const casesHandlers = [
  http.get(`${API_BASE}/api/cases`, () => {
    return HttpResponse.json(createSuccessResponse(createMockCases(10)));
  }),

  http.get(`${API_BASE}/api/cases/:id`, ({ params }) => {
    const mockCase = createMockCase({ id: params.id as string });
    return HttpResponse.json(createSuccessResponse(mockCase));
  }),

  http.post(`${API_BASE}/api/cases`, async ({ request }) => {
    const body = await request.json();
    const newCase = createMockCase(body as Record<string, unknown>);
    return HttpResponse.json(createSuccessResponse(newCase), { status: 201 });
  }),

  http.put(`${API_BASE}/api/cases/:id`, async ({ request, params }) => {
    const body = await request.json();
    const updatedCase = createMockCase({
      id: params.id as string,
      ...(body as Record<string, unknown>),
    });
    return HttpResponse.json(createSuccessResponse(updatedCase));
  }),

  http.delete(`${API_BASE}/api/cases/:id`, ({ params }) => {
    return HttpResponse.json(createSuccessResponse({ id: params.id }));
  }),
];

// Docket handlers
const docketHandlers = [
  http.get(`${API_BASE}/api/docket`, ({ request }) => {
    const url = new URL(request.url);
    const caseId = url.searchParams.get("caseId");
    const entries = caseId
      ? createMockDocketEntries(caseId, 5)
      : createMockDocketEntries("case-1", 5);
    return HttpResponse.json(createSuccessResponse(entries));
  }),

  http.get(`${API_BASE}/api/docket/:id`, ({ params }) => {
    const entry = createMockDocketEntries("case-1", 1)[0];
    entry.id = params.id as string;
    return HttpResponse.json(createSuccessResponse(entry));
  }),

  http.post(`${API_BASE}/api/docket`, async ({ request }) => {
    const body = await request.json();
    const newEntry = createMockDocketEntries("case-1", 1)[0];
    Object.assign(newEntry, body);
    return HttpResponse.json(createSuccessResponse(newEntry), { status: 201 });
  }),
];

// Evidence handlers
const evidenceHandlers = [
  http.get(`${API_BASE}/api/evidence`, ({ request }) => {
    const url = new URL(request.url);
    const caseId = url.searchParams.get("caseId");
    const evidence = caseId
      ? createMockEvidenceList(caseId, 5)
      : createMockEvidenceList("case-1", 5);
    return HttpResponse.json(createSuccessResponse(evidence));
  }),

  http.get(`${API_BASE}/api/evidence/:id`, ({ params }) => {
    const evidence = createMockEvidenceList("case-1", 1)[0];
    evidence.id = params.id as string;
    return HttpResponse.json(createSuccessResponse(evidence));
  }),

  http.post(`${API_BASE}/api/evidence`, async ({ request }) => {
    const body = await request.json();
    const newEvidence = createMockEvidenceList("case-1", 1)[0];
    Object.assign(newEvidence, body);
    return HttpResponse.json(createSuccessResponse(newEvidence), {
      status: 201,
    });
  }),
];

// Users handlers
const usersHandlers = [
  http.get(`${API_BASE}/api/users`, () => {
    return HttpResponse.json(createSuccessResponse(createMockUsers(5)));
  }),

  http.get(`${API_BASE}/api/users/me`, () => {
    return HttpResponse.json(createSuccessResponse(createMockUsers(1)[0]));
  }),

  http.get(`${API_BASE}/api/users/:id`, ({ params }) => {
    const user = createMockUsers(1)[0];
    user.id = params.id as string;
    return HttpResponse.json(createSuccessResponse(user));
  }),
];

// Documents handlers
const documentsHandlers = [
  http.get(`${API_BASE}/api/documents`, () => {
    return HttpResponse.json(createSuccessResponse([]));
  }),

  http.post(`${API_BASE}/api/documents/upload`, async () => {
    return HttpResponse.json(
      createSuccessResponse({
        id: "doc-1",
        url: "/uploads/test.pdf",
      }),
      { status: 201 }
    );
  }),
];

// Error simulation handlers (for testing error states)
export const errorHandlers = [
  http.get(`${API_BASE}/api/cases/error`, () => {
    return HttpResponse.json(createErrorResponse("Simulated error"), {
      status: 500,
    });
  }),

  http.get(`${API_BASE}/api/cases/not-found`, () => {
    return HttpResponse.json(createErrorResponse("Not found"), { status: 404 });
  }),

  http.post(`${API_BASE}/api/cases/validation-error`, () => {
    return HttpResponse.json(createErrorResponse("Validation failed"), {
      status: 400,
    });
  }),
];

// Combine all handlers
export const handlers = [
  ...casesHandlers,
  ...docketHandlers,
  ...evidenceHandlers,
  ...usersHandlers,
  ...documentsHandlers,
];

// Setup MSW server
export const server = setupServer(...handlers);

// Server lifecycle helpers
export const startServer = () => server.listen({ onUnhandledRequest: "warn" });
export const stopServer = () => server.close();
export const resetServerHandlers = () => server.resetHandlers();

// Helper to add custom handlers for specific tests
export const addHandler = (
  ...customHandlers: Parameters<typeof http.get>[]
) => {
  server.use(...customHandlers);
};
