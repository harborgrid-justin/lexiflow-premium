import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WitnessPrepStatus } from '../dto/create-witness-prep.dto';

@Entity('witness_prep_sessions')
export class WitnessPrepSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  witnessName: string;

  @Column()
  caseId: string;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'enum', enum: WitnessPrepStatus, default: WitnessPrepStatus.SCHEDULED })
  status: WitnessPrepStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  conductedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
