import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCreatedByUpdatedByToUsers1766168343412 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if columns don't already exist before adding
        const table = await queryRunner.getTable('users');
        
        if (table && !table.findColumnByName('created_by')) {
            await queryRunner.addColumn('users', new TableColumn({
                name: 'created_by',
                type: 'varchar',
                isNullable: true,
            }));
        }
        
        if (table && !table.findColumnByName('updated_by')) {
            await queryRunner.addColumn('users', new TableColumn({
                name: 'updated_by',
                type: 'varchar',
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('users');
        
        if (table && table.findColumnByName('updated_by')) {
            await queryRunner.dropColumn('users', 'updated_by');
        }
        
        if (table && table.findColumnByName('created_by')) {
            await queryRunner.dropColumn('users', 'created_by');
        }
    }

}
