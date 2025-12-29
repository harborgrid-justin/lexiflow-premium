import {
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
  TableUnique,
  TableCheck,
} from 'typeorm';

/**
 * Migration Helper Utilities
 *
 * Provides utilities for creating clean, maintainable database migrations
 */

/**
 * Column definition shortcuts
 */
export const ColumnTypes = {
  /**
   * UUID primary key column
   */
  uuid: (name: string = 'id'): TableColumn => {
    return new TableColumn({
      name,
      type: 'uuid',
      isPrimary: true,
      default: 'uuid_generate_v4()',
    });
  },

  /**
   * Auto-increment integer primary key
   */
  serial: (name: string = 'id'): TableColumn => {
    return new TableColumn({
      name,
      type: 'serial',
      isPrimary: true,
    });
  },

  /**
   * Timestamp with timezone (created_at)
   */
  createdAt: (): TableColumn => {
    return new TableColumn({
      name: 'created_at',
      type: 'timestamp with time zone',
      default: 'CURRENT_TIMESTAMP',
      isNullable: false,
    });
  },

  /**
   * Timestamp with timezone (updated_at)
   */
  updatedAt: (): TableColumn => {
    return new TableColumn({
      name: 'updated_at',
      type: 'timestamp with time zone',
      default: 'CURRENT_TIMESTAMP',
      isNullable: false,
    });
  },

  /**
   * Soft delete timestamp
   */
  deletedAt: (): TableColumn => {
    return new TableColumn({
      name: 'deleted_at',
      type: 'timestamp with time zone',
      isNullable: true,
    });
  },

  /**
   * Created by user (UUID foreign key)
   */
  createdBy: (): TableColumn => {
    return new TableColumn({
      name: 'created_by',
      type: 'uuid',
      isNullable: true,
    });
  },

  /**
   * Updated by user (UUID foreign key)
   */
  updatedBy: (): TableColumn => {
    return new TableColumn({
      name: 'updated_by',
      type: 'uuid',
      isNullable: true,
    });
  },

  /**
   * Version column for optimistic locking
   */
  version: (): TableColumn => {
    return new TableColumn({
      name: 'version',
      type: 'integer',
      default: 1,
      isNullable: false,
    });
  },

  /**
   * String column
   */
  string: (name: string, length: number = 255, nullable: boolean = true): TableColumn => {
    return new TableColumn({
      name,
      type: 'varchar',
      length: length.toString(),
      isNullable: nullable,
    });
  },

  /**
   * Text column
   */
  text: (name: string, nullable: boolean = true): TableColumn => {
    return new TableColumn({
      name,
      type: 'text',
      isNullable: nullable,
    });
  },

  /**
   * Integer column
   */
  integer: (name: string, nullable: boolean = true): TableColumn => {
    return new TableColumn({
      name,
      type: 'integer',
      isNullable: nullable,
    });
  },

  /**
   * Decimal column (for money)
   */
  decimal: (
    name: string,
    precision: number = 10,
    scale: number = 2,
    nullable: boolean = true,
  ): TableColumn => {
    return new TableColumn({
      name,
      type: 'decimal',
      precision,
      scale,
      isNullable: nullable,
    });
  },

  /**
   * Boolean column
   */
  boolean: (name: string, defaultValue: boolean = false): TableColumn => {
    return new TableColumn({
      name,
      type: 'boolean',
      default: defaultValue,
      isNullable: false,
    });
  },

  /**
   * Date column
   */
  date: (name: string, nullable: boolean = true): TableColumn => {
    return new TableColumn({
      name,
      type: 'date',
      isNullable: nullable,
    });
  },

  /**
   * Timestamp column
   */
  timestamp: (name: string, nullable: boolean = true): TableColumn => {
    return new TableColumn({
      name,
      type: 'timestamp with time zone',
      isNullable: nullable,
    });
  },

  /**
   * JSONB column
   */
  jsonb: (name: string, nullable: boolean = true): TableColumn => {
    return new TableColumn({
      name,
      type: 'jsonb',
      isNullable: nullable,
    });
  },

  /**
   * Array column
   */
  array: (name: string, arrayType: string = 'text', nullable: boolean = true): TableColumn => {
    return new TableColumn({
      name,
      type: arrayType,
      isArray: true,
      isNullable: nullable,
    });
  },

  /**
   * Enum column
   */
  enum: (name: string, enumName: string, nullable: boolean = false): TableColumn => {
    return new TableColumn({
      name,
      type: enumName,
      isNullable: nullable,
    });
  },

  /**
   * Foreign key UUID column
   */
  foreignKey: (name: string, nullable: boolean = true): TableColumn => {
    return new TableColumn({
      name,
      type: 'uuid',
      isNullable: nullable,
    });
  },
};

/**
 * Create a standard table with base columns
 */
export async function createBaseTable(
  queryRunner: QueryRunner,
  tableName: string,
  additionalColumns: TableColumn[] = [],
): Promise<void> {
  await queryRunner.createTable(
    new Table({
      name: tableName,
      columns: [
        ColumnTypes.uuid('id'),
        ...additionalColumns,
        ColumnTypes.createdAt(),
        ColumnTypes.updatedAt(),
        ColumnTypes.deletedAt(),
        ColumnTypes.createdBy(),
        ColumnTypes.updatedBy(),
        ColumnTypes.version(),
      ],
      indices: [
        new TableIndex({
          name: `IDX_${tableName}_created_at`,
          columnNames: ['created_at'],
        }),
        new TableIndex({
          name: `IDX_${tableName}_deleted_at`,
          columnNames: ['deleted_at'],
        }),
        new TableIndex({
          name: `IDX_${tableName}_created_by`,
          columnNames: ['created_by'],
        }),
        new TableIndex({
          name: `IDX_${tableName}_updated_by`,
          columnNames: ['updated_by'],
        }),
        new TableIndex({
          name: `IDX_${tableName}_active_records`,
          columnNames: ['deleted_at', 'created_at'],
        }),
      ],
    }),
  );
}

/**
 * Add foreign key with standard naming convention
 */
export async function addForeignKey(
  queryRunner: QueryRunner,
  tableName: string,
  columnName: string,
  referencedTableName: string,
  referencedColumnName: string = 'id',
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' = 'CASCADE',
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' = 'CASCADE',
): Promise<void> {
  await queryRunner.createForeignKey(
    tableName,
    new TableForeignKey({
      name: `FK_${tableName}_${columnName}_${referencedTableName}`,
      columnNames: [columnName],
      referencedTableName,
      referencedColumnNames: [referencedColumnName],
      onDelete,
      onUpdate,
    }),
  );
}

/**
 * Create an index with standard naming
 */
export async function createIndex(
  queryRunner: QueryRunner,
  tableName: string,
  columnNames: string[],
  unique: boolean = false,
  where?: string,
): Promise<void> {
  const indexType = unique ? 'UNIQUE' : 'IDX';
  const indexName = `${indexType}_${tableName}_${columnNames.join('_')}`;

  await queryRunner.createIndex(
    tableName,
    new TableIndex({
      name: indexName,
      columnNames,
      isUnique: unique,
      where,
    }),
  );
}

/**
 * Create a composite unique constraint
 */
export async function createUniqueConstraint(
  queryRunner: QueryRunner,
  tableName: string,
  columnNames: string[],
): Promise<void> {
  await queryRunner.createUniqueConstraint(
    tableName,
    new TableUnique({
      name: `UQ_${tableName}_${columnNames.join('_')}`,
      columnNames,
    }),
  );
}

/**
 * Create a check constraint
 */
export async function createCheckConstraint(
  queryRunner: QueryRunner,
  tableName: string,
  name: string,
  expression: string,
): Promise<void> {
  await queryRunner.createCheckConstraint(
    tableName,
    new TableCheck({
      name: `CHK_${tableName}_${name}`,
      expression,
    }),
  );
}

/**
 * Create an enum type
 */
export async function createEnum(
  queryRunner: QueryRunner,
  enumName: string,
  values: string[],
): Promise<void> {
  const valuesList = values.map((v) => `'${v}'`).join(', ');
  await queryRunner.query(
    `CREATE TYPE ${enumName} AS ENUM (${valuesList})`,
  );
}

/**
 * Drop an enum type
 */
export async function dropEnum(
  queryRunner: QueryRunner,
  enumName: string,
): Promise<void> {
  await queryRunner.query(`DROP TYPE IF EXISTS ${enumName}`);
}

/**
 * Enable UUID extension
 */
export async function enableUuidExtension(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
}

/**
 * Enable pg_trgm extension (for text search)
 */
export async function enablePgTrgmExtension(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
}

/**
 * Create GIN index for full-text search
 */
export async function createFullTextIndex(
  queryRunner: QueryRunner,
  tableName: string,
  columnName: string,
): Promise<void> {
  await queryRunner.query(
    `CREATE INDEX IDX_${tableName}_${columnName}_gin ON ${tableName} USING gin (${columnName} gin_trgm_ops)`,
  );
}

/**
 * Create updated_at trigger
 */
export async function createUpdatedAtTrigger(
  queryRunner: QueryRunner,
  tableName: string,
): Promise<void> {
  // Create the function if it doesn't exist
  await queryRunner.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create the trigger
  await queryRunner.query(`
    CREATE TRIGGER update_${tableName}_updated_at
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

/**
 * Drop updated_at trigger
 */
export async function dropUpdatedAtTrigger(
  queryRunner: QueryRunner,
  tableName: string,
): Promise<void> {
  await queryRunner.query(`DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName}`);
}

/**
 * Add audit trigger for tracking changes
 */
export async function createAuditTrigger(
  queryRunner: QueryRunner,
  tableName: string,
): Promise<void> {
  // Create audit log table if it doesn't exist
  const auditTableExists = await queryRunner.hasTable('audit_log');

  if (!auditTableExists) {
    await queryRunner.createTable(
      new Table({
        name: 'audit_log',
        columns: [
          ColumnTypes.uuid('id'),
          ColumnTypes.string('table_name', 255, false),
          ColumnTypes.string('operation', 10, false),
          ColumnTypes.uuid('record_id'),
          ColumnTypes.jsonb('old_data'),
          ColumnTypes.jsonb('new_data'),
          ColumnTypes.uuid('changed_by'),
          ColumnTypes.createdAt(),
        ],
        indices: [
          new TableIndex({
            name: 'IDX_audit_log_table_name',
            columnNames: ['table_name'],
          }),
          new TableIndex({
            name: 'IDX_audit_log_record_id',
            columnNames: ['record_id'],
          }),
        ],
      }),
    );
  }

  // Create audit function
  await queryRunner.query(`
    CREATE OR REPLACE FUNCTION audit_trigger_func()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, record_id, new_data, changed_by)
        VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, row_to_json(NEW), NEW.created_by);
        RETURN NEW;
      ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, row_to_json(OLD), row_to_json(NEW), NEW.updated_by);
        RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_data, changed_by)
        VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, row_to_json(OLD), OLD.updated_by);
        RETURN OLD;
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger
  await queryRunner.query(`
    CREATE TRIGGER ${tableName}_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_func();
  `);
}

/**
 * Drop audit trigger
 */
export async function dropAuditTrigger(
  queryRunner: QueryRunner,
  tableName: string,
): Promise<void> {
  await queryRunner.query(`DROP TRIGGER IF EXISTS ${tableName}_audit_trigger ON ${tableName}`);
}

/**
 * Create a view
 */
export async function createView(
  queryRunner: QueryRunner,
  viewName: string,
  selectQuery: string,
): Promise<void> {
  await queryRunner.query(`CREATE VIEW ${viewName} AS ${selectQuery}`);
}

/**
 * Drop a view
 */
export async function dropView(
  queryRunner: QueryRunner,
  viewName: string,
): Promise<void> {
  await queryRunner.query(`DROP VIEW IF EXISTS ${viewName}`);
}

/**
 * Add a comment to a table
 */
export async function addTableComment(
  queryRunner: QueryRunner,
  tableName: string,
  comment: string,
): Promise<void> {
  await queryRunner.query(
    `COMMENT ON TABLE ${tableName} IS '${comment.replace(/'/g, "''")}'`,
  );
}

/**
 * Add a comment to a column
 */
export async function addColumnComment(
  queryRunner: QueryRunner,
  tableName: string,
  columnName: string,
  comment: string,
): Promise<void> {
  await queryRunner.query(
    `COMMENT ON COLUMN ${tableName}.${columnName} IS '${comment.replace(/'/g, "''")}'`,
  );
}

/**
 * Batch insert data
 */
export async function batchInsert(
  queryRunner: QueryRunner,
  tableName: string,
  data: Record<string, unknown>[],
  batchSize: number = 1000,
): Promise<void> {
  if (data.length === 0) return;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    if (batch.length === 0) continue;

    const firstRow = batch[0];
    if (!firstRow) continue;

    const columns = Object.keys(firstRow);
    const values = batch
      .map(
        (row) =>
          '(' +
          columns
            .map((col) => {
              const value = row[col];
              if (value === null || value === undefined) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
              return String(value);
            })
            .join(', ') +
          ')',
      )
      .join(', ');

    await queryRunner.query(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values}`,
    );
  }
}
