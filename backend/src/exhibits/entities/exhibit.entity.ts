import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ExhibitType, ExhibitStatus } from '../dto/create-exhibit.dto';

@Entity('exhibits')
export class Exhibit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  exhibitNumber: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ExhibitType })
  type: ExhibitType;

  @Column({ type: 'enum', enum: ExhibitStatus, default: ExhibitStatus.DRAFT })
  status: ExhibitStatus;

  @Column()
  caseId: string;

  @Column({ nullable: true })
  documentId: string;

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  custodian: string;

  @Column({ type: 'timestamp', nullable: true })
  admissionDate: Date;

  @Column({ nullable: true })
  admittedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
