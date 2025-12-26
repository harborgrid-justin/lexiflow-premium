import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDraftingTables1735246800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create drafting_templates table
    await queryRunner.createTable(
      new Table({
        name: 'drafting_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'draft'",
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'variables',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'clause_references',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'jurisdiction',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'practice_area',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'court_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_by',
            type: 'uuid',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'usage_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'parent_template_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for drafting_templates
    await queryRunner.createIndex(
      'drafting_templates',
      new TableIndex({
        name: 'IDX_DRAFTING_TEMPLATES_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'drafting_templates',
      new TableIndex({
        name: 'IDX_DRAFTING_TEMPLATES_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'drafting_templates',
      new TableIndex({
        name: 'IDX_DRAFTING_TEMPLATES_IS_PUBLIC',
        columnNames: ['is_public'],
      }),
    );

    await queryRunner.createIndex(
      'drafting_templates',
      new TableIndex({
        name: 'IDX_DRAFTING_TEMPLATES_JURISDICTION',
        columnNames: ['jurisdiction'],
      }),
    );

    // Create foreign key for created_by
    await queryRunner.createForeignKey(
      'drafting_templates',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create generated_documents table
    await queryRunner.createTable(
      new Table({
        name: 'generated_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'template_id',
            type: 'uuid',
          },
          {
            name: 'case_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'draft'",
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'variable_values',
            type: 'jsonb',
          },
          {
            name: 'included_clauses',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
          },
          {
            name: 'reviewed_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'approval_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'word_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'page_count',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'file_path',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pdf_path',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for generated_documents
    await queryRunner.createIndex(
      'generated_documents',
      new TableIndex({
        name: 'IDX_GENERATED_DOCUMENTS_TEMPLATE_ID',
        columnNames: ['template_id'],
      }),
    );

    await queryRunner.createIndex(
      'generated_documents',
      new TableIndex({
        name: 'IDX_GENERATED_DOCUMENTS_CASE_ID',
        columnNames: ['case_id'],
      }),
    );

    await queryRunner.createIndex(
      'generated_documents',
      new TableIndex({
        name: 'IDX_GENERATED_DOCUMENTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'generated_documents',
      new TableIndex({
        name: 'IDX_GENERATED_DOCUMENTS_CREATED_BY',
        columnNames: ['created_by'],
      }),
    );

    // Create foreign keys for generated_documents
    await queryRunner.createForeignKey(
      'generated_documents',
      new TableForeignKey({
        columnNames: ['template_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'drafting_templates',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'generated_documents',
      new TableForeignKey({
        columnNames: ['case_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cases',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'generated_documents',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'generated_documents',
      new TableForeignKey({
        columnNames: ['reviewed_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop generated_documents table (foreign keys drop automatically)
    await queryRunner.dropTable('generated_documents');
    
    // Drop drafting_templates table (foreign keys drop automatically)
    await queryRunner.dropTable('drafting_templates');
  }
}
