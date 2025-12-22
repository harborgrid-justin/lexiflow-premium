import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessengerConversationDto, MessengerMessageDto, UpdateConversationDto } from './dto/messenger.dto';
import { GetContactsDto } from './dto/get-contacts.dto';

@Injectable()
export class MessengerService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createConversation(createDto: MessengerConversationDto): Promise<Conversation> {
    if (createDto.participants.length < 2) {
      throw new BadRequestException('Conversation must have at least 2 participants');
    }
    const conversation = this.conversationRepository.create(createDto);
    return await this.conversationRepository.save(conversation);
  }

  async getContacts(_userId: string, _query: GetContactsDto): Promise<{ data: any[]; total: number }> {
    // Mock implementation for now - in production this would query a users/contacts table

    // Return empty result set for now
    // TODO: Implement actual contact fetching from users table
    // In production: const { page = 1, limit = 50 } = query; skip = (page - 1) * limit for pagination
    return { data: [], total: 0 };
  }

  async findAllConversations(userId: string, query: any): Promise<{ data: Conversation[]; total: number }> {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    // Use jsonb_array_elements_text for JSONB array matching
    const [data, total] = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where("conversation.participants::jsonb @> :userId::jsonb", { userId: JSON.stringify([userId]) })
      .skip(skip)
      .take(limit)
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOneConversation(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({ where: { id } });
    if (!conversation) throw new NotFoundException(`Conversation ${id} not found`);
    return conversation;
  }

  async updateConversation(id: string, updateDto: UpdateConversationDto): Promise<Conversation> {
    await this.findOneConversation(id);
    await this.conversationRepository.update(id, updateDto);
    return await this.findOneConversation(id);
  }

  async deleteConversation(id: string): Promise<void> {
    const conversation = await this.findOneConversation(id);
    await this.messageRepository.delete({ conversationId: id });
    await this.conversationRepository.remove(conversation);
  }

  async sendMessage(createDto: MessengerMessageDto, senderId: string): Promise<Message> {
    await this.findOneConversation(createDto.conversationId);
    const message = this.messageRepository.create({
      conversationId: createDto.conversationId,
      content: createDto.content,
      senderId,
      sentAt: new Date(),
      messageType: 'text',
      readBy: [],
      readCount: 0,
      replyToId: createDto.replyTo,
      attachments: createDto.attachments?.map(url => ({ url })) || [],
    });
    const savedMessage = await this.messageRepository.save(message);

    // Update conversation with last message info
    await this.conversationRepository.update(createDto.conversationId, {
      lastMessageAt: new Date(),
      lastMessageText: createDto.content,
      lastMessageBy: senderId,
      lastMessageId: savedMessage.id,
      messageCount: () => 'messageCount + 1',
    });

    return savedMessage;
  }

  async getMessages(conversationId: string, query: any): Promise<{ data: Message[]; total: number }> {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.messageRepository.findAndCount({
      where: { conversationId, isDeleted: false },
      skip,
      take: limit,
      order: { sentAt: 'DESC' }
    });

    return { data, total };
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException(`Message ${messageId} not found`);

    // Add user to readBy array if not already present
    const readBy = message.readBy || [];
    const alreadyRead = readBy.some((r: any) => r.userId === userId);
    
    if (!alreadyRead) {
      readBy.push({ userId, readAt: new Date() });
      message.readBy = readBy;
      message.readCount = readBy.length;
      await this.messageRepository.save(message);
    }

    return message;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':userId = ANY(conversation.participants)', { userId })
      .getMany();

    const conversationIds = conversations.map(c => c.id);
    if (conversationIds.length === 0) return 0;

    // Count messages where the user is not in the readBy array
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId IN (:...ids)', { ids: conversationIds })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
      .getMany();

    return messages.filter(msg => {
      const readBy = msg.readBy || [];
      return !readBy.some((r: any) => r.userId === userId);
    }).length;
  }
}
