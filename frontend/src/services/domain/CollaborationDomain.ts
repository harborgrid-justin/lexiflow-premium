/**
 * CollaborationDomain - Team collaboration and workspace management
 * Provides workspaces, comments, invitations, and resource sharing
 * ? Migrated to backend API (2025-12-21)
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import { isBackendApiEnabled } from "@/api";

interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  settings?: WorkspaceSettings;
}

interface WorkspaceSettings {
  visibility: "private" | "team" | "public";
  allowGuests?: boolean;
  notificationPreferences?: unknown;
}

interface Comment {
  id: string;
  resourceId: string;
  resourceType: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt?: string;
  mentions?: string[];
}

interface Share {
  id: string;
  resourceId: string;
  resourceType: string;
  sharedWith: string[];
  permissions: "view" | "edit" | "admin";
  sharedBy: string;
  sharedAt: string;
}

export const CollaborationService = {
  getAll: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get<Workspace[]>("/collaboration/workspaces");
    }
    return [];
  },
  getById: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.get<Workspace>(`/collaboration/workspaces/${id}`);
    }
    return undefined;
  },
  add: async (item: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.post<Workspace>("/collaboration/workspaces", item);
    }
    throw new Error("Backend API required");
  },
  update: async (id: string, updates: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.patch<Workspace>(
        `/collaboration/workspaces/${id}`,
        updates
      );
    }
    throw new Error("Backend API required");
  },
  delete: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.delete(`/collaboration/workspaces/${id}`);
    }
    throw new Error("Backend API required");
  },

  // Collaboration specific methods
  getWorkspaces: async (userId?: string): Promise<Workspace[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<Workspace[]>("/collaboration/workspaces", {
        userId,
      });
    }
    return [];
  },

  createWorkspace: async (
    workspace: Partial<Workspace>
  ): Promise<Workspace> => {
    if (isBackendApiEnabled()) {
      return apiClient.post<Workspace>("/collaboration/workspaces", workspace);
    }
    throw new Error("Backend API required");
  },

  inviteUser: async (workspaceId: string, userId: string): Promise<boolean> => {
    if (isBackendApiEnabled()) {
      await apiClient.post(`/collaboration/workspaces/${workspaceId}/invite`, {
        userId,
      });
      return true;
    }
    throw new Error("Backend API required");
  },

  getComments: async (resourceId: string): Promise<Comment[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<Comment[]>(
        `/collaboration/comments?resourceId=${resourceId}`
      );
    }
    return [];
  },

  addComment: async (
    resourceId: string,
    comment: Partial<Comment>
  ): Promise<Comment> => {
    if (isBackendApiEnabled()) {
      return apiClient.post<Comment>("/collaboration/comments", {
        resourceId,
        ...comment,
      });
    }
    throw new Error("Backend API required");
  },

  shareResource: async (
    resourceId: string,
    userId: string,
    options?: { permissions?: "view" | "edit" | "admin"; resourceType?: string }
  ): Promise<boolean> => {
    if (isBackendApiEnabled()) {
      await apiClient.post("/collaboration/share", {
        resourceId,
        userId,
        ...options,
      });
      return true;
    }
    throw new Error("Backend API required");
  },
};
