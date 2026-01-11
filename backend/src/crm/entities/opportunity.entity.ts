import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("crm_opportunities")
export class Opportunity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "client_id" })
  clientId!: string;

  @Column()
  title!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  value!: number;

  @Column({
    type: "enum",
    enum: [
      "Lead",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Closed Won",
      "Closed Lost",
    ],
    default: "Lead",
  })
  stage!: string;

  @Column("int", { default: 0 })
  probability!: number;

  @Column({ name: "expected_close_date", type: "date", nullable: true })
  expectedCloseDate!: string;

  @Column({ name: "assigned_to", nullable: true })
  assignedTo!: string;

  @Column({ name: "practice_area", nullable: true })
  practiceArea!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
