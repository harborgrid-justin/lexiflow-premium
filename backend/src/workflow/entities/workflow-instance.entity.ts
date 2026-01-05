import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { WorkflowTemplate } from "./workflow-template.entity";

export enum WorkflowInstanceStatus {
  PENDING = "pending",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

@Entity("workflow_instances")
export class WorkflowInstance {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "template_id" })
  templateId!: string;

  @ManyToOne(() => WorkflowTemplate, { onDelete: "CASCADE" })
  @JoinColumn({ name: "template_id" })
  template?: WorkflowTemplate;

  @Column({ name: "case_id" })
  caseId!: string;

  @Column({
    type: "enum",
    enum: WorkflowInstanceStatus,
    default: WorkflowInstanceStatus.PENDING,
  })
  status!: WorkflowInstanceStatus;

  @Column({ name: "current_step", type: "int", default: 0 })
  currentStep!: number;

  @Column({ type: "json", nullable: true })
  stepData?: Record<string, unknown>;

  @Column({ name: "started_at", type: "timestamp", nullable: true })
  startedAt?: Date;

  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt?: Date;

  @Column({ name: "paused_at", type: "timestamp", nullable: true })
  pausedAt?: Date;

  @Column({ name: "cancelled_at", type: "timestamp", nullable: true })
  cancelledAt?: Date;

  @Column({ name: "created_by", nullable: true })
  createdBy?: string;

  @Column({ name: "error_message", type: "text", nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
