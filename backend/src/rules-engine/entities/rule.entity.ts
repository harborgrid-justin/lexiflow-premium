import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("rules")
export class Rule {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ type: "jsonb" })
  conditions: Record<string, any>;

  @Column({ type: "jsonb" })
  actions: Record<string, any>;

  @Column({ type: "int", default: 0 })
  priority: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
