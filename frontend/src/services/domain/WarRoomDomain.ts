/**
 * WarRoomDomain - Backend API integration
 * @updated 2025-12-19
 */

import { api } from '@/api';

export const WarRoomService = {
  getAll: async () => {
    // War room doesn't have a getAll - return empty array
    return [];
  },
  
  getById: async (id: string) => {
    return api.warRoom.getWarRoomData(id);
  },
  
  add: async (item: unknown) => item,
  update: async (id: string, updates: unknown) => updates,
  delete: async (id: string) => true,
  
  // War room specific methods
  getData: async (caseId: string) => {
    return api.warRoom.getWarRoomData(caseId);
  },
  
  getSessions: async () => [],
  createSession: async (session: unknown) => session,
  joinSession: async (sessionId: string) => true,
  leaveSession: async (sessionId: string) => true,
  getParticipants: async (sessionId: string) => [],
  
  // Advisors
  getAdvisors: async (query?: unknown) => {
    return api.warRoom.getAdvisors(query);
  },
  
  createAdvisor: async (data: unknown) => {
    return api.warRoom.createAdvisor(data);
  },
  
  deleteAdvisor: async (id: string) => {
    return api.warRoom.deleteAdvisor(id);
  },
  
  // Experts
  getExperts: async (query?: unknown) => {
    return api.warRoom.getExperts(query);
  },
  
  createExpert: async (data: unknown) => {
    return api.warRoom.createExpert(data);
  },
  
  deleteExpert: async (id: string) => {
    return api.warRoom.deleteExpert(id);
  },
  
  // Strategy
  getStrategy: async (caseId: string) => {
    return api.warRoom.getStrategy(caseId);
  },
  
  updateStrategy: async (caseId: string, data: unknown) => {
    return api.warRoom.updateStrategy(caseId, data);
  },
};
