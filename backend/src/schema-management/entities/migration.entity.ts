import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('schema_migrations')
export class Migration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  up!: string;

  @Column({ type: 'text' })
  down!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  applied!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  appliedAt?: Date | null;

  @Column({ nullable: true })
  appliedBy?: string;
}
