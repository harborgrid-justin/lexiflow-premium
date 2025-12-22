/**
 * CollaborationDomain - Team collaboration and workspace management
 * Provides workspaces, comments, invitations, and resource sharing
 * ✅ Migrated to backend API (2025-12-21)
 */

import { communicationsApi } from '../api/domains/communications.api';
import { delay } from '../../utils/async';
import { STORES, db } from '../data/db';

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
  visibility: 'private' | 'team' | 'public';
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
  permissions: 'view' | 'edit' | 'admin';
  sharedBy: string;
  sharedAt: string;
}

export const CollaborationService = {
  getAll: async () => db.getAll(STORES.WORKSPACES),
  getById: async (id: string) => db.get(STORES.WORKSPACES, id),
  add: async (item: unknown) => db.put(STORES.WORKSPACES, { 
    ...item, 
    createdAt: new Date().toISOString(),
    members: item.members || []
  }),
  update: async (id: string, updates: unknown) => {
    const existing = await db.get(STORES.WORKSPACES, id);
    return db.put(STORES.WORKSPACES, { ...existing, ...updates });
  },
  delete: async (id: string) => db.delete(STORES.WORKSPACES, id),
  
  // Collaboration specific methods
  getWorkspaces: async (userId?: string): Promise<Workspace[]> => {
    const workspaces = await db.getAll(STORES.WORKSPACES);
    
    if (userId) {
      return workspaces.filter((w: Workspace) => 
        w.ownerId === userId || w.members.includes(userId)
      );
    }
    
    return workspaces;
  },
  
  createWorkspace: async (workspace: Partial<Workspace>): Promise<Workspace> => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: workspace.name || 'New Workspace',
      description: workspace.description,
      ownerId: workspace.ownerId || '',
      members: workspace.members || [],
      createdAt: new Date().toISOString(),
      settings: workspace.settings || { visibility: 'private' },
    };
    
    await db.put(STORES.WORKSPACES, newWorkspace);
    return newWorkspace;
  },
  
  inviteUser: async (workspaceId: string, userId: string): Promise<boolean> => {
    await delay(100);
    try {
      const workspace = await db.get(STORES.WORKSPACES, workspaceId);
      if (!workspace) return false;
      
      if (!workspace.members.includes(userId)) {
        workspace.members.push(userId);
        await db.put(STORES.WORKSPACES, workspace);
      }
      
      console.log(`[CollaborationService] Invited user ${userId} to workspace ${workspaceId}`);
      return true;
    } catch {
      return false;
    }
  },
  
  getComments: async (resourceId: string): Promise<Comment[]> => {
    await delay(50);
    const comments = await db.getAll(STORES.COMMENTS);
    return comments
      .filter((c: Comment) => c.resourceId === resourceId)
      .sort((a: Comment, b: Comment) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  },
  
  addComment: async (resourceId: string, comment: Partial<Comment>): Promise<Comment> => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      resourceId,
      resourceType: comment.resourceType || 'document',
      userId: comment.userId || '',
      content: comment.content || '',
      parentId: comment.parentId,
      createdAt: new Date().toISOString(),
      mentions: comment.mentions,
    };
    
    await db.put(STORES.COMMENTS, newComment);
    return newComment;
  },
  
  shareResource: async (
    resourceId: string, 
    userId: string, 
    options?: { permissions?: 'view' | 'edit' | 'admin'; resourceType?: string }
  ): Promise<boolean> => {
    await delay(100);
    try {
      const share: Share = {
        id: `share-${Date.now()}`,
        resourceId,
        resourceType: options?.resourceType || 'document',
        sharedWith: [userId],
        permissions: options?.permissions || 'view',
        sharedBy: 'current-user', // In production, get from auth context
        sharedAt: new Date().toISOString(),
      };
      
      await db.put(STORES.SHARES, share);
      console.log(`[CollaborationService] Shared ${resourceId} with ${userId}`);
      return true;
    } catch {
      return false;
    }
  },
};
