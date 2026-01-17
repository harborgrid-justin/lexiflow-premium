import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("properties")
export class Property {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  rpuid: string; // Real Property Unique Identifier

  @Column({ nullable: true })
  address: string;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  assessedValue: number;

  @Column({ nullable: true })
  propertyType: string;

  @Column({ default: "Active" })
  status: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
