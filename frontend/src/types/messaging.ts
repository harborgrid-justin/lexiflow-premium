/**
 * Messaging Types
 * Types for secure internal messaging system
 */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "file" | "system";
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  attachments?: MessageAttachment[];
  metadata?: Record<string, unknown>;
  replyTo?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
  readAt?: string;
  deliveredAt?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  isOnline?: boolean;
  avatarUrl?: string;
  email?: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "group" | "case" | "matter";
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
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  role: "owner" | "admin" | "member";
  isOnline: boolean;
  lastSeen?: string;
  isTyping: boolean;
  joinedAt: string;
}

export interface CreateConversationDto {
  type: "direct" | "group" | "case" | "matter";
  name?: string;
  participantIds: string[];
  caseId?: string;
  matterId?: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: "text" | "file" | "system";
  attachments?: File[];
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageFilters {
  conversationId?: string;
  senderId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface ConversationFilters {
  type?: string;
  caseId?: string;
  matterId?: string;
  isArchived?: boolean;
  isPinned?: boolean;
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

export interface DeliveryStatus {
  messageId: string;
  status: "sent" | "delivered" | "read";
  userId: string;
  timestamp: string;
}
