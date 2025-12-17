/**
 * Final Backend API Services - Remaining 13 Services
 * Completes 100% backend integration coverage
 */

import { apiClient, type PaginatedResponse } from './apiClient';
import { 
  WorkflowTask, Risk, Client, Citation, TrialExhibit,
  CalendarEventItem, Conversation, Message, WarRoomData,
  WikiArticle, WorkflowTemplateData
} from '../types';

// ==================== TASKS ====================
export interface TaskDto {
  title: string;
  description?: string;
  caseId: string;
  assignedTo?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Blocked';
  dueDate?: string;
  tags?: string[];
  dependencies?: string[];
}

export class TasksApiService {
  async getAll(filters?: { caseId?: string; assignedTo?: string; status?: string }): Promise<WorkflowTask[]> {
    const response = await apiClient.get<PaginatedResponse<WorkflowTask>>('/tasks', filters);
    return response.data;
  }

  async getByCaseId(caseId: string): Promise<WorkflowTask[]> {
    const response = await apiClient.get<PaginatedResponse<WorkflowTask>>('/tasks', { caseId });
    return response.data;
  }

  async countByCaseId(caseId: string): Promise<number> {
    const tasks = await this.getByCaseId(caseId);
    return tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed').length;
  }

  async getById(id: string): Promise<WorkflowTask> {
    return apiClient.get<WorkflowTask>(`/tasks/${id}`);
  }

  async create(task: TaskDto): Promise<WorkflowTask> {
    return apiClient.post<WorkflowTask>('/tasks', task);
  }

  async update(id: string, task: Partial<TaskDto>): Promise<WorkflowTask> {
    return apiClient.put<WorkflowTask>(`/tasks/${id}`, task);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }

  async bulkUpdate(updates: { id: string; updates: Partial<TaskDto> }[]): Promise<WorkflowTask[]> {
    return apiClient.post<WorkflowTask[]>('/tasks/bulk-update', { updates });
  }
}

// ==================== RISKS ====================
export interface RiskDto {
  caseId: string;
  title: string;
  description: string;
  category: string;
  impact: 'Low' | 'Medium' | 'High';
  probability: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Monitoring' | 'Mitigated' | 'Closed';
  owner?: string;
  mitigation?: string;
  dueDate?: string;
}

export class RisksApiService {
  async getAll(filters?: { caseId?: string; status?: string; impact?: string }): Promise<Risk[]> {
    const response = await apiClient.get<PaginatedResponse<Risk>>('/risks', filters);
    return response.data;
  }

  async getByCaseId(caseId: string): Promise<Risk[]> {
    const response = await apiClient.get<PaginatedResponse<Risk>>('/risks', { caseId });
    return response.data;
  }

  async getById(id: string): Promise<Risk> {
    return apiClient.get<Risk>(`/risks/${id}`);
  }

  async create(risk: RiskDto): Promise<Risk> {
    return apiClient.post<Risk>('/risks', risk);
  }

  async update(id: string, risk: Partial<RiskDto>): Promise<Risk> {
    return apiClient.put<Risk>(`/risks/${id}`, risk);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/risks/${id}`);
  }

  async getHeatmap(caseId?: string): Promise<{ impact: string; probability: string; count: number }[]> {
    return apiClient.get(`/risks/heatmap`, caseId ? { caseId } : undefined);
  }
}

// ==================== HR ====================
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  hireDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  salary?: number;
  skills?: string[];
  certifications?: string[];
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Bereavement';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Denied';
  reason?: string;
}

export class HRApiService {
  async getAllEmployees(filters?: { department?: string; status?: string }): Promise<Employee[]> {
    const response = await apiClient.get<PaginatedResponse<Employee>>('/hr/employees', filters);
    return response.data;
  }

  async getEmployee(id: string): Promise<Employee> {
    return apiClient.get<Employee>(`/hr/employees/${id}`);
  }

  async getUtilizationMetrics(): Promise<{ name: string; role: string; utilization: number; cases: number }[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/hr/utilization');
    return response.data;
  }

  async getStaff(): Promise<any[]> {
    return this.getAllEmployees();
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    return apiClient.post<Employee>('/hr/employees', employee);
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    return apiClient.put<Employee>(`/hr/employees/${id}`, employee);
  }

  async deleteEmployee(id: string): Promise<void> {
    await apiClient.delete(`/hr/employees/${id}`);
  }

  async addStaff(staff: any): Promise<any> {
    return this.createEmployee(staff);
  }

  async updateStaff(id: string, updates: any): Promise<any> {
    return this.updateEmployee(id, updates);
  }

  async deleteStaff(id: string): Promise<void> {
    return this.deleteEmployee(id);
  }

  async getTimeOffRequests(filters?: { employeeId?: string; status?: string }): Promise<TimeOffRequest[]> {
    const response = await apiClient.get<PaginatedResponse<TimeOffRequest>>('/hr/time-off', filters);
    return response.data;
  }

  async createTimeOffRequest(request: Omit<TimeOffRequest, 'id'>): Promise<TimeOffRequest> {
    return apiClient.post<TimeOffRequest>('/hr/time-off', request);
  }

  async approveTimeOff(id: string): Promise<TimeOffRequest> {
    return apiClient.post<TimeOffRequest>(`/hr/time-off/${id}/approve`, {});
  }

  async denyTimeOff(id: string, reason?: string): Promise<TimeOffRequest> {
    return apiClient.post<TimeOffRequest>(`/hr/time-off/${id}/deny`, { reason });
  }
}

// ==================== WORKFLOW TEMPLATES ====================
export interface WorkflowTemplateDto {
  name: string;
  description?: string;
  category: string;
  stages: {
    name: string;
    order: number;
    tasks: {
      title: string;
      description?: string;
      estimatedDuration?: number;
      assigneeRole?: string;
    }[];
  }[];
  tags?: string[];
}

export class WorkflowTemplatesApiService {
  async getAll(filters?: { category?: string }): Promise<WorkflowTemplateData[]> {
    const response = await apiClient.get<PaginatedResponse<WorkflowTemplateData>>('/workflow/templates', filters);
    return response.data;
  }

  async getById(id: string): Promise<WorkflowTemplateData> {
    return apiClient.get<WorkflowTemplateData>(`/workflow/templates/${id}`);
  }

  async create(template: WorkflowTemplateDto): Promise<WorkflowTemplateData> {
    return apiClient.post<WorkflowTemplateData>('/workflow/templates', template);
  }

  async update(id: string, template: Partial<WorkflowTemplateDto>): Promise<WorkflowTemplateData> {
    return apiClient.put<WorkflowTemplateData>(`/workflow/templates/${id}`, template);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workflow/templates/${id}`);
  }

  async instantiate(id: string, caseId: string): Promise<{ tasks: WorkflowTask[] }> {
    return apiClient.post(`/workflow/templates/${id}/instantiate`, { caseId });
  }
}

// ==================== TRIAL MANAGEMENT ====================
export interface TrialEvent {
  id: string;
  caseId: string;
  type: 'Motion Hearing' | 'Trial Day' | 'Jury Selection' | 'Witness Testimony' | 'Closing Arguments';
  date: string;
  duration?: number;
  location?: string;
  notes?: string;
  participants?: string[];
}

export interface WitnessPrep {
  id: string;
  caseId: string;
  witnessName: string;
  prepDate: string;
  attorney: string;
  topics: string[];
  notes: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export class TrialApiService {
  async getTrialEvents(caseId: string): Promise<TrialEvent[]> {
    const response = await apiClient.get<PaginatedResponse<TrialEvent>>('/trial/events', { caseId });
    return response.data;
  }

  async createTrialEvent(event: Omit<TrialEvent, 'id'>): Promise<TrialEvent> {
    return apiClient.post<TrialEvent>('/trial/events', event);
  }

  async updateTrialEvent(id: string, event: Partial<TrialEvent>): Promise<TrialEvent> {
    return apiClient.put<TrialEvent>(`/trial/events/${id}`, event);
  }

  async deleteTrialEvent(id: string): Promise<void> {
    await apiClient.delete(`/trial/events/${id}`);
  }

  async getWitnessPrep(caseId: string): Promise<WitnessPrep[]> {
    const response = await apiClient.get<PaginatedResponse<WitnessPrep>>('/trial/witness-prep', { caseId });
    return response.data;
  }

  async createWitnessPrep(prep: Omit<WitnessPrep, 'id'>): Promise<WitnessPrep> {
    return apiClient.post<WitnessPrep>('/trial/witness-prep', prep);
  }
}

// ==================== EXHIBITS ====================
export interface ExhibitDto {
  caseId: string;
  exhibitNumber: string;
  description: string;
  type: 'Document' | 'Physical' | 'Video' | 'Audio' | 'Photo';
  documentId?: string;
  status: 'Draft' | 'Marked' | 'Admitted' | 'Rejected';
  admissionDate?: string;
  notes?: string;
}

export class ExhibitsApiService {
  async getAll(filters?: { caseId?: string; status?: string }): Promise<TrialExhibit[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<TrialExhibit>>('/exhibits', filters);
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      console.warn('[ExhibitsApiService] Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('[ExhibitsApiService] Error fetching exhibits:', error);
      return []; // Return empty array on error
    }
  }

  async getByCaseId(caseId: string): Promise<TrialExhibit[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<TrialExhibit>>('/exhibits', { caseId });
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      }
      console.warn('[ExhibitsApiService] Unexpected response format for case:', response);
      return [];
    } catch (error) {
      console.error('[ExhibitsApiService] Error fetching exhibits by case:', error);
      return []; // Return empty array on error
    }
  }

  async getById(id: string): Promise<TrialExhibit> {
    return apiClient.get<TrialExhibit>(`/exhibits/${id}`);
  }

  async create(exhibit: ExhibitDto): Promise<TrialExhibit> {
    return apiClient.post<TrialExhibit>('/exhibits', exhibit);
  }

  // Alias for Repository pattern compatibility
  async add(exhibit: Partial<TrialExhibit>): Promise<TrialExhibit> {
    return this.create(exhibit as ExhibitDto);
  }

  async update(id: string, exhibit: Partial<ExhibitDto>): Promise<TrialExhibit> {
    return apiClient.put<TrialExhibit>(`/exhibits/${id}`, exhibit);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/exhibits/${id}`);
  }

  async markAdmitted(id: string, date: string): Promise<TrialExhibit> {
    return apiClient.post<TrialExhibit>(`/exhibits/${id}/admit`, { date });
  }
}

// ==================== CLIENTS ====================
export interface ClientDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'Individual' | 'Corporation' | 'Government' | 'Non-Profit';
  status: 'Active' | 'Inactive' | 'Prospect';
  intakeDate?: string;
  notes?: string;
  contacts?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
  }[];
}

export class ClientsApiService {
  async getAll(filters?: { status?: string; type?: string }): Promise<Client[]> {
    const response = await apiClient.get<PaginatedResponse<Client>>('/clients', filters);
    return response.data;
  }

  async getById(id: string): Promise<Client> {
    return apiClient.get<Client>(`/clients/${id}`);
  }

  async create(client: ClientDto): Promise<Client> {
    return apiClient.post<Client>('/clients', client);
  }

  async update(id: string, client: Partial<ClientDto>): Promise<Client> {
    return apiClient.put<Client>(`/clients/${id}`, client);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }

  async generatePortalToken(id: string): Promise<{ token: string; expiresAt: string }> {
    return apiClient.post(`/clients/${id}/portal-token`, {});
  }

  async getCases(id: string): Promise<any[]> {
    return apiClient.get(`/clients/${id}/cases`);
  }
}

// ==================== CITATIONS ====================
export interface CitationDto {
  caseId?: string;
  citation: string;
  court: string;
  year: number;
  title: string;
  url?: string;
  status?: 'Valid' | 'Superseded' | 'Overruled' | 'Questioned';
  notes?: string;
}

export class CitationsApiService {
  async getAll(filters?: { caseId?: string; status?: string }): Promise<Citation[]> {
    const response = await apiClient.get<PaginatedResponse<Citation>>('/citations', filters);
    return response.data;
  }

  async getById(id: string): Promise<Citation> {
    return apiClient.get<Citation>(`/citations/${id}`);
  }

  async create(citation: CitationDto): Promise<Citation> {
    return apiClient.post<Citation>('/citations', citation);
  }

  async quickAdd(citation: CitationDto): Promise<Citation> {
    return this.create(citation);
  }

  async update(id: string, citation: Partial<CitationDto>): Promise<Citation> {
    return apiClient.put<Citation>(`/citations/${id}`, citation);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/citations/${id}`);
  }

  async verifyAll(): Promise<{ checked: number; flagged: number; updated: Citation[] }> {
    return apiClient.post('/citations/verify-all', {});
  }

  async checkShepards(id: string): Promise<{ status: string; history: any[] }> {
    return apiClient.get(`/citations/${id}/shepards`);
  }
}

// ==================== CALENDAR ====================
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'hearing' | 'deadline' | 'meeting' | 'task';
  caseId?: string;
  location?: string;
  attendees?: string[];
  notes?: string;
  reminderMinutes?: number;
}

export class CalendarApiService {
  async getEvents(filters?: { startDate?: string; endDate?: string; caseId?: string }): Promise<CalendarEventItem[]> {
    const response = await apiClient.get<PaginatedResponse<CalendarEventItem>>('/calendar', filters);
    return response.data;
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    return apiClient.get<CalendarEvent>(`/calendar/events/${id}`);
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    return apiClient.post<CalendarEvent>('/calendar/events', event);
  }

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return apiClient.put<CalendarEvent>(`/calendar/events/${id}`, event);
  }

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/calendar/events/${id}`);
  }

  async getTeamAvailability(date: string): Promise<any[]> {
    return apiClient.get('/calendar/team-availability', { date });
  }

  async getSOL(caseId: string): Promise<any[]> {
    return apiClient.get('/calendar/statute-of-limitations', { caseId });
  }

  async sync(): Promise<{ synced: number; errors: number }> {
    return apiClient.post('/calendar/sync', {});
  }

  async getActiveRuleSets(): Promise<string[]> {
    const response = await apiClient.get<{ data: string[] }>('/calendar/rule-sets');
    return response.data;
  }
}

// ==================== MESSENGER ====================
export interface MessageDto {
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: { name: string; url: string; size: number }[];
}

export class MessengerApiService {
  async getConversations(filters?: { caseId?: string; userId?: string }): Promise<Conversation[]> {
    const response = await apiClient.get<PaginatedResponse<Conversation>>('/messenger/conversations', filters);
    return response.data;
  }

  async getConversation(id: string): Promise<Conversation> {
    return apiClient.get<Conversation>(`/messenger/conversations/${id}`);
  }

  async createConversation(data: { participants: string[]; caseId?: string; subject?: string }): Promise<Conversation> {
    return apiClient.post<Conversation>('/messenger/conversations', data);
  }

  async sendMessage(message: MessageDto): Promise<Message> {
    return apiClient.post<Message>('/messenger/messages', message);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get<PaginatedResponse<Message>>(`/messenger/conversations/${conversationId}/messages`);
    return response.data;
  }

  async markRead(conversationId: string): Promise<void> {
    await apiClient.post(`/messenger/conversations/${conversationId}/mark-read`, {});
  }

  async countUnread(caseId?: string): Promise<number> {
    const result = await apiClient.get<{ count: number }>('/messenger/unread-count', caseId ? { caseId } : undefined);
    return result.count;
  }

  async getContacts(): Promise<any[]> {
    return apiClient.get('/messenger/contacts');
  }
}

// ==================== WAR ROOM ====================
export class WarRoomApiService {
  async getData(caseId: string): Promise<WarRoomData> {
    return apiClient.get<WarRoomData>(`/war-room/${caseId}`);
  }

  async getAdvisors(caseId?: string): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/war-room/advisors', caseId ? { caseId } : undefined);
    return response.data;
  }

  async createAdvisor(advisor: { caseId: string; name: string; role: string; expertise: string[] }): Promise<any> {
    return apiClient.post('/war-room/advisors', advisor);
  }

  async getExperts(caseId?: string): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/war-room/experts', caseId ? { caseId } : undefined);
    return response.data;
  }

  async getOpposition(caseId?: string): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/war-room/opposition', caseId ? { caseId } : undefined);
    return response.data;
  }

  async updateStrategy(caseId: string, strategy: any): Promise<any> {
    return apiClient.put(`/war-room/${caseId}/strategy`, strategy);
  }
}

// ==================== ANALYTICS DASHBOARD ====================
export interface DashboardStats {
  activeCases: number;
  pendingMotions: number;
  billableHours: number;
  highRisks: number;
}

export interface ChartData {
  name: string;
  count: number;
  value?: number;
}

export class AnalyticsDashboardApiService {
  async getStats(filters?: { startDate?: string; endDate?: string }): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/analytics/dashboard/stats', filters);
  }

  async getChartData(type: string, filters?: any): Promise<ChartData[]> {
    return apiClient.get<ChartData[]>(`/analytics/dashboard/charts/${type}`, filters);
  }

  async getRecentAlerts(limit?: number): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/analytics/dashboard/alerts', { limit: limit || 10 });
    return response.data;
  }

  async getCaseMetrics(caseId: string): Promise<any> {
    return apiClient.get(`/analytics/dashboard/cases/${caseId}/metrics`);
  }

  async getPerformanceMetrics(userId?: string): Promise<any> {
    return apiClient.get('/analytics/dashboard/performance', userId ? { userId } : undefined);
  }
}

// ==================== KNOWLEDGE BASE ====================
export interface KnowledgeArticleDto {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  practiceArea?: string;
  isPublic?: boolean;
  author?: string;
}

export class KnowledgeBaseApiService {
  async getAll(filters?: { category?: string; practiceArea?: string; search?: string }): Promise<WikiArticle[]> {
    const response = await apiClient.get<PaginatedResponse<WikiArticle>>('/knowledge/articles', filters);
    return response.data;
  }

  async getById(id: string): Promise<WikiArticle> {
    return apiClient.get<WikiArticle>(`/knowledge/articles/${id}`);
  }

  async create(article: KnowledgeArticleDto): Promise<WikiArticle> {
    return apiClient.post<WikiArticle>('/knowledge/articles', article);
  }

  async update(id: string, article: Partial<KnowledgeArticleDto>): Promise<WikiArticle> {
    return apiClient.put<WikiArticle>(`/knowledge/articles/${id}`, article);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/knowledge/articles/${id}`);
  }

  async search(query: string): Promise<WikiArticle[]> {
    const response = await apiClient.get<PaginatedResponse<WikiArticle>>('/knowledge/search', { q: query });
    return response.data;
  }

  async getCategories(): Promise<string[]> {
    return apiClient.get('/knowledge/categories');
  }

  async getPrecedents(filters?: { practiceArea?: string }): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/knowledge/precedents', filters);
    return response.data;
  }
}

// ==================== EXPORT ====================
export const finalApiServices = {
  tasks: new TasksApiService(),
  risks: new RisksApiService(),
  hr: new HRApiService(),
  workflowTemplates: new WorkflowTemplatesApiService(),
  trial: new TrialApiService(),
  exhibits: new ExhibitsApiService(),
  clients: new ClientsApiService(),
  citations: new CitationsApiService(),
  calendar: new CalendarApiService(),
  messenger: new MessengerApiService(),
  warRoom: new WarRoomApiService(),
  analyticsDashboard: new AnalyticsDashboardApiService(),
  knowledgeBase: new KnowledgeBaseApiService(),
};
