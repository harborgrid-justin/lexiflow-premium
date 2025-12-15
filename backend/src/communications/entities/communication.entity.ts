import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('communications')
export class Communication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  caseId: string;

  @Column()
  type: string;

  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column()
  sender: string;

  @Column('jsonb')
  recipients: string[];

  @Column({ default: 'draft' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
