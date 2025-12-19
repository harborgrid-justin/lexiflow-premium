import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCreatedByUpdatedByToAllTables1734631148000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // List of tables that extend BaseEntity and need created_by/updated_by columns
    const tables = [
      'cases',
      'clients',
      'documents',
      'document_versions',
      'clauses',
      'pleadings',
      'evidence_items',
      'conflict_checks',
      'parties',
      'docket_entries',
      'correspondence',
      'communications',
      'tasks',
      'time_entries',
      'billing_entries',
      'invoices',
      'payments',
    ];

    for (const tableName of tables) {
      const table = await queryRunner.getTable(tableName);
      
      if (table) {
        // Add created_by column if it doesn't exist
        if (!table.findColumnByName('created_by')) {
          await queryRunner.addColumn(
            tableName,
            new TableColumn({
              name: 'created_by',
              type: 'varchar',
              isNullable: true,
            }),
          );
        }

        // Add updated_by column if it doesn't exist
        if (!table.findColumnByName('updated_by')) {
          await queryRunner.addColumn(
            tableName,
            new TableColumn({
              name: 'updated_by',
              type: 'varchar',
              isNullable: true,
            }),
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'cases',
      'clients',
      'documents',
      'document_versions',
      'clauses',
      'pleadings',
      'evidence_items',
      'conflict_checks',
      'parties',
      'docket_entries',
      'correspondence',
      'communications',
      'tasks',
      'time_entries',
      'billing_entries',
      'invoices',
      'payments',
    ];

    for (const tableName of tables) {
      const table = await queryRunner.getTable(tableName);
      
      if (table) {
        // Drop updated_by column if it exists
        if (table.findColumnByName('updated_by')) {
          await queryRunner.dropColumn(tableName, 'updated_by');
        }

        // Drop created_by column if it exists
        if (table.findColumnByName('created_by')) {
          await queryRunner.dropColumn(tableName, 'created_by');
        }
      }
    }
  }
}
