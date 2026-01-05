import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateWorkflowInstancesAndTenantConfigs1766500000000 implements MigrationInterface {
  name = "CreateWorkflowInstancesAndTenantConfigs1766500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create workflow_instances table
    await queryRunner.createTable(
      new Table({
        name: "workflow_instances",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "template_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "case_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "running", "paused", "completed", "cancelled", "failed"],
            default: "'pending'",
          },
          {
            name: "current_step",
            type: "int",
            default: 0,
          },
          {
            name: "step_data",
            type: "json",
            isNullable: true,
          },
          {
            name: "started_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "completed_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "paused_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "cancelled_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_by",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "error_message",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create foreign key for template_id
    await queryRunner.createForeignKey(
      "workflow_instances",
      new TableForeignKey({
        columnNames: ["template_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "workflow_templates",
        onDelete: "CASCADE",
      })
    );

    // Create indexes for workflow_instances
    await queryRunner.createIndex(
      "workflow_instances",
      new TableIndex({
        name: "IDX_workflow_instances_template_id",
        columnNames: ["template_id"],
      })
    );

    await queryRunner.createIndex(
      "workflow_instances",
      new TableIndex({
        name: "IDX_workflow_instances_case_id",
        columnNames: ["case_id"],
      })
    );

    await queryRunner.createIndex(
      "workflow_instances",
      new TableIndex({
        name: "IDX_workflow_instances_status",
        columnNames: ["status"],
      })
    );

    // Create tenant_configs table
    await queryRunner.createTable(
      new Table({
        name: "tenant_configs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "tenant_id",
            type: "varchar",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "features",
            type: "json",
            isNullable: false,
          },
          {
            name: "limits",
            type: "json",
            isNullable: false,
          },
          {
            name: "branding",
            type: "json",
            isNullable: false,
          },
          {
            name: "settings",
            type: "json",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create index for tenant_id
    await queryRunner.createIndex(
      "tenant_configs",
      new TableIndex({
        name: "IDX_tenant_configs_tenant_id",
        columnNames: ["tenant_id"],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex("tenant_configs", "IDX_tenant_configs_tenant_id");
    await queryRunner.dropIndex("workflow_instances", "IDX_workflow_instances_status");
    await queryRunner.dropIndex("workflow_instances", "IDX_workflow_instances_case_id");
    await queryRunner.dropIndex("workflow_instances", "IDX_workflow_instances_template_id");

    // Drop foreign key
    const table = await queryRunner.getTable("workflow_instances");
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("template_id") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("workflow_instances", foreignKey);
    }

    // Drop tables
    await queryRunner.dropTable("tenant_configs");
    await queryRunner.dropTable("workflow_instances");
  }
}
