/**
 * WarRoomDomain - Backend API integration
 * @updated 2025-12-19
 */

import { api } from "@/api";
import type {
  CreateAdvisorDto,
  CreateExpertDto,
  UpdateStrategyDto,
} from "@/api/workflow/war-room-api";

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
    try {
      return await api.warRoom.getWarRoomData(caseId);
    } catch (error) {
      console.error("[WarRoomService] Failed to fetch war room data:", error);
      throw new Error(`Failed to load war room data for case ${caseId}`);
    }
  },

  getSessions: async () => [],
  createSession: async (session: unknown) => session,
  joinSession: async () => true,
  leaveSession: async () => true,
  getParticipants: async () => [],

  // Advisors
  getAdvisors: async (query?: Record<string, string>) => {
    try {
      return await api.warRoom.getAdvisors(query);
    } catch {
      return [];
    }
  },

  createAdvisor: async (data: CreateAdvisorDto) => {
    try {
      return await api.warRoom.createAdvisor(data);
    } catch (error) {
      console.error("[WarRoomService] Failed to create advisor:", error);
      throw new Error("Failed to create advisor");
    }
  },

  deleteAdvisor: async (id: string) => {
    try {
      return await api.warRoom.deleteAdvisor(id);
    } catch {
      return true;
    }
  },

  // Experts
  getExperts: async (query?: Record<string, string>) => {
    try {
      return await api.warRoom.getExperts(query);
    } catch {
      return [];
    }
  },

  createExpert: async (data: CreateExpertDto) => {
    try {
      return await api.warRoom.createExpert(data);
    } catch (error) {
      console.error("[WarRoomService] Failed to create expert:", error);
      throw new Error("Failed to create expert witness");
    }
  },

  deleteExpert: async (id: string) => {
    try {
      return await api.warRoom.deleteExpert(id);
    } catch {
      return true;
    }
  },

  // Strategy
  getStrategy: async (caseId: string) => {
    try {
      return await api.warRoom.getStrategy(caseId);
    } catch (error) {
      console.error("[WarRoomService] Failed to fetch strategy:", error);
      throw new Error(`Failed to load strategy for case ${caseId}`);
    }
  },

  updateStrategy: async (caseId: string, data: UpdateStrategyDto) => {
    try {
      return await api.warRoom.updateStrategy(caseId, data);
    } catch (error) {
      console.error("[WarRoomService] Failed to update strategy:", error);
      throw new Error("Failed to update litigation strategy");
    }
  },
};
