import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecureMessage } from './entities/secure-message.entity';
import { PortalUser } from './entities/portal-user.entity';

@Injectable()
export class SecureMessagingService {
  constructor(
    @InjectRepository(SecureMessage)
    private readonly messageRepository: Repository<SecureMessage>,
    @InjectRepository(PortalUser)
    private readonly portalUserRepository: Repository<PortalUser>,
  ) {}

  /**
   * Get all messages for a portal user
   */
  async getMessages(portalUserId: string, filters?: {
    read?: boolean;
    messageType?: string;
    matterId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ messages: SecureMessage[]; total: number }> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.portal_user_id = :portalUserId', { portalUserId })
      .andWhere('message.is_archived = :isArchived', { isArchived: false })
      .orderBy('message.sent_at', 'DESC');

    if (filters?.read !== undefined) {
      query.andWhere('message.read = :read', { read: filters.read });
    }

    if (filters?.messageType) {
      query.andWhere('message.message_type = :messageType', { messageType: filters.messageType });
    }

    if (filters?.matterId) {
      query.andWhere('message.matter_id = :matterId', { matterId: filters.matterId });
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    const messages = await query.getMany();

    return { messages, total };
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(messageId: string, portalUserId: string): Promise<SecureMessage> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, portalUserId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  /**
   * Send a message from client to attorney/staff
   */
  async sendMessage(
    portalUserId: string,
    data: {
      matterId?: string;
      subject: string;
      body: string;
      recipientId?: string;
      recipientType?: string;
      messageType?: string;
      attachments?: Array<{
        filename: string;
        url: string;
        size: number;
        mimeType: string;
        uploadedAt: string;
      }>;
    },
  ): Promise<SecureMessage> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    const message = this.messageRepository.create({
      portalUserId,
      matterId: data.matterId,
      subject: data.subject,
      body: data.body,
      attachments: data.attachments || [],
      read: false,
      senderId: portalUserId,
      senderType: 'client',
      recipientId: data.recipientId,
      recipientType: data.recipientType as any,
      messageType: (data.messageType as any) || 'general',
      status: 'sent',
      isEncrypted: true,
      sentAt: new Date(),
      createdBy: portalUserId,
    });

    return await this.messageRepository.save(message);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, portalUserId: string): Promise<SecureMessage> {
    const message = await this.getMessage(messageId, portalUserId);

    message.read = true;
    message.readAt = new Date();
    message.updatedBy = portalUserId;

    return await this.messageRepository.save(message);
  }

  /**
   * Mark multiple messages as read
   */
  async markMultipleAsRead(messageIds: string[], portalUserId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(SecureMessage)
      .set({ read: true, readAt: new Date(), updatedBy: portalUserId })
      .where('id IN (:...messageIds)', { messageIds })
      .andWhere('portal_user_id = :portalUserId', { portalUserId })
      .execute();
  }

  /**
   * Archive a message
   */
  async archiveMessage(messageId: string, portalUserId: string): Promise<SecureMessage> {
    const message = await this.getMessage(messageId, portalUserId);

    message.isArchived = true;
    message.archivedAt = new Date();
    message.updatedBy = portalUserId;

    return await this.messageRepository.save(message);
  }

  /**
   * Get message thread
   */
  async getMessageThread(threadId: string, portalUserId: string): Promise<SecureMessage[]> {
    return await this.messageRepository.find({
      where: { threadId, portalUserId },
      order: { sentAt: 'ASC' },
    });
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(portalUserId: string): Promise<number> {
    return await this.messageRepository.count({
      where: {
        portalUserId,
        read: false,
        isArchived: false,
      },
    });
  }

  /**
   * Reply to a message
   */
  async replyToMessage(
    messageId: string,
    portalUserId: string,
    data: {
      body: string;
      attachments?: Array<{
        filename: string;
        url: string;
        size: number;
        mimeType: string;
        uploadedAt: string;
      }>;
    },
  ): Promise<SecureMessage> {
    const originalMessage = await this.getMessage(messageId, portalUserId);

    const reply = this.messageRepository.create({
      portalUserId,
      matterId: originalMessage.matterId,
      subject: `Re: ${originalMessage.subject}`,
      body: data.body,
      attachments: data.attachments || [],
      read: false,
      senderId: portalUserId,
      senderType: 'client',
      recipientId: originalMessage.senderId,
      recipientType: originalMessage.senderType as any,
      messageType: originalMessage.messageType,
      status: 'sent',
      isEncrypted: true,
      parentMessageId: messageId,
      threadId: originalMessage.threadId || messageId,
      sentAt: new Date(),
      createdBy: portalUserId,
    });

    return await this.messageRepository.save(reply);
  }

  /**
   * Search messages
   */
  async searchMessages(
    portalUserId: string,
    searchTerm: string,
    filters?: {
      matterId?: string;
      messageType?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<SecureMessage[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.portal_user_id = :portalUserId', { portalUserId })
      .andWhere('message.is_archived = :isArchived', { isArchived: false })
      .andWhere(
        '(LOWER(message.subject) LIKE LOWER(:searchTerm) OR LOWER(message.body) LIKE LOWER(:searchTerm))',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('message.sent_at', 'DESC');

    if (filters?.matterId) {
      query.andWhere('message.matter_id = :matterId', { matterId: filters.matterId });
    }

    if (filters?.messageType) {
      query.andWhere('message.message_type = :messageType', { messageType: filters.messageType });
    }

    if (filters?.dateFrom) {
      query.andWhere('message.sent_at >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      query.andWhere('message.sent_at <= :dateTo', { dateTo: filters.dateTo });
    }

    return await query.getMany();
  }
}
