import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHRTables1765996836059 implements MigrationInterface {
    name = 'AddHRTables1765996836059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."time_off_requests_type_enum" AS ENUM('Vacation', 'Sick', 'Personal', 'Unpaid')`);
        await queryRunner.query(`CREATE TYPE "public"."time_off_requests_status_enum" AS ENUM('Pending', 'Approved', 'Denied', 'Cancelled')`);
        await queryRunner.query(`CREATE TABLE "time_off_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employeeId" uuid NOT NULL, "type" "public"."time_off_requests_type_enum" NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "reason" text, "status" "public"."time_off_requests_status_enum" NOT NULL DEFAULT 'Pending', "approvedBy" character varying, "approvedAt" TIMESTAMP, "denialReason" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d2dc15201117320068bbc641715" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."employees_role_enum" AS ENUM('Partner', 'Senior Associate', 'Associate', 'Paralegal', 'Legal Assistant', 'Intern')`);
        await queryRunner.query(`CREATE TYPE "public"."employees_status_enum" AS ENUM('Active', 'On Leave', 'Terminated')`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "role" "public"."employees_role_enum" NOT NULL, "department" character varying, "phone" character varying, "hireDate" TIMESTAMP, "status" "public"."employees_status_enum" NOT NULL DEFAULT 'Active', "billingRate" numeric(10,2), "targetBillableHours" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "time_off_requests" ADD CONSTRAINT "FK_0cf85f4d0030faff30be5cdd734" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "time_off_requests" DROP CONSTRAINT "FK_0cf85f4d0030faff30be5cdd734"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."employees_role_enum"`);
        await queryRunner.query(`DROP TABLE "time_off_requests"`);
        await queryRunner.query(`DROP TYPE "public"."time_off_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."time_off_requests_type_enum"`);
    }

}
