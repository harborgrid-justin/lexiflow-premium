import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkflowTemplatesTable1766069900000 implements MigrationInterface {
    name = 'AddWorkflowTemplatesTable1766069900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create workflow category enum
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."workflow_templates_category_enum" AS ENUM('CASE_MANAGEMENT', 'DISCOVERY', 'LITIGATION', 'TRANSACTION', 'COMPLIANCE', 'OTHER');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create workflow_templates table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workflow_templates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "category" "public"."workflow_templates_category_enum" NOT NULL,
                "stages" jsonb NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdBy" character varying,
                "usageCount" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_workflow_templates" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "workflow_templates"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."workflow_templates_category_enum"`);
    }
}
