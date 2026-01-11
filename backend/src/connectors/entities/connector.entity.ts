import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum ConnectorType {
  DATABASE = "Database",
  WAREHOUSE = "Warehouse",
  SAAS = "SaaS",
  STORAGE = "Storage",
}

export enum ConnectorStatus {
  HEALTHY = "Healthy",
  SYNCING = "Syncing",
  ERROR = "Error",
  INACTIVE = "Inactive",
}

@Entity("connectors")
export class Connector {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "enum", enum: ConnectorType })
  type!: ConnectorType;

  @Column()
  provider!: string;

  @Column({ name: "connection_string", nullable: true })
  connectionString!: string;

  @Column({
    type: "enum",
    enum: ConnectorStatus,
    default: ConnectorStatus.INACTIVE,
  })
  status!: ConnectorStatus;

  @Column({ type: "timestamp", nullable: true, name: "last_sync" })
  lastSync!: Date;

  @Column({ type: "jsonb", nullable: true })
  configuration!: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
