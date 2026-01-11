import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("crm_client_relationships")
export class ClientRelationship {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "client_id" })
  clientId!: string;

  @Column({ name: "related_client_id" })
  relatedClientId!: string;

  @Column({ name: "related_client_name" })
  relatedClientName!: string;

  @Column({
    name: "relationship_type",
    type: "enum",
    enum: ["Parent", "Subsidiary", "Partner", "Competitor", "Vendor"],
  })
  relationshipType!: string;

  @Column("int", { default: 1 })
  strength!: number;

  @Column({ type: "text", nullable: true })
  notes!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
