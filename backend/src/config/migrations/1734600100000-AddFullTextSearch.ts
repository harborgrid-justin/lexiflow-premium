import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFullTextSearch1734600100000 implements MigrationInterface {
    name = 'AddFullTextSearch1734600100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add tsvector columns for full-text search
        await queryRunner.query(`
            ALTER TABLE "cases" 
            ADD COLUMN search_vector tsvector 
            GENERATED ALWAYS AS (
                to_tsvector('english', 
                    coalesce(title, '') || ' ' || 
                    coalesce(case_number, '') || ' ' || 
                    coalesce(description, '')
                )
            ) STORED
        `);

        await queryRunner.query(`
            ALTER TABLE "documents" 
            ADD COLUMN search_vector tsvector 
            GENERATED ALWAYS AS (
                to_tsvector('english', 
                    coalesce(title, '') || ' ' || 
                    coalesce(description, '') || ' ' || 
                    coalesce(author, '')
                )
            ) STORED
        `);

        await queryRunner.query(`
            ALTER TABLE "parties" 
            ADD COLUMN search_vector tsvector 
            GENERATED ALWAYS AS (
                to_tsvector('english', 
                    coalesce(name, '') || ' ' || 
                    coalesce(organization, '') || ' ' || 
                    coalesce(email, '')
                )
            ) STORED
        `);

        // Create GIN indexes for full-text search
        await queryRunner.query(`CREATE INDEX "idx_cases_fulltext" ON "cases" USING GIN(search_vector)`);
        await queryRunner.query(`CREATE INDEX "idx_documents_fulltext" ON "documents" USING GIN(search_vector)`);
        await queryRunner.query(`CREATE INDEX "idx_parties_fulltext" ON "parties" USING GIN(search_vector)`);

        // Add GIN indexes for array columns
        await queryRunner.query(`
            CREATE INDEX "idx_documents_tags_gin" 
            ON "documents" USING GIN(tags)
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_evidence_tags_gin" 
            ON "evidence" USING GIN(tags) 
            WHERE tags IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop GIN indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_evidence_tags_gin"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_documents_tags_gin"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_parties_fulltext"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_documents_fulltext"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_cases_fulltext"`);

        // Drop tsvector columns
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN IF EXISTS search_vector`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS search_vector`);
        await queryRunner.query(`ALTER TABLE "cases" DROP COLUMN IF EXISTS search_vector`);
    }
}
