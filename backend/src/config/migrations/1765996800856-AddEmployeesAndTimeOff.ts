import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployeesAndTimeOff1765996800856 implements MigrationInterface {
    name = 'AddEmployeesAndTimeOff1765996800856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists before modifying
        const tableExists = await queryRunner.hasTable("calendar_events");
        if (tableExists) {
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_calendar_events_start_date"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_calendar_events_case_id"`);
            await queryRunner.query(`ALTER TABLE "calendar_events" DROP COLUMN IF EXISTS "eventType"`);
            await queryRunner.query(`CREATE TYPE "public"."calendar_events_eventtype_enum" AS ENUM('Hearing', 'Deadline', 'Meeting', 'Reminder', 'CourtDate', 'Filing')`);
            await queryRunner.query(`ALTER TABLE "calendar_events" ADD "eventType" "public"."calendar_events_eventtype_enum" NOT NULL DEFAULT 'Reminder'`);
            await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "completed" SET NOT NULL`);
            await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "createdAt" SET NOT NULL`);
            await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "createdAt" SET DEFAULT now()`);
            await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "updatedAt" SET NOT NULL`);
            await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "calendar_events" ALTER COLUMN "completed" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "calendar_events" DROP COLUMN "eventType"`);
        await queryRunner.query(`DROP TYPE "public"."calendar_events_eventtype_enum"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" ADD "eventType" character varying NOT NULL DEFAULT 'Reminder'`);
        await queryRunner.query(`CREATE INDEX "idx_calendar_events_case_id" ON "calendar_events" ("caseId") `);
        await queryRunner.query(`CREATE INDEX "idx_calendar_events_start_date" ON "calendar_events" ("startDate") `);
    }

}
