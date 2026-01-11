import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Case } from "../../cases/entities/case.entity";

@Entity("legal_arguments")
export class LegalArgument {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column({ default: "Draft" })
  status: string;

  @Column({ type: "int", default: 0 })
  strength: number; // 0-100?

  @Column({ name: "case_id" })
  caseId: string;

  @ManyToOne(() => Case, { onDelete: "CASCADE" })
  @JoinColumn({ name: "case_id" })
  case: Case;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
