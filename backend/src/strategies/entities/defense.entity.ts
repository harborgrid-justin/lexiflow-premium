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

@Entity("defenses")
export class Defense {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column()
  category!: string; // Affirmative, Procedural, Factual

  @Column({ default: "Draft" })
  status!: string;

  @Column({ name: "case_id" })
  caseId!: string;

  @ManyToOne(() => Case, { onDelete: "CASCADE" })
  @JoinColumn({ name: "case_id" })
  case!: Case;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
