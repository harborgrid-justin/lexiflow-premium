import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddFederalLitigationFields1734912000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to cases table for federal litigation docket tracking
    await queryRunner.addColumns('cases', [
      new TableColumn({
        name: 'referred_judge',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
      new TableColumn({
        name: 'magistrate_judge',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
      new TableColumn({
        name: 'date_terminated',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'jury_demand',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
      new TableColumn({
        name: 'cause_of_action',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
      new TableColumn({
        name: 'nature_of_suit',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'nature_of_suit_code',
        type: 'varchar',
        length: '10',
        isNullable: true,
      }),
      new TableColumn({
        name: 'related_cases',
        type: 'jsonb',
        isNullable: true,
      }),
    ]);

    // Add new columns to parties table for attorney representation tracking
    await queryRunner.addColumns('parties', [
      new TableColumn({
        name: 'description',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
      new TableColumn({
        name: 'attorney_firm',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'attorney_email',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'attorney_phone',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
      new TableColumn({
        name: 'attorney_address',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'attorney_fax',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
      new TableColumn({
        name: 'is_lead_attorney',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'is_attorney_to_be_noticed',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'is_pro_se',
        type: 'boolean',
        default: false,
      }),
    ]);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cases_nature_of_suit_code" ON "cases" ("nature_of_suit_code");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cases_date_terminated" ON "cases" ("date_terminated");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_parties_is_lead_attorney" ON "parties" ("is_lead_attorney");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_parties_is_pro_se" ON "parties" ("is_pro_se");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_parties_is_pro_se"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_parties_is_lead_attorney"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cases_date_terminated"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_cases_nature_of_suit_code"`);

    // Remove columns from parties table
    await queryRunner.dropColumn('parties', 'is_pro_se');
    await queryRunner.dropColumn('parties', 'is_attorney_to_be_noticed');
    await queryRunner.dropColumn('parties', 'is_lead_attorney');
    await queryRunner.dropColumn('parties', 'attorney_fax');
    await queryRunner.dropColumn('parties', 'attorney_address');
    await queryRunner.dropColumn('parties', 'attorney_phone');
    await queryRunner.dropColumn('parties', 'attorney_email');
    await queryRunner.dropColumn('parties', 'attorney_firm');
    await queryRunner.dropColumn('parties', 'description');

    // Remove columns from cases table
    await queryRunner.dropColumn('cases', 'related_cases');
    await queryRunner.dropColumn('cases', 'nature_of_suit_code');
    await queryRunner.dropColumn('cases', 'nature_of_suit');
    await queryRunner.dropColumn('cases', 'cause_of_action');
    await queryRunner.dropColumn('cases', 'jury_demand');
    await queryRunner.dropColumn('cases', 'date_terminated');
    await queryRunner.dropColumn('cases', 'magistrate_judge');
    await queryRunner.dropColumn('cases', 'referred_judge');
  }
}
