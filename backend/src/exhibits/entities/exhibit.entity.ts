import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ExhibitType, ExhibitStatus } from '../dto/create-exhibit.dto';

@Entity('trial_exhibits')
export class Exhibit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  exhibitNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({ type: 'enum', enum: ExhibitType, name: 'exhibitType' })
  type: ExhibitType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ExhibitStatus, default: ExhibitStatus.DRAFT })
  status: ExhibitStatus;

  @Column({ type: 'uuid' })
  caseId: string;

  @Column({ type: 'uuid', nullable: true })
  documentId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  offeredBy: string;

  @Column({ type: 'date', nullable: true })
  dateOffered: Date;

  @Column({ type: 'date', nullable: true })
  dateAdmitted: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  admittedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
