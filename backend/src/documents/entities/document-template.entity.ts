import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { LegalDocumentCategory } from './document-classification.entity';

/**
 * Template Status
 */
export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

/**
 * Variable Type for template fields
 */
export enum VariableType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  ADDRESS = 'address',
  PARTY = 'party',
  CURRENCY = 'currency',
}

/**
 * Template Variable Definition
 */
export interface TemplateVariable {
  name: string;
  label: string;
  type: VariableType;
  required: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  description?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
  conditional?: {
    dependsOn: string;
    showWhen: unknown;
  };
}

/**
 * DocumentTemplate Entity
 * Reusable document templates with variable substitution
 *
 * Features:
 * - Rich template content with variable placeholders
 * - Variable definitions with validation
 * - Jurisdiction-specific templates
 * - Version control
 * - Category-based organization
 */
@Entity('document_templates')
@Index(['name'])
@Index(['category'])
@Index(['status'])
@Index(['jurisdiction'])
export class DocumentTemplate extends BaseEntity {
  @ApiProperty({ example: 'Motion to Dismiss - Federal', description: 'Template name' })
  @Column()
  name!: string;

  @ApiProperty({ description: 'Template description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Document category',
    enum: LegalDocumentCategory
  })
  @Column({
    type: 'enum',
    enum: LegalDocumentCategory,
  })
  category!: LegalDocumentCategory;

  @ApiProperty({ description: 'Template content with {{variable}} placeholders' })
  @Column({ type: 'text' })
  content!: string;

  @ApiProperty({ description: 'Template variables configuration' })
  @Column({ type: 'jsonb' })
  variables!: TemplateVariable[];

  @ApiProperty({ description: 'Jurisdiction(s) this template is valid for' })
  @Column({ type: 'simple-array', nullable: true })
  jurisdiction?: string[];

  @ApiProperty({ description: 'Practice area(s)' })
  @Column({ name: 'practice_areas', type: 'simple-array', nullable: true })
  practiceAreas?: string[];

  @ApiProperty({ description: 'Court level (federal, state, district)' })
  @Column({ name: 'court_level', nullable: true })
  courtLevel?: string;

  @ApiProperty({ description: 'Template status' })
  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.DRAFT,
  })
  status!: TemplateStatus;

  @ApiProperty({ description: 'Template version' })
  @Column({ name: 'template_version', default: '1.0.0' })
  templateVersion!: string;

  @ApiProperty({ description: 'Output format' })
  @Column({ name: 'output_format', default: 'docx' })
  outputFormat!: 'docx' | 'pdf' | 'html' | 'markdown';

  @ApiProperty({ description: 'Styling/formatting options' })
  @Column({ name: 'formatting_options', type: 'jsonb', nullable: true })
  formattingOptions?: {
    fontSize?: number;
    fontFamily?: string;
    lineSpacing?: number;
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    pageSize?: 'letter' | 'legal' | 'a4';
    orientation?: 'portrait' | 'landscape';
  };

  @ApiProperty({ description: 'Header template' })
  @Column({ type: 'text', nullable: true })
  header?: string;

  @ApiProperty({ description: 'Footer template' })
  @Column({ type: 'text', nullable: true })
  footer?: string;

  @ApiProperty({ description: 'Template tags for search/filtering' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Template creator' })
  @Column({ name: 'created_by_id', type: 'uuid' })
  @Index()
  createdById!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdByUser!: User;

  @ApiProperty({ description: 'Last template updater' })
  @Column({ name: 'updated_by_id', type: 'uuid', nullable: true })
  updatedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedByUser?: User;

  @ApiProperty({ description: 'Usage count' })
  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount!: number;

  @ApiProperty({ description: 'Last used timestamp' })
  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @ApiProperty({ description: 'Preview thumbnail path' })
  @Column({ name: 'thumbnail_path', nullable: true })
  thumbnailPath?: string;

  @ApiProperty({ description: 'Is this a system template?' })
  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean;

  @ApiProperty({ description: 'Is this template shared organization-wide?' })
  @Column({ name: 'is_shared', type: 'boolean', default: false })
  isShared!: boolean;

  @ApiProperty({ description: 'Organization ID if shared' })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: string;

  @ApiProperty({ description: 'Parent template ID if this is a derivative' })
  @Column({ name: 'parent_template_id', type: 'uuid', nullable: true })
  parentTemplateId?: string;

  @ManyToOne(() => DocumentTemplate, { nullable: true })
  @JoinColumn({ name: 'parent_template_id' })
  parentTemplate?: DocumentTemplate;

  @ApiProperty({ description: 'Sections/components for complex templates' })
  @Column({ type: 'jsonb', nullable: true })
  sections?: Array<{
    id: string;
    name: string;
    content: string;
    order: number;
    optional: boolean;
  }>;

  @ApiProperty({ description: 'Conditional logic rules' })
  @Column({ name: 'conditional_logic', type: 'jsonb', nullable: true })
  conditionalLogic?: Array<{
    condition: string;
    action: 'show' | 'hide' | 'require';
    target: string;
  }>;

  @ApiProperty({ description: 'Validation rules' })
  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules?: Record<string, unknown>;

  @ApiProperty({ description: 'Additional template metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
