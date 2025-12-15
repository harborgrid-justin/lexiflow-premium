/**
 * Discovery Domain API Services
 * Complete coverage for all discovery-related endpoints
 */

import { apiClient, type PaginatedResponse } from './apiClient';

// ==================== LEGAL HOLDS ====================
export interface LegalHold {
  id: string;
  caseId: string;
  name: string;
  status: 'Active' | 'Released' | 'Expired';
  reason: string;
  issueDate: string;
  releaseDate?: string;
  custodians: string[];
  scope: string;
  instructions: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export class LegalHoldsApiService {
  async getAll(filters?: { caseId?: string; status?: string; page?: number; limit?: number }): Promise<LegalHold[]> {
    const response = await apiClient.get<PaginatedResponse<LegalHold>>('/discovery/legal-holds', filters);
    return response.data;
  }

  async getById(id: string): Promise<LegalHold> {
    return apiClient.get<LegalHold>(`/discovery/legal-holds/${id}`);
  }

  async create(hold: Omit<LegalHold, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalHold> {
    return apiClient.post<LegalHold>('/discovery/legal-holds', hold);
  }

  async update(id: string, hold: Partial<LegalHold>): Promise<LegalHold> {
    return apiClient.put<LegalHold>(`/discovery/legal-holds/${id}`, hold);
  }

  async release(id: string, releaseDate: string, reason: string): Promise<LegalHold> {
    return apiClient.post<LegalHold>(`/discovery/legal-holds/${id}/release`, { releaseDate, reason });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/legal-holds/${id}`);
  }
}

// ==================== DEPOSITIONS ====================
export interface Deposition {
  id: string;
  caseId: string;
  witness: string;
  type: 'Plaintiff' | 'Defendant' | 'Expert' | 'Fact Witness';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledDate?: string;
  location?: string;
  courtReporter?: string;
  videographer?: string;
  attorneys: string[];
  exhibits: string[];
  transcript?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class DepositionsApiService {
  async getAll(filters?: { caseId?: string; status?: string; type?: string }): Promise<Deposition[]> {
    const response = await apiClient.get<PaginatedResponse<Deposition>>('/discovery/depositions', filters);
    return response.data;
  }

  async getById(id: string): Promise<Deposition> {
    return apiClient.get<Deposition>(`/discovery/depositions/${id}`);
  }

  async create(deposition: Omit<Deposition, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deposition> {
    return apiClient.post<Deposition>('/discovery/depositions', deposition);
  }

  async update(id: string, deposition: Partial<Deposition>): Promise<Deposition> {
    return apiClient.put<Deposition>(`/discovery/depositions/${id}`, deposition);
  }

  async schedule(id: string, date: string, location: string): Promise<Deposition> {
    return apiClient.post<Deposition>(`/discovery/depositions/${id}/schedule`, { date, location });
  }

  async complete(id: string, transcriptUrl?: string): Promise<Deposition> {
    return apiClient.post<Deposition>(`/discovery/depositions/${id}/complete`, { transcriptUrl });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/depositions/${id}`);
  }
}

// ==================== DISCOVERY REQUESTS ====================
export interface DiscoveryRequest {
  id: string;
  caseId: string;
  title: string;
  type: 'Interrogatories' | 'Request for Production' | 'Request for Admission' | 'Subpoena';
  status: 'Draft' | 'Served' | 'Responded' | 'Overdue';
  requestDate?: string;
  dueDate?: string;
  responseDate?: string;
  fromParty: string;
  toParty: string;
  items: Array<{ number: number; text: string; response?: string }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class DiscoveryRequestsApiService {
  async getAll(filters?: { caseId?: string; status?: string; type?: string }): Promise<DiscoveryRequest[]> {
    const response = await apiClient.get<PaginatedResponse<DiscoveryRequest>>('/discovery/requests', filters);
    return response.data;
  }

  async getById(id: string): Promise<DiscoveryRequest> {
    return apiClient.get<DiscoveryRequest>(`/discovery/requests/${id}`);
  }

  async create(request: Omit<DiscoveryRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiscoveryRequest> {
    return apiClient.post<DiscoveryRequest>('/discovery/requests', request);
  }

  async update(id: string, request: Partial<DiscoveryRequest>): Promise<DiscoveryRequest> {
    return apiClient.put<DiscoveryRequest>(`/discovery/requests/${id}`, request);
  }

  async serve(id: string, serveDate: string): Promise<DiscoveryRequest> {
    return apiClient.post<DiscoveryRequest>(`/discovery/requests/${id}/serve`, { serveDate });
  }

  async respond(id: string, responses: Array<{ number: number; response: string }>): Promise<DiscoveryRequest> {
    return apiClient.post<DiscoveryRequest>(`/discovery/requests/${id}/respond`, { responses });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/requests/${id}`);
  }
}

// ==================== ESI SOURCES ====================
export interface ESISource {
  id: string;
  caseId: string;
  custodianId: string;
  name: string;
  type: 'Email' | 'File Share' | 'Database' | 'Cloud Storage' | 'Mobile Device' | 'Social Media';
  status: 'Identified' | 'Collecting' | 'Collected' | 'Processing';
  location: string;
  dateRange?: { start: string; end: string };
  volumeEstimate?: string;
  collectionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class ESISourcesApiService {
  async getAll(filters?: { caseId?: string; custodianId?: string; status?: string }): Promise<ESISource[]> {
    const response = await apiClient.get<PaginatedResponse<ESISource>>('/discovery/esi-sources', filters);
    return response.data;
  }

  async getById(id: string): Promise<ESISource> {
    return apiClient.get<ESISource>(`/discovery/esi-sources/${id}`);
  }

  async create(source: Omit<ESISource, 'id' | 'createdAt' | 'updatedAt'>): Promise<ESISource> {
    return apiClient.post<ESISource>('/discovery/esi-sources', source);
  }

  async update(id: string, source: Partial<ESISource>): Promise<ESISource> {
    return apiClient.put<ESISource>(`/discovery/esi-sources/${id}`, source);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/esi-sources/${id}`);
  }
}

// ==================== PRIVILEGE LOG ====================
export interface PrivilegeLogEntry {
  id: string;
  caseId: string;
  documentId?: string;
  entryNumber: number;
  date: string;
  author: string;
  recipient: string;
  ccRecipients?: string[];
  description: string;
  privilege: 'Attorney-Client' | 'Work Product' | 'Confidential' | 'Other';
  basisForClaim: string;
  withheld: boolean;
  createdAt: string;
  updatedAt: string;
}

export class PrivilegeLogApiService {
  async getAll(filters?: { caseId?: string; privilege?: string }): Promise<PrivilegeLogEntry[]> {
    const response = await apiClient.get<PaginatedResponse<PrivilegeLogEntry>>('/discovery/privilege-log', filters);
    return response.data;
  }

  async getById(id: string): Promise<PrivilegeLogEntry> {
    return apiClient.get<PrivilegeLogEntry>(`/discovery/privilege-log/${id}`);
  }

  async create(entry: Omit<PrivilegeLogEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PrivilegeLogEntry> {
    return apiClient.post<PrivilegeLogEntry>('/discovery/privilege-log', entry);
  }

  async update(id: string, entry: Partial<PrivilegeLogEntry>): Promise<PrivilegeLogEntry> {
    return apiClient.put<PrivilegeLogEntry>(`/discovery/privilege-log/${id}`, entry);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/privilege-log/${id}`);
  }
}

// ==================== PRODUCTIONS ====================
export interface Production {
  id: string;
  caseId: string;
  name: string;
  type: 'Initial' | 'Supplemental' | 'Privilege Log' | 'Amendment';
  status: 'Preparing' | 'Ready' | 'Produced' | 'Received';
  producedBy: string;
  producedTo: string;
  productionDate?: string;
  documentCount: number;
  format: 'Native' | 'TIFF' | 'PDF' | 'Paper';
  mediaType?: string;
  batesRange?: { start: string; end: string };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class ProductionsApiService {
  async getAll(filters?: { caseId?: string; status?: string }): Promise<Production[]> {
    const response = await apiClient.get<PaginatedResponse<Production>>('/discovery/productions', filters);
    return response.data;
  }

  async getById(id: string): Promise<Production> {
    return apiClient.get<Production>(`/discovery/productions/${id}`);
  }

  async create(production: Omit<Production, 'id' | 'createdAt' | 'updatedAt'>): Promise<Production> {
    return apiClient.post<Production>('/discovery/productions', production);
  }

  async update(id: string, production: Partial<Production>): Promise<Production> {
    return apiClient.put<Production>(`/discovery/productions/${id}`, production);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/productions/${id}`);
  }
}

// ==================== CUSTODIAN INTERVIEWS ====================
export interface CustodianInterview {
  id: string;
  caseId: string;
  custodianId: string;
  interviewDate: string;
  interviewer: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  location?: string;
  topics: string[];
  findings?: string;
  documentIds?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class CustodianInterviewsApiService {
  async getAll(filters?: { caseId?: string; custodianId?: string; status?: string }): Promise<CustodianInterview[]> {
    const response = await apiClient.get<PaginatedResponse<CustodianInterview>>('/discovery/interviews', filters);
    return response.data;
  }

  async getById(id: string): Promise<CustodianInterview> {
    return apiClient.get<CustodianInterview>(`/discovery/interviews/${id}`);
  }

  async create(interview: Omit<CustodianInterview, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustodianInterview> {
    return apiClient.post<CustodianInterview>('/discovery/interviews', interview);
  }

  async update(id: string, interview: Partial<CustodianInterview>): Promise<CustodianInterview> {
    return apiClient.put<CustodianInterview>(`/discovery/interviews/${id}`, interview);
  }

  async complete(id: string, findings: string): Promise<CustodianInterview> {
    return apiClient.post<CustodianInterview>(`/discovery/interviews/${id}/complete`, { findings });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/interviews/${id}`);
  }
}

// ==================== EXPORT INSTANCES ====================
export const discoveryApiServices = {
  legalHolds: new LegalHoldsApiService(),
  depositions: new DepositionsApiService(),
  discoveryRequests: new DiscoveryRequestsApiService(),
  esiSources: new ESISourcesApiService(),
  privilegeLog: new PrivilegeLogApiService(),
  productions: new ProductionsApiService(),
  custodianInterviews: new CustodianInterviewsApiService(),
};
