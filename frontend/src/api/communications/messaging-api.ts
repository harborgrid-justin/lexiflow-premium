/**
 * Messaging API Service
 * Enterprise-grade internal messaging system with real-time features
 *
 * @module MessagingApiService
 * @description Manages all messaging-related operations including:
 * - Conversation CRUD operations
 * - Message sending and retrieval with attachments
 * - Real-time delivery status tracking
 * - Typing indicators and online presence
 * - Read receipts and unread counts
 * - Message search and advanced filters
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';

// ============================================================================
// Core Types
// ============================================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: MessageAttachment[];
  metadata?: Record<string, unknown>;
  replyTo?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
  readAt?: string;
  deliveredAt?: string;
  // Legacy fields for backward compatibility
  from?: string;
  to?: string[];
  subject?: string;
  body?: string;
  threadId?: string;
  read?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  sentAt?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'case' | 'matter';
  name?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  caseId?: string;
  matterId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  subject?: string;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  role: 'owner' | 'admin' | 'member';
  isOnline: boolean;
  lastSeen?: string;
  isTyping: boolean;
  joinedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface MessageFilters {
  conversationId?: string;
  senderId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  // Legacy
  threadId?: string;
  read?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ConversationFilters {
  type?: string;
  caseId?: string;
  matterId?: string;
  isArchived?: boolean;
  isPinned?: boolean;
}

export interface CreateConversationDto {
  type: 'direct' | 'group' | 'case' | 'matter';
  name?: string;
  participantIds: string[];
  caseId?: string;
  matterId?: string;
  // Legacy
  participants?: string[];
  subject?: string;
  initialMessage?: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: 'text' | 'file' | 'system';
  attachments?: File[];
  replyTo?: string;
  metadata?: Record<string, unknown>;
  // Legacy
  body?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface OnlinePresence {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

// ============================================================================
// Query Keys for React Query
// ============================================================================

export const MESSAGING_QUERY_KEYS = {
  conversations: {
    all: () => ['conversations'] as const,
    byId: (id: string) => ['conversations', id] as const,
    messages: (id: string) => ['conversations', id, 'messages'] as const,
    unread: () => ['conversations', 'unread'] as const,
  },
  messages: {
    all: () => ['messages'] as const,
    byId: (id: string) => ['messages', id] as const,
    byConversation: (conversationId: string) => ['messages', 'conversation', conversationId] as const,
  },
  contacts: {
    all: () => ['contacts'] as const,
    byId: (id: string) => ['contacts', id] as const,
  },
} as const;

// ============================================================================
// Messaging API Service
// ============================================================================

export class MessagingApiService {
  private readonly baseUrl = '/messenger';

  constructor() {
    console.log('[MessagingApiService] Initialized with Backend API');
  }

  /**
   * Validate ID parameter
   */
  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`[MessagingApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate object parameter
   */
  private validateObject(obj: unknown, paramName: string, methodName: string): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error(`[MessagingApiService.${methodName}] Invalid ${paramName} parameter`);
    }
  }

  // =============================================================================
  // HEALTH & SYSTEM
  // =============================================================================

  /**
   * Health check
   */
  async health(): Promise<{ status: string; service: string }> {
    return apiClient.get<{ status: string; service: string }>(this.baseUrl);
  }

  // =============================================================================
  // CONTACTS
  // =============================================================================

  /**
   * Get all contacts
   */
  async getContacts(filters?: Record<string, unknown>): Promise<Contact[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Contact>>(`${this.baseUrl}/contacts`, filters);
      return response.data;
    } catch () {
      console.error('[MessagingApiService.getContacts] Error:', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  /**
   * Get contact by ID
   */
  async getContact(id: string): Promise<Contact> {
    this.validateId(id, 'getContact');
    try {
      return await apiClient.get<Contact>(`${this.baseUrl}/contacts/${id}`);
    } catch () {
      console.error('[MessagingApiService.getContact] Error:', error);
      throw new Error(`Failed to fetch contact: ${id}`);
    }
  }

  // =============================================================================
  // CONVERSATIONS
  // =============================================================================

  /**
   * Get all conversations with optional filters
   */
  async getConversations(filters?: ConversationFilters): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Conversation>>(
        `${this.baseUrl}/conversations`,
        filters as Record<string, unknown>
      );
      return response.data;
    } catch () {
      console.error('[MessagingApiService.getConversations] Error:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(id: string): Promise<Conversation> {
    this.validateId(id, 'getConversation');
    try {
      return await apiClient.get<Conversation>(`${this.baseUrl}/conversations/${id}`);
    } catch () {
      console.error('[MessagingApiService.getConversation] Error:', error);
      throw new Error(`Failed to fetch conversation: ${id}`);
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    this.validateObject(data, 'data', 'createConversation');

    // Support both new and legacy formats
    const participantIds = data.participantIds || data.participants || [];
    if (participantIds.length === 0) {
      throw new Error('[MessagingApiService.createConversation] participants are required');
    }

    try {
      return await apiClient.post<Conversation>(`${this.baseUrl}/conversations`, {
        ...data,
        participantIds,
      });
    } catch () {
      console.error('[MessagingApiService.createConversation] Error:', error);
      throw new Error('Failed to create conversation');
    }
  }

  /**
   * Update conversation
   */
  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    this.validateId(id, 'updateConversation');
    this.validateObject(data, 'data', 'updateConversation');
    try {
      return await apiClient.patch<Conversation>(`${this.baseUrl}/conversations/${id}`, data);
    } catch () {
      console.error('[MessagingApiService.updateConversation] Error:', error);
      throw new Error(`Failed to update conversation: ${id}`);
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(id: string): Promise<void> {
    this.validateId(id, 'deleteConversation');
    try {
      await apiClient.delete(`${this.baseUrl}/conversations/${id}`);
    } catch () {
      console.error('[MessagingApiService.deleteConversation] Error:', error);
      throw new Error(`Failed to delete conversation: ${id}`);
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(id: string): Promise<Conversation> {
    return this.updateConversation(id, { isArchived: true });
  }

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(id: string): Promise<Conversation> {
    return this.updateConversation(id, { isArchived: false });
  }

  /**
   * Pin conversation
   */
  async pinConversation(id: string): Promise<Conversation> {
    return this.updateConversation(id, { isPinned: true });
  }

  /**
   * Unpin conversation
   */
  async unpinConversation(id: string): Promise<Conversation> {
    return this.updateConversation(id, { isPinned: false });
  }

  /**
   * Mute conversation
   */
  async muteConversation(id: string): Promise<Conversation> {
    return this.updateConversation(id, { isMuted: true });
  }

  /**
   * Unmute conversation
   */
  async unmuteConversation(id: string): Promise<Conversation> {
    return this.updateConversation(id, { isMuted: false });
  }

  // =============================================================================
  // MESSAGES
  // =============================================================================

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, filters?: MessageFilters): Promise<Message[]> {
    this.validateId(conversationId, 'getMessages');
    try {
      const response = await apiClient.get<PaginatedResponse<Message>>(
        `${this.baseUrl}/conversations/${conversationId}/messages`,
        filters as Record<string, unknown>
      );
      return response.data;
    } catch () {
      console.error('[MessagingApiService.getMessages] Error:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  /**
   * Get message by ID
   */
  async getMessage(id: string): Promise<Message> {
    this.validateId(id, 'getMessage');
    try {
      return await apiClient.get<Message>(`${this.baseUrl}/messages/${id}`);
    } catch () {
      console.error('[MessagingApiService.getMessage] Error:', error);
      throw new Error(`Failed to fetch message: ${id}`);
    }
  }

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageDto): Promise<Message> {
    this.validateObject(data, 'data', 'sendMessage');

    const content = data.content || data.body || '';
    if (!data.conversationId) {
      throw new Error('[MessagingApiService.sendMessage] conversationId is required');
    }
    if (!content || content.trim() === '') {
      throw new Error('[MessagingApiService.sendMessage] content is required');
    }

    try {
      // Handle file attachments if present
      if (data.attachments && data.attachments.length > 0) {
        const formData = new FormData();
        formData.append('conversationId', data.conversationId);
        formData.append('content', content);
        if (data.type) formData.append('type', data.type);
        if (data.replyTo) formData.append('replyTo', data.replyTo);
        if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
        if (data.priority) formData.append('priority', data.priority);

        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });

        return await apiClient.post<Message>(`${this.baseUrl}/messages`, formData);
      }

      return await apiClient.post<Message>(`${this.baseUrl}/messages`, {
        ...data,
        content,
      });
    } catch () {
      console.error('[MessagingApiService.sendMessage] Error:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Update message (edit)
   */
  async updateMessage(id: string, content: string): Promise<Message> {
    this.validateId(id, 'updateMessage');
    if (!content || content.trim() === '') {
      throw new Error('[MessagingApiService.updateMessage] content is required');
    }
    try {
      return await apiClient.patch<Message>(`${this.baseUrl}/messages/${id}`, { content });
    } catch () {
      console.error('[MessagingApiService.updateMessage] Error:', error);
      throw new Error(`Failed to update message: ${id}`);
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(id: string): Promise<void> {
    this.validateId(id, 'deleteMessage');
    try {
      await apiClient.delete(`${this.baseUrl}/messages/${id}`);
    } catch () {
      console.error('[MessagingApiService.deleteMessage] Error:', error);
      throw new Error(`Failed to delete message: ${id}`);
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<Message> {
    this.validateId(messageId, 'markAsRead');
    try {
      return await apiClient.post<Message>(`${this.baseUrl}/messages/${messageId}/mark-read`, {});
    } catch () {
      console.error('[MessagingApiService.markAsRead] Error:', error);
      throw new Error('Failed to mark message as read');
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  async markAllAsRead(conversationId: string): Promise<void> {
    this.validateId(conversationId, 'markAllAsRead');
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/mark-all-read`, {});
    } catch () {
      console.error('[MessagingApiService.markAllAsRead] Error:', error);
      throw new Error('Failed to mark all messages as read');
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      return await apiClient.get<{ count: number }>(`${this.baseUrl}/unread-count`);
    } catch () {
      console.error('[MessagingApiService.getUnreadCount] Error:', error);
      throw new Error('Failed to fetch unread count');
    }
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, filters?: MessageFilters): Promise<Message[]> {
    if (!query || query.trim() === '') {
      throw new Error('[MessagingApiService.searchMessages] query is required');
    }
    try {
      const response = await apiClient.get<PaginatedResponse<Message>>(
        `${this.baseUrl}/messages/search`,
        { q: query, ...filters } as Record<string, unknown>
      );
      return response.data;
    } catch () {
      console.error('[MessagingApiService.searchMessages] Error:', error);
      throw new Error('Failed to search messages');
    }
  }

  // =============================================================================
  // REAL-TIME OPERATIONS (Placeholders for Socket.io integration)
  // =============================================================================

  /**
   * Send typing indicator
   * Note: This should be handled via Socket.io in production
   */
  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    this.validateId(conversationId, 'sendTypingIndicator');
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/typing`, { isTyping });
    } catch () {
      console.error('[MessagingApiService.sendTypingIndicator] Error:', error);
      // Don't throw - typing indicators are non-critical
    }
  }

  /**
   * Update online presence
   * Note: This should be handled via Socket.io in production
   */
  async updatePresence(isOnline: boolean): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/presence`, { isOnline });
    } catch () {
      console.error('[MessagingApiService.updatePresence] Error:', error);
      // Don't throw - presence updates are non-critical
    }
  }

  // =============================================================================
  // LEGACY METHODS (for backward compatibility)
  // =============================================================================

  /**
   * @deprecated Use getMessages() instead
   */
  async getAll(filters?: MessageFilters): Promise<Message[]> {
    if (filters?.threadId) {
      return this.getMessages(filters.threadId, filters);
    }
    const conversations = await this.getConversations();
    return conversations.flatMap((c) => (c.lastMessage ? [c.lastMessage] : []));
  }

  /**
   * @deprecated Use getMessage() instead
   */
  async getById(id: string): Promise<Message> {
    return this.getMessage(id);
  }

  /**
   * @deprecated Use sendMessage() instead
   */
  async send(data: Partial<Message>): Promise<Message> {
    const messageData: SendMessageDto = {
      conversationId: data.threadId || data.conversationId || '',
      content: data.body || data.content || '',
      type: data.type,
      priority: data.priority,
      metadata: data.metadata,
    };
    return this.sendMessage(messageData);
  }

  /**
   * @deprecated Use deleteConversation() or deleteMessage() instead
   */
  async delete(id: string): Promise<void> {
    return this.deleteConversation(id);
  }
}

export const messagingApi = new MessagingApiService();
