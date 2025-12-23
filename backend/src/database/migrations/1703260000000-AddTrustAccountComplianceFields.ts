import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * AddTrustAccountComplianceFields Migration
 * 
 * Adds all compliance fields to trust_accounts and trust_transactions tables
 * to meet state bar requirements for attorney trust account management.
 * 
 * Run: npm run migration:run
 * Revert: npm run migration:revert
 */
export class AddTrustAccountComplianceFields1703260000000 implements MigrationInterface {
  name = 'AddTrustAccountComplianceFields1703260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // PART 1: Trust Accounts Table - Compliance Fields
    // ============================================

    // Account Setup and Structure Compliance
    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'state_bar_approved',
        type: 'boolean',
        isNullable: true,
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'jurisdiction',
        type: 'varchar',
        length: '10',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'iolta_program_id',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'overdraft_reporting_enabled',
        type: 'boolean',
        isNullable: true,
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'account_title_compliant',
        type: 'boolean',
        isNullable: true,
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'client_consent_for_location',
        type: 'boolean',
        isNullable: true,
        default: false,
      }),
    );

    // Recordkeeping and Documentation Compliance
    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'last_reconciled_date',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'reconciliation_status',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'next_reconciliation_due',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'record_retention_years',
        type: 'int',
        isNullable: true,
        default: 7,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'check_number_range_start',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'check_number_range_current',
        type: 'int',
        isNullable: true,
      }),
    );

    // Signatory Control Compliance
    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'authorized_signatories',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_accounts',
      new TableColumn({
        name: 'primary_signatory',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // ============================================
    // PART 2: Trust Transactions Table - Compliance Fields
    // ============================================

    // Deposit and Withdrawal Rules Compliance
    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'funds_received_date',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'prompt_deposit_compliant',
        type: 'boolean',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'is_advanced_fee',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'is_earned_fee',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'transaction_source',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'is_operating_fund_transfer',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'check_voided',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'payment_method_compliant',
        type: 'boolean',
        default: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'signatory_authorized',
        type: 'boolean',
        isNullable: true,
      }),
    );

    // Reconciliation Compliance
    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'bank_statement_date',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'cleared_date',
        type: 'date',
        isNullable: true,
      }),
    );

    // Communication and Disputed Funds Compliance
    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'client_notified',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'client_notified_date',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'disputed_amount',
        type: 'decimal',
        precision: 15,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'dispute_reason',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'dispute_resolved_date',
        type: 'date',
        isNullable: true,
      }),
    );

    // Record Retention Compliance
    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'retention_expiry_date',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trust_transactions',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // ============================================
    // PART 3: Data Migration for Existing Records
    // ============================================

    // Set default compliance values for existing trust accounts
    await queryRunner.query(`
      UPDATE trust_accounts
      SET 
        account_title_compliant = (
          account_name ILIKE '%trust account%' OR 
          account_name ILIKE '%escrow account%'
        ),
        record_retention_years = 7,
        reconciliation_status = 'pending'
      WHERE deleted_at IS NULL
    `);

    // Set next reconciliation due dates (first of next month)
    await queryRunner.query(`
      UPDATE trust_accounts
      SET next_reconciliation_due = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      WHERE deleted_at IS NULL 
        AND status = 'Active'
        AND next_reconciliation_due IS NULL
    `);

    // Mark all existing transactions as compliant (assume historical compliance)
    await queryRunner.query(`
      UPDATE trust_transactions
      SET 
        prompt_deposit_compliant = TRUE,
        payment_method_compliant = TRUE,
        client_notified = TRUE,
        signatory_authorized = TRUE
      WHERE deleted_at IS NULL
    `);

    // Calculate retention expiry dates for existing transactions (7 years)
    await queryRunner.query(`
      UPDATE trust_transactions
      SET retention_expiry_date = transaction_date + INTERVAL '7 years'
      WHERE deleted_at IS NULL 
        AND retention_expiry_date IS NULL
    `);

    // Update TrustAccountStatus enum to match new values
    await queryRunner.query(`
      UPDATE trust_accounts 
      SET status = 'Suspended' 
      WHERE status = 'Frozen'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert status changes
    await queryRunner.query(`
      UPDATE trust_accounts 
      SET status = 'Frozen' 
      WHERE status = 'Suspended'
    `);

    // Drop trust_transactions columns
    await queryRunner.dropColumn('trust_transactions', 'deleted_at');
    await queryRunner.dropColumn('trust_transactions', 'retention_expiry_date');
    await queryRunner.dropColumn('trust_transactions', 'dispute_resolved_date');
    await queryRunner.dropColumn('trust_transactions', 'dispute_reason');
    await queryRunner.dropColumn('trust_transactions', 'disputed_amount');
    await queryRunner.dropColumn('trust_transactions', 'client_notified_date');
    await queryRunner.dropColumn('trust_transactions', 'client_notified');
    await queryRunner.dropColumn('trust_transactions', 'cleared_date');
    await queryRunner.dropColumn('trust_transactions', 'bank_statement_date');
    await queryRunner.dropColumn('trust_transactions', 'signatory_authorized');
    await queryRunner.dropColumn('trust_transactions', 'payment_method_compliant');
    await queryRunner.dropColumn('trust_transactions', 'check_voided');
    await queryRunner.dropColumn('trust_transactions', 'is_operating_fund_transfer');
    await queryRunner.dropColumn('trust_transactions', 'transaction_source');
    await queryRunner.dropColumn('trust_transactions', 'is_earned_fee');
    await queryRunner.dropColumn('trust_transactions', 'is_advanced_fee');
    await queryRunner.dropColumn('trust_transactions', 'prompt_deposit_compliant');
    await queryRunner.dropColumn('trust_transactions', 'funds_received_date');

    // Drop trust_accounts columns
    await queryRunner.dropColumn('trust_accounts', 'primary_signatory');
    await queryRunner.dropColumn('trust_accounts', 'authorized_signatories');
    await queryRunner.dropColumn('trust_accounts', 'check_number_range_current');
    await queryRunner.dropColumn('trust_accounts', 'check_number_range_start');
    await queryRunner.dropColumn('trust_accounts', 'record_retention_years');
    await queryRunner.dropColumn('trust_accounts', 'next_reconciliation_due');
    await queryRunner.dropColumn('trust_accounts', 'reconciliation_status');
    await queryRunner.dropColumn('trust_accounts', 'last_reconciled_date');
    await queryRunner.dropColumn('trust_accounts', 'client_consent_for_location');
    await queryRunner.dropColumn('trust_accounts', 'account_title_compliant');
    await queryRunner.dropColumn('trust_accounts', 'overdraft_reporting_enabled');
    await queryRunner.dropColumn('trust_accounts', 'iolta_program_id');
    await queryRunner.dropColumn('trust_accounts', 'jurisdiction');
    await queryRunner.dropColumn('trust_accounts', 'state_bar_approved');
  }
}
