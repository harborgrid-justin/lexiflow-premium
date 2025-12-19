import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCreatedByUpdatedBy1766151200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if users table has created_by and updated_by columns
    const usersTable = await queryRunner.getTable('users');
    
    if (usersTable && !usersTable.findColumnByName('created_by')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'created_by',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (usersTable && !usersTable.findColumnByName('updated_by')) {
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
    const usersTable = await queryRunner.getTable('users');
    
    if (usersTable && usersTable.findColumnByName('updated_by')) {
      await queryRunner.dropColumn('users', 'updated_by');
    }

    if (usersTable && usersTable.findColumnByName('created_by')) {
      await queryRunner.dropColumn('users', 'created_by');
    }
  }
}
