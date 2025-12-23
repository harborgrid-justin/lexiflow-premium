import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDeletedAtToTrustAccounts1766443000000 implements MigrationInterface {
    name = 'AddDeletedAtToTrustAccounts1766443000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists (may have been created but with wrong name)
        const table = await queryRunner.getTable('trust_accounts');
        const hasDeletedAt = table?.columns.some(col => col.name === 'deletedAt');
        const hasDeletedAtSnake = table?.columns.some(col => col.name === 'deleted_at');

        if (!hasDeletedAt && !hasDeletedAtSnake) {
            // Column doesn't exist, create it
            await queryRunner.addColumn('trust_accounts', new TableColumn({
                name: 'deletedAt',
                type: 'timestamp',
                isNullable: true,
                default: null
            }));
        } else if (hasDeletedAtSnake && !hasDeletedAt) {
            // Rename from snake_case to camelCase (if previous migration used wrong name)
            await queryRunner.renameColumn('trust_accounts', 'deleted_at', 'deletedAt');
        }

        console.log('[Migration] ✅ trust_accounts.deletedAt column is now available');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('trust_accounts');
        const hasDeletedAt = table?.columns.some(col => col.name === 'deletedAt');

        if (hasDeletedAt) {
            await queryRunner.dropColumn('trust_accounts', 'deletedAt');
        }
    }
}
