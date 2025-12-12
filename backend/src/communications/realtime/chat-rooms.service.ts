import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  metadata?: any;
  replyTo?: string;
  reactions?: Map<string, Set<string>>; // emoji -> userIds
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'case' | 'channel';
  createdBy: string;
  createdAt: Date;
  participants: Set<string>;
  admins: Set<string>;
  messages: ChatMessage[];
  isPrivate: boolean;
  metadata?: any;
  lastActivity: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  roomId: string;
  startedAt: Date;
}

@Injectable()
export class ChatRoomsService {
  private readonly logger = new Logger(ChatRoomsService.name);
  private rooms = new Map<string, ChatRoom>();
  private typing = new Map<string, Map<string, TypingIndicator>>(); // roomId -> userId -> typing
  private userRooms = new Map<string, Set<string>>(); // userId -> roomIds
  private readonly MAX_MESSAGES_PER_ROOM = 1000;

  /**
   * Create a chat room
   */
  createRoom(
    name: string,
    type: ChatRoom['type'],
    createdBy: string,
    options?: {
      participants?: string[];
      isPrivate?: boolean;
      metadata?: any;
    },
  ): ChatRoom {
    const roomId = this.generateRoomId(type);

    const participants = new Set<string>([createdBy]);
    if (options?.participants) {
      options.participants.forEach((p) => participants.add(p));
    }

    const room: ChatRoom = {
      id: roomId,
      name,
      type,
      createdBy,
      createdAt: new Date(),
      participants,
      admins: new Set([createdBy]),
      messages: [],
      isPrivate: options?.isPrivate || false,
      metadata: options?.metadata,
      lastActivity: new Date(),
    };

    this.rooms.set(roomId, room);
    this.typing.set(roomId, new Map());

    // Track user's rooms
    participants.forEach((userId) => {
      this.addUserToRoomTracking(userId, roomId);
    });

    this.logger.log(`Created chat room ${roomId} (${type}) by ${createdBy}`);

    return room;
  }

  /**
   * Add message to room
   */
  addMessage(
    roomId: string,
    userId: string,
    userName: string,
    content: string,
    type: ChatMessage['type'] = 'text',
    metadata?: any,
    replyTo?: string,
  ): ChatMessage | null {
    const room = this.rooms.get(roomId);

    if (!room || !room.participants.has(userId)) {
      return null;
    }

    const message: ChatMessage = {
      id: this.generateMessageId(),
      roomId,
      userId,
      userName,
      content,
      timestamp: new Date(),
      type,
      metadata,
      replyTo,
      reactions: new Map(),
      isEdited: false,
      isDeleted: false,
    };

    room.messages.push(message);
    room.lastActivity = new Date();

    // Trim old messages if exceeding limit
    if (room.messages.length > this.MAX_MESSAGES_PER_ROOM) {
      room.messages.shift();
    }

    return message;
  }

  /**
   * Edit message
   */
  editMessage(
    roomId: string,
    messageId: string,
    userId: string,
    newContent: string,
  ): ChatMessage | null {
    const room = this.rooms.get(roomId);

    if (!room) {
      return null;
    }

    const message = room.messages.find((m) => m.id === messageId);

    if (!message || message.userId !== userId || message.isDeleted) {
      return null;
    }

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();

    return message;
  }

  /**
   * Delete message
   */
  deleteMessage(
    roomId: string,
    messageId: string,
    userId: string,
  ): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    const message = room.messages.find((m) => m.id === messageId);
    const isAdmin = room.admins.has(userId);

    if (!message || (message.userId !== userId && !isAdmin)) {
      return false;
    }

    message.isDeleted = true;
    message.content = '[Deleted]';

    return true;
  }

  /**
   * Add reaction to message
   */
  addReaction(
    roomId: string,
    messageId: string,
    userId: string,
    emoji: string,
  ): boolean {
    const room = this.rooms.get(roomId);

    if (!room || !room.participants.has(userId)) {
      return false;
    }

    const message = room.messages.find((m) => m.id === messageId);

    if (!message || message.isDeleted) {
      return false;
    }

    if (!message.reactions) {
      message.reactions = new Map();
    }

    if (!message.reactions.has(emoji)) {
      message.reactions.set(emoji, new Set());
    }

    message.reactions.get(emoji)!.add(userId);

    return true;
  }

  /**
   * Remove reaction from message
   */
  removeReaction(
    roomId: string,
    messageId: string,
    userId: string,
    emoji: string,
  ): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    const message = room.messages.find((m) => m.id === messageId);

    if (!message || !message.reactions) {
      return false;
    }

    const users = message.reactions.get(emoji);

    if (!users) {
      return false;
    }

    users.delete(userId);

    // Remove emoji if no users
    if (users.size === 0) {
      message.reactions.delete(emoji);
    }

    return true;
  }

  /**
   * Add participant to room
   */
  addParticipant(
    roomId: string,
    userId: string,
    addedBy: string,
  ): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    // Check if adder has permission
    if (!room.admins.has(addedBy) && room.createdBy !== addedBy) {
      return false;
    }

    room.participants.add(userId);
    this.addUserToRoomTracking(userId, roomId);

    // Add system message
    this.addMessage(
      roomId,
      'system',
      'System',
      `User ${userId} joined the chat`,
      'system',
    );

    return true;
  }

  /**
   * Remove participant from room
   */
  removeParticipant(
    roomId: string,
    userId: string,
    removedBy: string,
  ): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    // Check if remover has permission
    const isAdmin = room.admins.has(removedBy);
    const isSelf = userId === removedBy;

    if (!isAdmin && !isSelf) {
      return false;
    }

    // Cannot remove room creator
    if (userId === room.createdBy) {
      return false;
    }

    room.participants.delete(userId);
    room.admins.delete(userId);
    this.removeUserFromRoomTracking(userId, roomId);

    // Add system message
    this.addMessage(
      roomId,
      'system',
      'System',
      `User ${userId} left the chat`,
      'system',
    );

    return true;
  }

  /**
   * Set typing indicator
   */
  setTyping(
    roomId: string,
    userId: string,
    userName: string,
    isTyping: boolean,
  ): void {
    const roomTyping = this.typing.get(roomId);

    if (!roomTyping) {
      return;
    }

    if (isTyping) {
      roomTyping.set(userId, {
        userId,
        userName,
        roomId,
        startedAt: new Date(),
      });

      // Auto-remove after 5 seconds
      setTimeout(() => {
        roomTyping.delete(userId);
      }, 5000);
    } else {
      roomTyping.delete(userId);
    }
  }

  /**
   * Get typing users in room
   */
  getTypingUsers(roomId: string): TypingIndicator[] {
    const roomTyping = this.typing.get(roomId);

    if (!roomTyping) {
      return [];
    }

    // Filter out stale typing indicators (older than 5 seconds)
    const now = Date.now();
    const typing = Array.from(roomTyping.values()).filter(
      (t) => now - t.startedAt.getTime() < 5000,
    );

    return typing;
  }

  /**
   * Get room messages
   */
  getMessages(
    roomId: string,
    limit?: number,
    before?: string,
  ): ChatMessage[] {
    const room = this.rooms.get(roomId);

    if (!room) {
      return [];
    }

    let messages = room.messages.filter((m) => !m.isDeleted);

    // Filter messages before a certain message ID
    if (before) {
      const index = messages.findIndex((m) => m.id === before);
      if (index > 0) {
        messages = messages.slice(0, index);
      }
    }

    // Apply limit
    if (limit) {
      messages = messages.slice(-limit);
    }

    return messages;
  }

  /**
   * Get room
   */
  getRoom(roomId: string): ChatRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get user's rooms
   */
  getUserRooms(userId: string): ChatRoom[] {
    const roomIds = this.userRooms.get(userId) || new Set();
    return Array.from(roomIds)
      .map((id) => this.rooms.get(id))
      .filter((r): r is ChatRoom => r !== undefined);
  }

  /**
   * Search messages
   */
  searchMessages(
    roomId: string,
    query: string,
    limit: number = 50,
  ): ChatMessage[] {
    const room = this.rooms.get(roomId);

    if (!room) {
      return [];
    }

    const lowerQuery = query.toLowerCase();

    return room.messages
      .filter(
        (m) =>
          !m.isDeleted &&
          m.type === 'text' &&
          m.content.toLowerCase().includes(lowerQuery),
      )
      .slice(-limit);
  }

  /**
   * Mark room as read for user
   */
  markAsRead(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);

    if (!room || !room.participants.has(userId)) {
      return;
    }

    // This would typically update a read receipts tracking system
    // For now, we'll just log it
    this.logger.log(`User ${userId} marked room ${roomId} as read`);
  }

  /**
   * Get unread message count for user
   */
  getUnreadCount(roomId: string, userId: string, since: Date): number {
    const room = this.rooms.get(roomId);

    if (!room || !room.participants.has(userId)) {
      return 0;
    }

    return room.messages.filter(
      (m) =>
        !m.isDeleted &&
        m.userId !== userId &&
        m.timestamp > since,
    ).length;
  }

  /**
   * Broadcast message to room
   */
  broadcastMessage(
    server: Server,
    roomId: string,
    event: string,
    data: any,
  ): void {
    server.to(roomId).emit(event, data);
  }

  /**
   * Delete room
   */
  deleteRoom(roomId: string, deletedBy: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room || room.createdBy !== deletedBy) {
      return false;
    }

    // Remove room from all participants' tracking
    room.participants.forEach((userId) => {
      this.removeUserFromRoomTracking(userId, roomId);
    });

    this.rooms.delete(roomId);
    this.typing.delete(roomId);

    this.logger.log(`Room ${roomId} deleted by ${deletedBy}`);

    return true;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalRooms: number;
    totalMessages: number;
    activeRooms: number;
    roomsByType: Record<string, number>;
  } {
    const roomsByType: Record<string, number> = {};
    let totalMessages = 0;
    let activeRooms = 0;

    const now = Date.now();
    const activeThreshold = 24 * 60 * 60 * 1000; // 24 hours

    this.rooms.forEach((room) => {
      roomsByType[room.type] = (roomsByType[room.type] || 0) + 1;
      totalMessages += room.messages.length;

      if (now - room.lastActivity.getTime() < activeThreshold) {
        activeRooms++;
      }
    });

    return {
      totalRooms: this.rooms.size,
      totalMessages,
      activeRooms,
      roomsByType,
    };
  }

  private generateRoomId(type: string): string {
    return `chat_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addUserToRoomTracking(userId: string, roomId: string): void {
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(roomId);
  }

  private removeUserFromRoomTracking(userId: string, roomId: string): void {
    const rooms = this.userRooms.get(userId);
    if (rooms) {
      rooms.delete(roomId);
      if (rooms.size === 0) {
        this.userRooms.delete(userId);
      }
    }
  }
}
