import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'json' })
  participants: string[];

  @Column({ nullable: true })
  caseId: string;

  @Column({ default: false })
  isGroup: boolean;

  @Column({ nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @Column()
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @Column({ nullable: true })
  replyTo: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
