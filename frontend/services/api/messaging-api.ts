/**
 * Messaging API Service
 * Internal messaging system
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Message {
  id: string;
  from: string;
  to: string[];
  subject?: string;
  body: string;
  threadId?: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: string[];
  sentAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface MessageFilters {
  threadId?: string;
  read?: boolean;
  priority?: Message['priority'];
}

export interface Conversation {
  id: string;
  participants: string[];
  subject?: string;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export class MessagingApiService {
  private readonly baseUrl = '/messenger';

  // Health check
  async health(): Promise<{ status: string; service: string }> {
    return apiClient.get<{ status: string; service: string }>(this.baseUrl);
  }

  // Contacts
  async getContacts(filters?: Record<string, any>): Promise<Contact[]> {
    return apiClient.get<Contact[]>(`${this.baseUrl}/contacts`, filters);
  }

  // Conversations
  async getConversations(filters?: Record<string, any>): Promise<Conversation[]> {
    return apiClient.get<Conversation[]>(`${this.baseUrl}/conversations`, filters);
  }

  async getConversation(id: string): Promise<Conversation> {
    return apiClient.get<Conversation>(`${this.baseUrl}/conversations/${id}`);
  }

  async createConversation(data: {
    participants: string[];
    subject?: string;
    initialMessage?: string;
  }): Promise<Conversation> {
    return apiClient.post<Conversation>(`${this.baseUrl}/conversations`, data);
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    return apiClient.put<Conversation>(`${this.baseUrl}/conversations/${id}`, data);
  }

  async deleteConversation(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/conversations/${id}`);
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    return apiClient.get<Message[]>(`${this.baseUrl}/conversations/${conversationId}/messages`);
  }

  async sendMessage(data: {
    conversationId: string;
    body: string;
    priority?: Message['priority'];
    attachments?: string[];
  }): Promise<Message> {
    return apiClient.post<Message>(`${this.baseUrl}/messages`, data);
  }

  async markAsRead(messageId: string): Promise<Message> {
    return apiClient.post<Message>(`${this.baseUrl}/messages/${messageId}/mark-read`, {});
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>(`${this.baseUrl}/unread-count`);
  }

  // Legacy methods for backward compatibility
  async getAll(filters?: MessageFilters): Promise<Message[]> {
    // Deprecated - use getConversations() instead
    return apiClient.get<Message[]>(`${this.baseUrl}/conversations`, filters);
  }

  async getById(id: string): Promise<Message> {
    // Deprecated - use getConversation() instead
    return apiClient.get<Message>(`${this.baseUrl}/conversations/${id}`);
  }

  async send(data: Partial<Message>): Promise<Message> {
    // Deprecated - use sendMessage() instead
    return this.sendMessage(data as any);
  }

  async delete(id: string): Promise<void> {
    // Deprecated - use deleteConversation() instead
    return this.deleteConversation(id);
  }
}
