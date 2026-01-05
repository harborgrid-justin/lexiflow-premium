import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export interface TenantFeatures {
  caseManagement: boolean;
  discovery: boolean;
  legalResearch: boolean;
  billing: boolean;
  documentManagement: boolean;
  compliance: boolean;
  analytics: boolean;
  workflow: boolean;
}

export interface TenantLimits {
  maxUsers: number;
  maxCases: number;
  maxStorage: number; // in GB
}

export interface TenantBranding {
  primaryColor: string;
  logoUrl: string | null;
  companyName: string;
}

export interface TenantSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
}

@Entity("tenant_configs")
export class TenantConfig {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tenant_id", unique: true })
  tenantId!: string;

  @Column()
  name!: string;

  @Column({ type: "json" })
  features!: TenantFeatures;

  @Column({ type: "json" })
  limits!: TenantLimits;

  @Column({ type: "json" })
  branding!: TenantBranding;

  @Column({ type: "json" })
  settings!: TenantSettings;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
