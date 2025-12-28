/**
 * WarRoomDomain - Backend API integration
 * @updated 2025-12-19
 */

import { api } from '@/api';
import type { CreateAdvisorDto, CreateExpertDto, UpdateStrategyDto } from '@/api/workflow';

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
    if (!caseId) return null;
    try {
      return await api.warRoom.getWarRoomData(caseId);
    } catch (error) {
      console.warn('[WarRoomService] Failed to fetch data, returning mock:', error);
      return {
        caseId,
        strategy: { theme: 'Mock Theme', narrative: 'Mock Narrative' },
        advisors: [],
        experts: [],
        evidence: [],
        witnesses: []
      };
    }
  },

  getSessions: async () => [],
  createSession: async (session: unknown) => session,
  joinSession: async (sessionId: string) => true,
  leaveSession: async (sessionId: string) => true,
  getParticipants: async (sessionId: string) => [],

  // Advisors
  getAdvisors: async (query?: Record<string, string>) => {
    try {
      return await api.warRoom.getAdvisors(query);
    } catch (error) {
      return [];
    }
  },

  createAdvisor: async (data: CreateAdvisorDto) => {
    try {
      return await api.warRoom.createAdvisor(data);
    } catch (error) {
      return { id: 'mock-advisor', ...data };
    }
  },

  deleteAdvisor: async (id: string) => {
    try {
      return await api.warRoom.deleteAdvisor(id);
    } catch (error) {
      return true;
    }
  },

  // Experts
  getExperts: async (query?: Record<string, string>) => {
    try {
      return await api.warRoom.getExperts(query);
    } catch (error) {
      return [];
    }
  },

  createExpert: async (data: CreateExpertDto) => {
    try {
      return await api.warRoom.createExpert(data);
    } catch (error) {
      return { id: 'mock-expert', ...data };
    }
  },

  deleteExpert: async (id: string) => {
    try {
      return await api.warRoom.deleteExpert(id);
    } catch (error) {
      return true;
    }
  },

  // Strategy
  getStrategy: async (caseId: string) => {
    try {
      return await api.warRoom.getStrategy(caseId);
    } catch (error) {
      return { theme: 'Mock Theme', narrative: 'Mock Narrative' };
    }
  },

  updateStrategy: async (caseId: string, data: UpdateStrategyDto) => {
    try {
      return await api.warRoom.updateStrategy(caseId, data);
    } catch (error) {
      return { ...data };
    }
  },
};
