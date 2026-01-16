// ================================================================================
// MESSENGER DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → MessengerService → Frontend API → Backend
//
// PURPOSE:
//   - Real-time messaging and chat operations
//   - Thread and conversation management
//   - Presence and typing indicators
//
// USAGE:
//   Called by MessengerContext and route loaders.
//   Never called directly from view components.
//
// ================================================================================

/**
 * MessengerDomain - Backend API integration
 * @updated 2025-12-19
 */

import type { Conversation, Message } from "@/api/communications/messaging-api";
import { api } from "@/services/api";

export const MessengerService = {
  getAll: async () => {
    // For messenger, getAll returns conversations
    return api.messaging.getConversations();
  },

  getById: async (id: string) => {
    return api.messaging.getConversation(id);
  },

  add: async (item: {
    participants: string[];
    subject?: string;
    initialMessage?: string;
  }) => {
    return api.messaging.createConversation({
      participantIds: item.participants,
      type: item.participants.length > 1 ? "group" : "direct",
      subject: item.subject,
      initialMessage: item.initialMessage,
    });
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

  sendMessage: async (data: {
    conversationId: string;
    body: string;
    priority?: Message["priority"];
    attachments?: File[];
  }) => {
    return api.messaging.sendMessage({
      conversationId: data.conversationId,
      content: data.body,
      priority: data.priority,
      attachments: data.attachments,
    });
  },

  createConversation: async (data: {
    participants: string[];
    subject?: string;
    initialMessage?: string;
  }) => {
    return api.messaging.createConversation({
      participantIds: data.participants,
      type: data.participants.length > 1 ? "group" : "direct",
      subject: data.subject,
      initialMessage: data.initialMessage,
    });
  },

  getMessages: async (conversationId: string) => {
    return api.messaging.getMessages(conversationId);
  },

  markAsRead: async (messageId: string) => {
    return api.messaging.markAsRead(messageId);
  },
};
