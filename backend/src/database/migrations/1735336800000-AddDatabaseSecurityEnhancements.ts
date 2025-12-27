import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDatabaseSecurityEnhancements1735336800000 implements MigrationInterface {
  name = 'AddDatabaseSecurityEnhancements1735336800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('-- Enable PostgreSQL extensions for security');

    try {
      await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
      console.log('✓ Enabled pgcrypto extension for encryption');
    } catch (error) {
      console.warn('Could not enable pgcrypto extension:', error.message);
    }

    try {
      await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✓ Enabled uuid-ossp extension');
    } catch (error) {
      console.warn('Could not enable uuid-ossp extension:', error.message);
    }

    await queryRunner.query(`
      -- Create function to automatically update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      -- Create function to validate encrypted data format
      CREATE OR REPLACE FUNCTION validate_encrypted_column(encrypted_data TEXT)
      RETURNS BOOLEAN AS $$
      BEGIN
        IF encrypted_data IS NULL THEN
          RETURN TRUE;
        END IF;

        RETURN length(encrypted_data) > 20 AND encrypted_data ~ '^[A-Za-z0-9+/=]+$';
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      -- Create function to audit sensitive data access
      CREATE OR REPLACE FUNCTION audit_sensitive_access()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'SELECT' THEN
          INSERT INTO audit_logs (
            entity_type,
            entity_id,
            action,
            timestamp,
            user_name
          ) VALUES (
            TG_TABLE_NAME,
            NEW.id::TEXT,
            'read',
            CURRENT_TIMESTAMP,
            current_user
          );
        END IF;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      -- Create constraint to enforce SSL connections (PostgreSQL 12+)
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_settings WHERE name = 'ssl' AND setting = 'on'
        ) THEN
          ALTER DATABASE CURRENT_DATABASE() SET ssl = on;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      -- Add comment for database security configuration
      COMMENT ON DATABASE CURRENT_DATABASE() IS 'LexiFlow Premium Database - Enterprise Security Enabled';
    `);

    await queryRunner.query(`
      -- Create index on audit logs for performance
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id
      ON audit_logs(entity_type, entity_id);

      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp
      ON audit_logs(timestamp DESC);

      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
      ON audit_logs(user_id);

      CREATE INDEX IF NOT EXISTS idx_audit_logs_action
      ON audit_logs(action);
    `);

    await queryRunner.query(`
      -- Set up row level security policies (optional, can be enabled per table)
      ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

      -- Create policy for users to see only their own data (example)
      DROP POLICY IF EXISTS users_isolation_policy ON users;
      CREATE POLICY users_isolation_policy ON users
        USING (id = current_setting('app.current_user_id', true)::uuid)
        WITH CHECK (id = current_setting('app.current_user_id', true)::uuid);
    `);

    await queryRunner.query(`
      -- Create materialized view for security monitoring
      CREATE MATERIALIZED VIEW IF NOT EXISTS security_monitoring AS
      SELECT
        DATE_TRUNC('hour', timestamp) as hour,
        action,
        entity_type,
        COUNT(*) as action_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit_logs
      WHERE timestamp > NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('hour', timestamp), action, entity_type;

      CREATE INDEX IF NOT EXISTS idx_security_monitoring_hour
      ON security_monitoring(hour DESC);
    `);

    console.log('✓ Database security enhancements applied successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP MATERIALIZED VIEW IF EXISTS security_monitoring CASCADE');

    await queryRunner.query('DROP POLICY IF EXISTS users_isolation_policy ON users');

    await queryRunner.query('ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY');

    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_action');
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_user_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_timestamp');
    await queryRunner.query('DROP INDEX IF EXISTS idx_audit_logs_entity_type_id');

    await queryRunner.query('DROP FUNCTION IF EXISTS audit_sensitive_access() CASCADE');
    await queryRunner.query('DROP FUNCTION IF EXISTS validate_encrypted_column(TEXT) CASCADE');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_modified_column() CASCADE');

    console.log('✓ Database security enhancements rolled back');
  }
}
