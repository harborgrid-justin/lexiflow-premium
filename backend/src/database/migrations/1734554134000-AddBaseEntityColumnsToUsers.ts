import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBaseEntityColumnsToUsers1734554134000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns exist before adding them
    const table = await queryRunner.getTable('users');
    
    if (table && !table.findColumnByName('created_at')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        }),
      );
    }

    if (table && !table.findColumnByName('updated_at')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        }),
      );
    }

    if (table && !table.findColumnByName('deleted_at')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'deleted_at',
          type: 'timestamp',
          isNullable: true,
          default: null,
        }),
      );
    }

    if (table && !table.findColumnByName('created_by')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'created_by',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (table && !table.findColumnByName('updated_by')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'updated_by',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');
    
    if (table) {
      if (table.findColumnByName('created_at')) {
        await queryRunner.dropColumn('users', 'created_at');
      }
      if (table.findColumnByName('updated_at')) {
        await queryRunner.dropColumn('users', 'updated_at');
      }
      if (table.findColumnByName('deleted_at')) {
        await queryRunner.dropColumn('users', 'deleted_at');
      }
      if (table.findColumnByName('created_by')) {
        await queryRunner.dropColumn('users', 'created_by');
      }
      if (table.findColumnByName('updated_by')) {
        await queryRunner.dropColumn('users', 'updated_by');
      }
    }
  }
}
