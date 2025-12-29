/**
 * MessengerDomain - Backend API integration
 * @updated 2025-12-19
 */

import { api } from '@/api';
import type { Conversation, Message } from '@/api/communications';

export const MessengerService = {
  getAll: async () => {
    // For messenger, getAll returns conversations
    return api.messaging.getConversations();
  },

  getById: async (id: string) => {
    return api.messaging.getConversation(id);
  },

  add: async (item: { participants: string[]; subject?: string; initialMessage?: string }) => {
    return api.messaging.createConversation(item);
  },

  update: async (id: string, updates: Partial<Conversation>) => {
    return api.messaging.updateConversation(id, updates);
  },

  delete: async (id: string) => {
    await api.messaging.deleteConversation(id);
    return true;
  },

  // Messenger-specific methods
  getConversations: async (filters?: Record<string, unknown>) => {
    return api.messaging.getConversations(filters);
  },

  getContacts: async (filters?: Record<string, unknown>) => {
    return api.messaging.getContacts(filters);
  },

  sendMessage: async (data: { conversationId: string; body: string; priority?: Message['priority']; attachments?: string[] }) => {
    return api.messaging.sendMessage(data);
  },

  createConversation: async (data: { participants: string[]; subject?: string; initialMessage?: string }) => {
    return api.messaging.createConversation(data);
  },

  getMessages: async (conversationId: string) => {
    return api.messaging.getMessages(conversationId);
  },

  markAsRead: async (messageId: string) => {
    return api.messaging.markAsRead(messageId);
  },
};
