import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ClientType, ClientStatus } from '../dto/create-client.dto';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: ClientType, nullable: true })
  type: ClientType;

  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.ACTIVE })
  status: ClientStatus;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  primaryContact: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  portalToken: string;

  @Column({ type: 'timestamp', nullable: true })
  portalTokenExpiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
