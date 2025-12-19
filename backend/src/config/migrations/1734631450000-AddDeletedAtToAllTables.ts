import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToAllTables1734631450000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deletedAt column to core tables that actually exist
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
      'tasks',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove deletedAt column from tables
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
      'tasks',
    ];

    for (const table of tables) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "deletedAt"`);
    }
  }
}
