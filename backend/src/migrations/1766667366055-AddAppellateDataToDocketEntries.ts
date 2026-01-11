import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppellateDataToDocketEntries1766667366055 implements MigrationInterface {
  name = "AddAppellateDataToDocketEntries1766667366055";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "docket_entries" ADD "appellate_data" jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "docket_entries" DROP COLUMN "appellate_data"`
    );
  }
}
