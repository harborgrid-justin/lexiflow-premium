import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTasksColumnsToSnakeCase1734631500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename columns from camelCase to snake_case to match entity definitions
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "dueDate" TO "due_date"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "caseId" TO "case_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "assignedTo" TO "assigned_to"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "parentTaskId" TO "parent_task_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "estimatedHours" TO "estimated_hours"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "actualHours" TO "actual_hours"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "completionPercentage" TO "completion_percentage"`);
    
    // Drop old camelCase created_by if it exists (was named "createdBy")
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN IF EXISTS "createdBy"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the column renames
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "due_date" TO "dueDate"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "case_id" TO "caseId"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "assigned_to" TO "assignedTo"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "parent_task_id" TO "parentTaskId"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "estimated_hours" TO "estimatedHours"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "actual_hours" TO "actualHours"`);
    await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "completion_percentage" TO "completionPercentage"`);
  }
}
