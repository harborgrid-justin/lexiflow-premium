/**
 * WarRoomDomain - Backend API integration
 * @updated 2025-12-19
 */

import { api } from '@/lib/frontend-api';
import type {
  CreateAdvisorDto,
  CreateExpertDto,
  UpdateStrategyDto,
} from "@/api/workflow/war-room-api";
import { apiClient } from "@/services/infrastructure/apiClient";

export const WarRoomService = {
  getAll: async () => {
    // War room doesn't have a getAll - return empty array
    return [];
  },

  getById: async (id: string) => {
    return api.warRoom.getWarRoomData(id);
  },

  add: async (item: unknown) => item,
  update: async (updates: unknown) => updates,
  delete: async () => true,

  // War room specific methods
  getData: async (caseId: string) => {
    if (!caseId) return null;
    return await api.warRoom.getWarRoomData(caseId);
  },

  getSessions: async () => {
    return apiClient.get("/war-room/sessions");
  },
  createSession: async (session: unknown) => {
    return apiClient.post("/war-room/sessions", session);
  },
  joinSession: async (sessionId: string) => {
    return apiClient.post(`/war-room/sessions/${sessionId}/join`, {});
  },
  leaveSession: async (sessionId: string) => {
    return apiClient.post(`/war-room/sessions/${sessionId}/leave`, {});
  },
  getParticipants: async (sessionId: string) => {
    return apiClient.get(`/war-room/sessions/${sessionId}/participants`);
  },

  // Advisors
  getAdvisors: async (query?: Record<string, string>) => {
    return await api.warRoom.getAdvisors(query);
  },

  createAdvisor: async (data: CreateAdvisorDto) => {
    return await api.warRoom.createAdvisor(data);
  },

  deleteAdvisor: async (id: string) => {
    return await api.warRoom.deleteAdvisor(id);
  },

  // Experts
  getExperts: async (query?: Record<string, string>) => {
    return await api.warRoom.getExperts(query);
  },

  createExpert: async (data: CreateExpertDto) => {
    return await api.warRoom.createExpert(data);
  },

  deleteExpert: async (id: string) => {
    return await api.warRoom.deleteExpert(id);
  },

  // Strategy
  getStrategy: async (caseId: string) => {
    try {
      return await api.warRoom.getStrategy(caseId);
    } catch (error) {
      console.error("[WarRoomService.getStrategy] Error:", error);
      return null;
    }
  },

  updateStrategy: async (caseId: string, data: UpdateStrategyDto) => {
    try {
      return await api.warRoom.updateStrategy(caseId, data);
    } catch (error) {
      console.error("[WarRoomService.updateStrategy] Error:", error);
      return { ...data };
    }
  },

  getOpposition: async (caseId: string) => {
    try {
      return await api.warRoom.getOpposition(caseId);
    } catch (error) {
      console.error("[WarRoomService.getOpposition] Error:", error);
      return [];
    }
  },
};
