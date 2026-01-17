import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhase2Modules1737153876543 implements MigrationInterface {
  name = "AddPhase2Modules1737153876543";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create properties table
    await queryRunner.query(`
            CREATE TABLE "properties" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "rpuid" character varying,
                "address" character varying,
                "assessedValue" numeric(15,2),
                "propertyType" character varying,
                "status" character varying NOT NULL DEFAULT 'Active',
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_properties" PRIMARY KEY ("id")
            )
        `);

    // Create rules table
    await queryRunner.query(`
            CREATE TABLE "rules" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "category" character varying NOT NULL,
                "conditions" jsonb NOT NULL,
                "actions" jsonb NOT NULL,
                "priority" integer NOT NULL DEFAULT '0',
                "isActive" boolean NOT NULL DEFAULT true,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_rules" PRIMARY KEY ("id")
            )
        `);

    // Create daf_operations table
    await queryRunner.query(`
            CREATE TABLE "daf_operations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "operationType" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'Active',
                "classification" character varying,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_daf_operations" PRIMARY KEY ("id")
            )
        `);

    // Create practice_areas table
    await queryRunner.query(`
            CREATE TABLE "practice_areas" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "specializations" text,
                "isActive" boolean NOT NULL DEFAULT true,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_practice_areas" PRIMARY KEY ("id")
            )
        `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_properties_rpuid" ON "properties" ("rpuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rules_category" ON "rules" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rules_isActive" ON "rules" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_daf_operations_status" ON "daf_operations" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_practice_areas_name" ON "practice_areas" ("name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_practice_areas_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_daf_operations_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_rules_isActive"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_rules_category"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_properties_rpuid"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "practice_areas"`);
    await queryRunner.query(`DROP TABLE "daf_operations"`);
    await queryRunner.query(`DROP TABLE "rules"`);
    await queryRunner.query(`DROP TABLE "properties"`);
  }
}
