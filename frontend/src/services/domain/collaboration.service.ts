// ================================================================================
// COLLABORATION DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → CollaborationService → Frontend API → Backend
//
// PURPOSE:
//   - Team collaboration and shared workspace management
//   - Document sharing and co-authoring
//   - Activity feeds and team notifications
//
// USAGE:
//   Called by CollaborationContext and route loaders.
//   Never called directly from view components.
//
// ================================================================================

/**
 * CollaborationDomain - Team collaboration and workspace management
 * Provides workspaces, comments, invitations, and resource sharing
 * ? Migrated to backend API (2025-12-21)
 */

import { apiClient } from "@/services/infrastructure/apiClient";

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

export const CollaborationService = {
  getAll: async () => {
    return apiClient.get<Workspace[]>("/collaboration/workspaces");
  },
  getById: async (id: string) => {
    return apiClient.get<Workspace>(`/collaboration/workspaces/${id}`);
  },
  add: async (item: unknown) => {
    return apiClient.post<Workspace>("/collaboration/workspaces", item);
  },
  update: async (id: string, updates: unknown) => {
    return apiClient.patch<Workspace>(
      `/collaboration/workspaces/${id}`,
      updates
    );
  },
  delete: async (id: string) => {
    return apiClient.delete(`/collaboration/workspaces/${id}`);
  },

  // Collaboration specific methods
  getWorkspaces: async (userId?: string): Promise<Workspace[]> => {
    return apiClient.get<Workspace[]>("/collaboration/workspaces", {
      userId,
    });
  },

  createWorkspace: async (
    workspace: Partial<Workspace>
  ): Promise<Workspace> => {
    return apiClient.post<Workspace>("/collaboration/workspaces", workspace);
  },

  inviteUser: async (workspaceId: string, userId: string): Promise<boolean> => {
    await apiClient.post(`/collaboration/workspaces/${workspaceId}/invite`, {
      userId,
    });
    return true;
  },

  getComments: async (resourceId: string): Promise<Comment[]> => {
    return apiClient.get<Comment[]>(
      `/collaboration/comments?resourceId=${resourceId}`
    );
  },

  addComment: async (
    resourceId: string,
    comment: Partial<Comment>
  ): Promise<Comment> => {
    return apiClient.post<Comment>("/collaboration/comments", {
      resourceId,
      ...comment,
    });
  },

  shareResource: async (
    resourceId: string,
    userId: string,
    options?: { permissions?: "view" | "edit" | "admin"; resourceType?: string }
  ): Promise<boolean> => {
    await apiClient.post("/collaboration/share", {
      resourceId,
      userId,
      ...options,
    });
    return true;
  },
};
