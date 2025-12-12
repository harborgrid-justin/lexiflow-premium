import { WebSocketService, websocketManager } from './websocketService';

/**
 * Chat Service
 *
 * Manages real-time chat functionality using WebSocket
 * Provides methods for sending messages, typing indicators, read receipts, and file sharing
 */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: Attachment[];
  replyToId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  delivered: boolean;
  read: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Conversation {
  id: string;
  title?: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
}

export interface PresenceUpdate {
  userId: string;
  status: 'online' | 'offline' | 'away';
  timestamp: string;
}

export interface FileUploadProgress {
  conversationId: string;
  userId: string;
  fileId: string;
  fileName: string;
  progress: number;
}

export type ChatEventHandler<T = any> = (data: T) => void;

class ChatService {
  private ws: WebSocketService | null = null;
  private messageHandlers: Set<ChatEventHandler<Message>> = new Set();
  private typingHandlers: Set<ChatEventHandler<TypingIndicator>> = new Set();
  private presenceHandlers: Set<ChatEventHandler<PresenceUpdate>> = new Set();
  private readReceiptHandlers: Set<ChatEventHandler<{ messageId: string; userId: string }>> =
    new Set();
  private deliveryReceiptHandlers: Set<
    ChatEventHandler<{ messageId: string; userId: string }>
  > = new Set();
  private fileUploadProgressHandlers: Set<ChatEventHandler<FileUploadProgress>> = new Set();
  private currentUserId: string | null = null;

  /**
   * Initialize chat service with authentication
   */
  async initialize(config: { apiUrl: string; token?: string; userId?: string }): Promise<void> {
    this.currentUserId = config.userId || null;

    // Create WebSocket connection for messaging
    this.ws = websocketManager.getConnection('messaging', {
      url: config.apiUrl,
      namespace: '/messaging',
      auth: {
        token: config.token,
        userId: config.userId,
      },
      autoConnect: true,
    });

    this.ws.connect();
    this.setupEventHandlers();

    // Wait for connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      const unsubscribe = this.ws!.onStatusChange((status) => {
        if (status === 'connected') {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        } else if (status === 'error') {
          clearTimeout(timeout);
          unsubscribe();
          reject(new Error('Connection failed'));
        }
      });
    });
  }

  /**
   * Disconnect from chat service
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = null;
    }
  }

  /**
   * Join a conversation room
   */
  async joinConversation(conversationId: string): Promise<void> {
    if (!this.ws) throw new Error('Chat service not initialized');

    await this.ws.emitWithAck('conversation:join', { conversationId });
  }

  /**
   * Leave a conversation room
   */
  async leaveConversation(conversationId: string): Promise<void> {
    if (!this.ws) throw new Error('Chat service not initialized');

    await this.ws.emitWithAck('conversation:leave', { conversationId });
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    options?: {
      attachments?: Attachment[];
      replyToId?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<{ success: boolean; messageId: string }> {
    if (!this.ws) throw new Error('Chat service not initialized');

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return await this.ws.emitWithAck('message:send', {
      conversationId,
      content,
      attachments: options?.attachments,
      replyToId: options?.replyToId,
      metadata: {
        ...options?.metadata,
        tempId,
      },
    });
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string, conversationId: string): void {
    if (!this.ws) throw new Error('Chat service not initialized');

    this.ws.emit('message:read', { messageId, conversationId });
  }

  /**
   * Start typing indicator
   */
  startTyping(conversationId: string): void {
    if (!this.ws) throw new Error('Chat service not initialized');

    this.ws.emit('typing:start', { conversationId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string): void {
    if (!this.ws) throw new Error('Chat service not initialized');

    this.ws.emit('typing:stop', { conversationId });
  }

  /**
   * Upload file and notify participants
   */
  async uploadFile(
    conversationId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<Attachment> {
    if (!this.ws) throw new Error('Chat service not initialized');

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Notify upload start
    this.ws.emit('file:upload:start', {
      conversationId,
      fileName: file.name,
      fileSize: file.size,
    });

    // Simulate file upload (in production, this would upload to S3 or similar)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress?.(progress);

          // Broadcast progress
          this.ws!.emit('file:upload:progress', {
            conversationId,
            fileId,
            progress,
          });
        }
      };

      reader.onload = () => {
        // In production, upload to server here
        const fileUrl = URL.createObjectURL(file);

        const attachment: Attachment = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
        };

        // Notify upload complete
        this.ws!.emit('file:upload:complete', {
          conversationId,
          fileId,
          fileName: file.name,
          fileSize: file.size,
          fileUrl,
        });

        resolve(attachment);
      };

      reader.onerror = () => {
        reject(new Error('File upload failed'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Subscribe to new messages
   */
  onMessage(handler: ChatEventHandler<Message>): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to typing indicators
   */
  onTyping(handler: ChatEventHandler<TypingIndicator>): () => void {
    this.typingHandlers.add(handler);
    return () => {
      this.typingHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to presence updates
   */
  onPresence(handler: ChatEventHandler<PresenceUpdate>): () => void {
    this.presenceHandlers.add(handler);
    return () => {
      this.presenceHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to read receipts
   */
  onReadReceipt(
    handler: ChatEventHandler<{ messageId: string; userId: string }>,
  ): () => void {
    this.readReceiptHandlers.add(handler);
    return () => {
      this.readReceiptHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to delivery receipts
   */
  onDeliveryReceipt(
    handler: ChatEventHandler<{ messageId: string; userId: string }>,
  ): () => void {
    this.deliveryReceiptHandlers.add(handler);
    return () => {
      this.deliveryReceiptHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to file upload progress
   */
  onFileUploadProgress(handler: ChatEventHandler<FileUploadProgress>): () => void {
    this.fileUploadProgressHandlers.add(handler);
    return () => {
      this.fileUploadProgressHandlers.delete(handler);
    };
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    // New message
    this.ws.on('message:new', (message: Message) => {
      this.messageHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('[ChatService] Error in message handler:', error);
        }
      });
    });

    // Typing indicators
    this.ws.on('typing:start', (data: TypingIndicator) => {
      this.typingHandlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[ChatService] Error in typing handler:', error);
        }
      });
    });

    this.ws.on('typing:stop', (data: TypingIndicator) => {
      this.typingHandlers.forEach((handler) => {
        try {
          handler({ ...data });
        } catch (error) {
          console.error('[ChatService] Error in typing handler:', error);
        }
      });
    });

    // Presence updates
    this.ws.on('presence:update', (data: PresenceUpdate) => {
      this.presenceHandlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[ChatService] Error in presence handler:', error);
        }
      });
    });

    // Presence snapshot (initial state)
    this.ws.on('presence:snapshot', (data: { users: PresenceUpdate[] }) => {
      data.users.forEach((user) => {
        this.presenceHandlers.forEach((handler) => {
          try {
            handler(user);
          } catch (error) {
            console.error('[ChatService] Error in presence handler:', error);
          }
        });
      });
    });

    // Read receipts
    this.ws.on('message:read', (data: { messageId: string; userId: string }) => {
      this.readReceiptHandlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[ChatService] Error in read receipt handler:', error);
        }
      });
    });

    // Delivery receipts
    this.ws.on('message:delivered', (data: { messageId: string; userId: string }) => {
      this.deliveryReceiptHandlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[ChatService] Error in delivery receipt handler:', error);
        }
      });
    });

    // File upload progress
    this.ws.on('file:upload:progress', (data: FileUploadProgress) => {
      this.fileUploadProgressHandlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[ChatService] Error in file upload progress handler:', error);
        }
      });
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.isConnected() || false;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

// Export singleton instance
export const chatService = new ChatService();

export default chatService;
