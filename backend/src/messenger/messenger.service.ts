import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from './entities/messenger.entity';
import { CreateConversationDto, CreateMessageDto, UpdateConversationDto } from './dto/messenger.dto';

@Injectable()
export class MessengerService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createConversation(createDto: CreateConversationDto): Promise<Conversation> {
    if (createDto.participants.length < 2) {
      throw new BadRequestException('Conversation must have at least 2 participants');
    }
    const conversation = this.conversationRepository.create(createDto);
    return await this.conversationRepository.save(conversation);
  }

  async findAllConversations(userId: string, query: any): Promise<{ data: Conversation[]; total: number }> {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':userId = ANY(conversation.participants)', { userId })
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

  async sendMessage(createDto: CreateMessageDto, senderId: string): Promise<Message> {
    await this.findOneConversation(createDto.conversationId);
    const message = this.messageRepository.create({
      ...createDto,
      senderId,
    });
    const savedMessage = await this.messageRepository.save(message);

    await this.conversationRepository.update(createDto.conversationId, {
      lastMessageAt: new Date(),
    });

    return savedMessage;
  }

  async getMessages(conversationId: string, query: any): Promise<{ data: Message[]; total: number }> {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return { data, total };
  }

  async markAsRead(messageId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException(`Message ${messageId} not found`);

    message.isRead = true;
    message.readAt = new Date();
    return await this.messageRepository.save(message);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':userId = ANY(conversation.participants)', { userId })
      .getMany();

    const conversationIds = conversations.map(c => c.id);
    if (conversationIds.length === 0) return 0;

    return await this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId IN (:...ids)', { ids: conversationIds })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isRead = :isRead', { isRead: false })
      .getCount();
  }
}
